<?php

namespace App\Actions\Providers;

use App\Models\Provider;

class CalculateProfileCompleteness
{
    private const REQUIRED = ['provider_type', 'name', 'phone', 'address', 'locality', 'latitude', 'longitude'];

    private const RECOMMENDED = ['whatsapp_phone', 'email', 'description', 'logo_path', 'cover_path', 'service_areas'];

    public function handle(Provider $provider): array
    {
        $missingRequired = $this->missingRequirements($provider);
        $missingRecommended = $this->missingOf($provider, self::RECOMMENDED);

        if (! $provider->portfolioImages()->exists()) {
            $missingRecommended[] = 'portfolio_images';
        }

        $totalWeighted = count(self::REQUIRED) + count(self::RECOMMENDED) + 1;
        $completed = $totalWeighted - count($missingRequired) - count($missingRecommended);

        return [
            'percentage' => (int) round($completed / $totalWeighted * 100),
            'missing_required' => array_values($missingRequired),
            'missing_recommended' => array_values($missingRecommended),
        ];
    }

    public function missingRequirements(Provider $provider): array
    {
        $missing = $this->missingOf($provider, self::REQUIRED);

        if (! $provider->serviceCategories()->exists()) {
            $missing[] = 'service_categories';
        }

        return $missing;
    }

    private function missingOf(Provider $provider, array $fields): array
    {
        return array_values(array_filter($fields, fn (string $field) => blank($provider->{$field})));
    }
}
