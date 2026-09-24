<?php

namespace App\Actions\Providers;

use App\Models\Provider;
use App\Services\WebpImageStorage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class StoreProviderImage
{
    public function __construct(private WebpImageStorage $images) {}

    public function handle(Provider $provider, UploadedFile $file, string $attribute): Provider
    {
        $previousPath = $provider->{$attribute};

        $stored = $this->images->store($file->getRealPath(), 'providers/'.$provider->id, $attribute === 'logo_path' ? 512 : 1920);
        try {
            $provider->forceFill([$attribute => $stored['path']])->save();
        } catch (\Throwable $exception) {
            Storage::disk('public')->delete($stored['path']);
            throw $exception;
        }

        if ($previousPath) {
            Storage::disk('public')->delete($previousPath);
        }

        return $provider->refresh();
    }
}
