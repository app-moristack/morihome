<?php

namespace Tests\Feature\Property;

use App\Enums\ProviderType;
use App\Models\Provider;
use App\Models\Subscription;
use App\Models\SubscriptionUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\Support\FakeImage;
use Tests\TestCase;

class PropertyListingEntitlementTest extends TestCase
{
    use RefreshDatabase;

    public function test_sales_plus_allows_only_three_active_sale_listings(): void
    {
        $provider = Provider::factory()->ofType(ProviderType::Agency)->create();
        $this->activate($provider, 'sales-plus');

        foreach (range(1, 3) as $number) {
            $this->loginAs($provider->user)
                ->postJson('/api/v1/provider/property-listings', $this->payload([
                    'title' => 'Sale property number '.$number,
                ]))
                ->assertCreated();
        }

        $this->loginAs($provider->user)
            ->postJson('/api/v1/provider/property-listings', $this->payload([
                'title' => 'Fourth sale property',
            ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('purpose');

        $this->assertDatabaseCount('property_listings', 3);
    }

    public function test_listing_creation_requires_an_active_matching_subscription(): void
    {
        $provider = Provider::factory()->ofType(ProviderType::Agency)->create();
        $this->activate($provider, 'rental-plus');

        $this->loginAs($provider->user)
            ->postJson('/api/v1/provider/property-listings', $this->payload())
            ->assertUnprocessable()
            ->assertJsonValidationErrors('purpose');

        $this->assertDatabaseCount('property_listings', 0);
    }

    public function test_sales_plus_allows_ten_photos_and_rejects_the_eleventh(): void
    {
        Storage::fake('public');
        $provider = Provider::factory()->ofType(ProviderType::Agency)->create();
        $membership = $this->activate($provider, 'sales-plus');
        $listing = $provider->propertyListings()->make([
            'purpose' => 'sales',
            'property_type' => 'house',
            'title' => 'Photo limit test property',
            'description' => 'A sufficiently detailed description for the test property listing.',
            'price_rupees' => 6500000,
            'address' => '10 Royal Road, Port Louis',
            'locality' => 'Port Louis',
            'latitude' => -20.1609,
            'longitude' => 57.5012,
        ]);
        $listing->forceFill([
            'subscription_user_id' => $membership->id,
            'slug' => 'photo-limit-test-property',
            'status' => 'draft',
        ])->save();
        $listing->images()->createMany(array_map(
            fn (int $number): array => [
                'path' => 'property-listings/existing-'.$number.'.webp',
                'sort_order' => $number * 10,
            ],
            range(1, 9),
        ));

        $this->loginAs($provider->user)
            ->postJson('/api/v1/provider/property-listings/'.$listing->slug.'/images', [
                'image' => FakeImage::upload('tenth.png', 1200, 800),
            ])
            ->assertCreated();

        $this->loginAs($provider->user)
            ->postJson('/api/v1/provider/property-listings/'.$listing->slug.'/images', [
                'image' => FakeImage::upload('eleventh.png', 1200, 800),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('image');

        $this->assertDatabaseCount('property_listing_images', 10);
    }

    public function test_public_search_returns_only_properties_with_a_current_subscription(): void
    {
        $activeProvider = Provider::factory()->ofType(ProviderType::Agency)->create();
        $this->activate($activeProvider, 'sales-plus');

        $this->loginAs($activeProvider->user)
            ->postJson('/api/v1/provider/property-listings', $this->payload())
            ->assertCreated();

        $expiredProvider = Provider::factory()->ofType(ProviderType::Agency)->create();
        $expiredMembership = SubscriptionUser::create([
            'user_id' => $expiredProvider->user_id,
            'subscription_id' => Subscription::query()->where('slug', 'sales-plus')->firstOrFail()->id,
            'starts_at' => now()->subYear(),
            'ends_at' => now()->subDay(),
        ]);
        $expiredListing = $expiredProvider->propertyListings()->make($this->payload([
            'title' => 'Expired membership property',
        ]));
        $expiredListing->forceFill([
            'subscription_user_id' => $expiredMembership->id,
            'slug' => 'expired-membership-property',
            'status' => 'published',
            'published_at' => now(),
        ])->save();

        $this->getJson('/api/v1/properties/search?purpose=sales')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Modern family home in Port Louis')
            ->assertJsonPath('data.0.photo_limit', 10);
    }

    public function test_featured_property_search_only_returns_plans_with_featured_placement(): void
    {
        $featuredProvider = Provider::factory()->ofType(ProviderType::Agency)->create();
        $this->activate($featuredProvider, 'sales-plus');
        $this->loginAs($featuredProvider->user)
            ->postJson('/api/v1/provider/property-listings', $this->payload([
                'title' => 'Featured sale property',
            ]))
            ->assertCreated();

        $standardProvider = Provider::factory()->ofType(ProviderType::Individual)->create();
        $this->activate($standardProvider, 'sales-free');
        $this->loginAs($standardProvider->user)
            ->postJson('/api/v1/provider/property-listings', $this->payload([
                'title' => 'Standard sale property',
            ]))
            ->assertCreated();

        $this->getJson('/api/v1/properties/search?purpose=sales&featured_only=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Featured sale property');
    }

    public function test_public_property_search_filters_by_type_and_maximum_budget(): void
    {
        $provider = Provider::factory()->ofType(ProviderType::Agency)->create();
        $this->activate($provider, 'sales-plus');

        $this->loginAs($provider->user)
            ->postJson('/api/v1/provider/property-listings', $this->payload([
                'title' => 'House within budget',
                'price_rupees' => 6500000,
            ]))
            ->assertCreated();
        $this->loginAs($provider->user)
            ->postJson('/api/v1/provider/property-listings', $this->payload([
                'property_type' => 'apartment',
                'title' => 'Apartment above budget',
                'price_rupees' => 8500000,
            ]))
            ->assertCreated();

        $this->getJson('/api/v1/properties/search?purpose=sales&property_type=house&max_price=7000000')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'House within budget');
    }

    private function activate(Provider $provider, string $slug): SubscriptionUser
    {
        $subscription = Subscription::query()->where('slug', $slug)->firstOrFail();

        return SubscriptionUser::create([
            'user_id' => $provider->user_id,
            'subscription_id' => $subscription->id,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addMonths(6),
        ]);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'purpose' => 'sales',
            'property_type' => 'house',
            'title' => 'Modern family home in Port Louis',
            'description' => 'A bright and spacious family home close to shops and public transport.',
            'price_rupees' => 6500000,
            'bedrooms' => 3,
            'bathrooms' => 2,
            'area_sqm' => 185,
            'is_furnished' => false,
            'address' => '10 Royal Road, Port Louis',
            'locality' => 'Port Louis',
            'latitude' => -20.1609,
            'longitude' => 57.5012,
        ], $overrides);
    }
}
