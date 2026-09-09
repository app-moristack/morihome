<?php

namespace Database\Factories;

use App\Models\Provider;
use App\Models\ProviderPortfolioImage;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProviderPortfolioImageFactory extends Factory
{
    protected $model = ProviderPortfolioImage::class;

    public function definition(): array
    {
        return [
            'provider_id' => Provider::factory(),
            'path' => 'providers/demo/'.Str::random(12).'.webp',
            'caption' => Str::ucfirst(faker()->words(4)),
            'width' => 1200,
            'height' => 800,
            'sort_order' => faker()->number(1, 200),
        ];
    }
}
