<?php

namespace App\Actions\Providers;

use App\Models\Provider;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class StoreProviderImage
{
    public function handle(Provider $provider, UploadedFile $file, string $attribute): Provider
    {
        $previousPath = $provider->{$attribute};

        $provider->forceFill([
            $attribute => $file->store('providers/'.$provider->id, 'public'),
        ])->save();

        if ($previousPath) {
            Storage::disk('public')->delete($previousPath);
        }

        return $provider->refresh();
    }
}
