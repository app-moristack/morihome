<?php

namespace Tests\Feature\Property;

use App\Models\PropertyListing;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertySearchSortingTest extends TestCase
{
    use RefreshDatabase;

    public function test_featured_properties_lead_every_sort_without_bypassing_filters_or_pagination(): void
    {
        $plain = PropertyListing::factory()->create(['status' => 'published', 'locality' => 'Albion', 'price_rupees' => 10000, 'published_at' => now()]);
        PropertyListing::factory()->count(24)->create([
            'provider_id' => $plain->provider_id, 'subscription_user_id' => $plain->subscription_user_id,
            'status' => 'published', 'locality' => 'Albion', 'price_rupees' => 12000, 'published_at' => now(),
        ]);
        $featured = PropertyListing::factory()->create(['status' => 'published', 'locality' => 'Albion', 'price_rupees' => 50000, 'published_at' => now()->subMonth()]);
        $featured->membership->update(['subscription_id' => Subscription::where('slug', 'rental-pro')->firstOrFail()->id]);
        PropertyListing::factory()->create([
            'provider_id' => $featured->provider_id, 'subscription_user_id' => $featured->subscription_user_id,
            'status' => 'published', 'locality' => 'Curepipe', 'price_rupees' => 20000,
        ]);
        foreach (['newest', 'price_asc', 'price_desc'] as $sort) {
            $url = '/api/v1/properties/search?purpose=rental&location=Albion&sort='.$sort;
            $this->getJson($url)->assertOk()->assertJsonPath('meta.total', 26)
                ->assertJsonPath('data.0.id', $featured->id)->assertJsonCount(24, 'data');
            $this->assertNotContains($featured->id, $this->getJson($url.'&page=2')->assertOk()->json('data.*.id'));
            $this->getJson($url.'&max_price=15000')->assertOk()->assertJsonPath('meta.total', 25);
        }
    }

    public function test_price_sorting_orders_the_entire_filtered_population_before_pagination(): void
    {
        $first = PropertyListing::factory()->create(['status' => 'published', 'price_rupees' => 25000, 'published_at' => now()->subDay()]);
        foreach (range(1, 24) as $price) {
            PropertyListing::factory()->create([
                'provider_id' => $first->provider_id,
                'subscription_user_id' => $first->subscription_user_id,
                'status' => 'published',
                'price_rupees' => $price * 1000,
                'published_at' => now(),
            ]);
        }
        PropertyListing::factory()->create(['status' => 'draft', 'price_rupees' => 1]);
        $ascending = $this->getJson('/api/v1/properties/search?purpose=rental&sort=price_asc')->assertOk();
        $this->assertSame(range(1000, 24000, 1000), array_column($ascending->json('data'), 'price_rupees'));
        $this->getJson('/api/v1/properties/search?purpose=rental&sort=price_asc&page=2')
            ->assertOk()->assertJsonPath('data.0.id', $first->id);
        $descending = $this->getJson('/api/v1/properties/search?purpose=rental&sort=price_desc')->assertOk();
        $this->assertSame(range(25000, 2000, -1000), array_column($descending->json('data'), 'price_rupees'));
        $this->getJson('/api/v1/properties/search?purpose=rental&sort=newest&page=2')
            ->assertOk()->assertJsonPath('data.0.id', $first->id);
        $this->getJson('/api/v1/properties/search?sort=invalid')->assertUnprocessable()->assertJsonValidationErrors('sort');
    }
}
