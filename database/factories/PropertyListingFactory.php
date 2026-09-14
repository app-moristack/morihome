<?php

namespace Database\Factories;

use App\Models\PropertyListing;
use App\Models\Provider;
use App\Models\Subscription;
use App\Models\SubscriptionUser;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PropertyListing>
 */
class PropertyListingFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<PropertyListing>
     */
    protected $model = PropertyListing::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(5);

        return [
            'provider_id' => Provider::factory(),
            'subscription_user_id' => function (array $attributes): int {
                $provider = Provider::query()->findOrFail($attributes['provider_id']);
                $subscription = Subscription::query()->where('slug', 'rental-free')->firstOrFail();

                return SubscriptionUser::create([
                    'user_id' => $provider->user_id,
                    'subscription_id' => $subscription->id,
                    'starts_at' => now()->subDay(),
                    'ends_at' => now()->addMonths(6),
                ])->id;
            },
            'purpose' => 'rental',
            'property_type' => fake()->randomElement(['house', 'apartment', 'villa', 'land']),
            'title' => $title,
            'slug' => Str::slug($title).'-'.Str::lower(Str::random(6)),
            'description' => fake()->paragraphs(2, true),
            'price_rupees' => fake()->numberBetween(15000, 15000000),
            'bedrooms' => fake()->numberBetween(1, 5),
            'bathrooms' => fake()->numberBetween(1, 4),
            'area_sqm' => fake()->randomFloat(2, 40, 500),
            'is_furnished' => fake()->boolean(),
            'address' => fake()->streetAddress(),
            'locality' => 'Port Louis',
            'latitude' => -20.1609,
            'longitude' => 57.5012,
            'status' => 'draft',
            'expires_at' => now()->addMonths(6),
        ];
    }
}
