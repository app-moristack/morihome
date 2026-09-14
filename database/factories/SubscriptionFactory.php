<?php

namespace Database\Factories;

use App\Enums\SubscriptionCategory;
use App\Enums\SubscriptionTier;
use App\Models\Subscription;
use App\Models\Subscription;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Subscription>
 */
class SubscriptionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<Subscription>
     */
    protected $model = Subscription::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $category = fake()->randomElement(SubscriptionCategory::cases());
        $tier = fake()->randomElement(SubscriptionTier::cases());

        return [
            'category' => $category,
            'tier' => $tier,
            'slug' => Str::slug($category->value.'-'.$tier->value.'-'.fake()->unique()->word()),
            'name' => $category->label().' '.$tier->label(),
            'description' => fake()->sentence(),
            'price_rupees' => $tier === SubscriptionTier::Free ? 0 : fake()->numberBetween(499, 1199),
            'duration_months' => $tier === SubscriptionTier::Free ? null : 6,
            'active_item_limit' => fake()->numberBetween(1, 15),
            'photos_per_item_limit' => fake()->numberBetween(3, 15),
            'item_duration_months' => $category === SubscriptionCategory::Services ? null : 6,
            'business_verification_eligible' => $tier !== SubscriptionTier::Free,
            'priority_in_search' => $tier === SubscriptionTier::Pro,
            'featured_items' => $tier === SubscriptionTier::Pro,
            'homepage_exposure' => $tier === SubscriptionTier::Pro,
            'is_active' => true,
            'sort_order' => fake()->unique()->numberBetween(10, 65000),
        ];
    }
}
