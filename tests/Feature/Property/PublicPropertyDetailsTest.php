<?php

namespace Tests\Feature\Property;

use App\Models\PropertyListing;
use App\Models\Provider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPropertyDetailsTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_details_include_ordered_photos_and_the_public_lister(): void
    {
        $provider = Provider::factory()->approved()->create();
        $listing = PropertyListing::factory()->for($provider)->create(['status' => 'published']);
        $listing->images()->createMany([
            ['path' => 'second.webp', 'sort_order' => 2],
            ['path' => 'first.webp', 'sort_order' => 1],
        ]);

        $this->getJson('/api/v1/properties/'.$listing->slug)
            ->assertOk()->assertJsonPath('data.id', $listing->id)
            ->assertJsonPath('data.provider.slug', $provider->slug)
            ->assertJsonPath('data.provider.profile_available', true)
            ->assertJsonCount(2, 'data.images')
            ->assertJsonPath('data.images.0.sort_order', 1);
    }

    public function test_unpublished_expired_deleted_and_inactive_listings_cannot_be_opened_directly(): void
    {
        $provider = Provider::factory()->approved()->create();
        foreach (['draft', 'archived', 'expired'] as $status) {
            $listing = PropertyListing::factory()->for($provider)->create(['status' => $status]);
            $this->getJson('/api/v1/properties/'.$listing->slug)->assertNotFound();
        }
        $listing = PropertyListing::factory()->for($provider)->create(['status' => 'published', 'expires_at' => now()->subDay()]);
        $this->getJson('/api/v1/properties/'.$listing->slug)->assertNotFound();
        $listing->forceFill(['expires_at' => now()->addMonth()])->save();
        $listing->membership->update(['ends_at' => now()->subDay()]);
        $this->getJson('/api/v1/properties/'.$listing->slug)->assertNotFound();
        $listing->membership->update(['starts_at' => now()->addDay(), 'ends_at' => now()->addMonth()]);
        $this->getJson('/api/v1/properties/'.$listing->slug)->assertNotFound();
        $listing->membership->update(['starts_at' => now()->subDay()]);
        $provider->forceFill(['is_active' => false])->save();
        $this->getJson('/api/v1/properties/'.$listing->slug)->assertNotFound();
        $provider->forceFill(['is_active' => true])->save();
        $listing->delete();
        $this->getJson('/api/v1/properties/'.$listing->slug)->assertNotFound();
        $this->getJson('/api/v1/properties/not-a-real-property')->assertNotFound();
    }

    public function test_profile_listings_are_paginated_and_only_belong_to_that_provider(): void
    {
        $provider = Provider::factory()->approved()->create();
        PropertyListing::factory()->for($provider)->count(13)->create(['status' => 'published']);
        PropertyListing::factory()->for($provider)->create(['status' => 'draft']);
        PropertyListing::factory()->create(['status' => 'published']);
        $this->getJson('/api/v1/providers/'.$provider->slug.'/properties')
            ->assertOk()->assertJsonCount(12, 'data')->assertJsonPath('meta.total', 13);
        $this->getJson('/api/v1/providers/'.$provider->slug.'/properties?page=2')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.provider.slug', $provider->slug);
        $this->getJson('/api/v1/providers/'.$provider->slug.'/properties?page=0')->assertUnprocessable();
        $provider->forceFill(['approval_status' => 'suspended'])->save();
        $this->getJson('/api/v1/providers/'.$provider->slug.'/properties')->assertNotFound();
    }
}
