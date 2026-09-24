<?php

namespace App\Actions\Providers;

use App\Models\Provider;
use App\Models\ProviderPortfolioImage;
use App\Services\WebpImageStorage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class StorePortfolioImage
{
    public function __construct(private WebpImageStorage $images) {}

    public function handle(Provider $provider, UploadedFile $file, ?string $caption = null): ProviderPortfolioImage
    {
        $limit = config('morihome.uploads.max_portfolio_images');

        if ($provider->portfolioImages()->count() >= $limit) {
            throw new UnprocessableEntityHttpException(__('provider.portfolio_limit', ['limit' => $limit]));
        }

        $stored = $this->images->store($file->getRealPath(), 'providers/'.$provider->id.'/portfolio');
        try {
            return $provider->portfolioImages()->create([
                ...$stored,
                'caption' => $caption,
                'sort_order' => (int) $provider->portfolioImages()->max('sort_order') + 10,
            ]);
        } catch (\Throwable $exception) {
            Storage::disk('public')->delete($stored['path']);
            throw $exception;
        }
    }
}
