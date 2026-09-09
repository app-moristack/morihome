<?php

namespace App\Actions\Providers;

use App\Models\Provider;
use Illuminate\Support\Facades\DB;

class ReorderPortfolioImages
{
    public function handle(Provider $provider, array $orderedImageIds): void
    {
        $owned = $provider->portfolioImages()->pluck('id')->all();

        DB::transaction(function () use ($provider, $orderedImageIds, $owned) {
            foreach (array_values($orderedImageIds) as $position => $imageId) {
                if (! in_array((int) $imageId, $owned, true)) {
                    continue;
                }

                $provider->portfolioImages()
                    ->whereKey($imageId)
                    ->update(['sort_order' => ($position + 1) * 10]);
            }
        });
    }
}
