<?php

namespace App\Actions\Providers;

use App\Models\Provider;
use App\Models\ServiceCategory;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class SyncProviderServiceCategories
{
    public function handle(Provider $provider, array $categories): void
    {
        $normalized = $this->normalize($categories);

        $activeIds = ServiceCategory::query()
            ->whereIn('id', array_keys($normalized))
            ->where('is_active', true)
            ->pluck('id')
            ->all();

        if (count($activeIds) !== count($normalized)) {
            throw new UnprocessableEntityHttpException(__('provider.unknown_service_category'));
        }

        $provider->serviceCategories()->sync($normalized);
    }

    private function normalize(array $categories): array
    {
        $normalized = [];

        foreach ($categories as $index => $category) {
            $id = (int) (is_array($category) ? $category['id'] : $category);

            $normalized[$id] = [
                'specialty' => is_array($category) ? ($category['specialty'] ?? null) : null,
                'is_primary' => is_array($category)
                    ? (bool) ($category['is_primary'] ?? false)
                    : $index === 0,
            ];
        }

        return $normalized;
    }
}
