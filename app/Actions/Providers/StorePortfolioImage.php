<?php

namespace App\Actions\Providers;

use App\Models\Provider;
use App\Models\ProviderPortfolioImage;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class StorePortfolioImage
{
    public function handle(Provider $provider, UploadedFile $file, ?string $caption = null): ProviderPortfolioImage
    {
        $limit = config('morihome.uploads.max_portfolio_images');

        if ($provider->portfolioImages()->count() >= $limit) {
            throw new UnprocessableEntityHttpException(__('provider.portfolio_limit', ['limit' => $limit]));
        }

        [$width, $height] = $this->dimensions($file);

        return $provider->portfolioImages()->create([
            'path' => $file->store('providers/'.$provider->id.'/portfolio', 'public'),
            'caption' => $caption,
            'width' => $width,
            'height' => $height,
            'sort_order' => (int) $provider->portfolioImages()->max('sort_order') + 10,
        ]);
    }

    private function dimensions(UploadedFile $file): array
    {
        $size = @getimagesize($file->getRealPath());

        return $size === false ? [null, null] : [$size[0], $size[1]];
    }
}
