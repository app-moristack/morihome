<?php

namespace Tests\Feature\Property;

use App\Models\PropertyListing;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertySearchSortingTest extends TestCase
{
    use RefreshDatabase;

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
