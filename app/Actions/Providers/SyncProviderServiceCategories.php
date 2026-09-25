<?php

namespace App\Actions\Providers;

use App\Models\Provider;
use App\Models\ServiceCategory;
use App\Support\SubscriptionEntitlements;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class SyncProviderServiceCategories
{
    public function __construct(private readonly SubscriptionEntitlements $entitlements) {}

    public function handle(Provider $provider, array $categories): void
    {
        $normalized = $this->normalize($categories);

        $limit = $this->entitlements->serviceSelectionLimit($provider->user);
        if (count($normalized) > $limit) {
            throw ValidationException::withMessages([
                'service_categories' => __('messages.service_selection_limit', ['limit' => $limit]),
            ]);
        }

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
