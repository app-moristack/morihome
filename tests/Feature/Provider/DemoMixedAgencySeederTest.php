<?php

namespace Tests\Feature\Provider;

use App\Models\Provider;
use Database\Seeders\DemoMixedAgencySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DemoMixedAgencySeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_agency_has_services_properties_and_photos_and_can_be_reseeded(): void
    {
        Storage::fake('public');
        $this->seed(DemoMixedAgencySeeder::class);
        $this->seed(DemoMixedAgencySeeder::class);
        $provider = Provider::query()->where('slug', 'morihome-demo-agency')->with(['serviceCategories', 'propertyListings.images', 'portfolioImages'])->firstOrFail();
        $this->assertTrue($provider->isPubliclyVisible());
        $this->assertCount(4, $provider->serviceCategories);
        $this->assertCount(6, $provider->propertyListings);
        $this->assertCount(4, $provider->portfolioImages);
        $this->assertSame(3, $provider->propertyListings()->where('purpose', 'rental')->count());
        $this->assertSame(3, $provider->propertyListings()->where('purpose', 'sales')->count());
        foreach ($provider->propertyListings as $listing) {
            $this->assertCount(2, $listing->images);
            foreach ($listing->images as $image) {
                Storage::disk('public')->assertExists($image->path);
            }
            $this->getJson('/api/v1/properties/'.$listing->slug)->assertOk();
        }
        $this->getJson('/api/v1/providers/'.$provider->slug)->assertOk()->assertJsonCount(4, 'data.service_categories');
        $this->getJson('/api/v1/providers/'.$provider->slug.'/properties')->assertOk()->assertJsonCount(6, 'data');
    }
}
