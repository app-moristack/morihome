<?php

namespace Database\Factories;

use App\Models\ServiceCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ServiceCategoryFactory extends Factory
{
    protected $model = ServiceCategory::class;

    public function definition(): array
    {
        $name = Str::title(faker()->words(2));

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::random(5),
            'icon' => faker()->randomElement(['wrench', 'hammer', 'zap', 'droplets', 'sprout']),
            'is_active' => true,
            'is_popular' => false,
            'sort_order' => faker()->number(1, 500),
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}
