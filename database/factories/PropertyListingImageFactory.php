<?php

namespace Database\Factories;

use App\Models\PropertyListing;
use App\Models\PropertyListingImage;
use App\Models\PropertyListingImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PropertyListingImage>
 */
class PropertyListingImageFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<PropertyListingImage>
     */
    protected $model = PropertyListingImage::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'property_listing_id' => PropertyListing::factory(),
            'path' => 'property-listings/'.fake()->uuid().'.webp',
            'caption' => fake()->sentence(),
            'width' => 1200,
            'height' => 800,
            'sort_order' => 10,
        ];
    }
}
