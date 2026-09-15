<?php

namespace Tests\Feature\Property;

use App\Models\PropertyListing;
use Database\Seeders\DemoPropertySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemoPropertySeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeds_twenty_searchable_properties_per_purpose_with_valid_memberships(): void
    {
        $this->freezeTime();

        $this->seed(DemoPropertySeeder::class);

        $this->getJson('/api/v1/properties/search?purpose=rental')
            ->assertOk()->assertJsonPath('meta.total', 20)->assertJsonCount(20, 'data');
        $this->getJson('/api/v1/properties/search?purpose=sales')
            ->assertOk()->assertJsonPath('meta.total', 20)->assertJsonCount(20, 'data');

        foreach (PropertyListing::with('provider.user', 'membership.subscription')->get() as $listing) {
            $this->assertTrue($listing->membership->isActive());
            $this->assertSame($listing->purpose, $listing->membership->subscription->category);
            $this->assertSame($listing->provider->user_id, $listing->membership->user_id);
            $this->assertTrue($listing->provider->user->hasRole('provider'));
            $this->assertLessThanOrEqual(
                $listing->membership->subscription->active_item_limit,
                PropertyListing::where('subscription_user_id', $listing->subscription_user_id)->count(),
            );
        }
    }

    public function test_rerunning_seeder_does_not_duplicate_properties_or_owners(): void
    {
        $this->seed(DemoPropertySeeder::class);
        $listing = PropertyListing::where('purpose', 'rental')->firstOrFail();
        $listing->delete();

        $this->seed(DemoPropertySeeder::class);

        $this->assertDatabaseCount('property_listings', 40);
        $this->assertDatabaseCount('providers', 2);
        $this->assertDatabaseCount('users', 2);
        $this->assertDatabaseCount('subscription_user', 4);
        $this->assertDatabaseHas('property_listings', ['id' => $listing->id, 'deleted_at' => null]);
    }
}
