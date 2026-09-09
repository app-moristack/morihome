<?php

namespace App\Listeners;

use App\Models\Provider;
use Illuminate\Support\Facades\Storage;

class CascadeProviderDeletion
{
    public function handle(Provider $provider): void
    {
        if (! $provider->isForceDeleting()) {
            return;
        }

        foreach ($provider->portfolioImages()->cursor() as $image) {
            Storage::disk('public')->delete($image->path);
            $image->delete();
        }

        foreach ($provider->openingHours()->cursor() as $openingHour) {
            $openingHour->delete();
        }

        foreach ($provider->moderationEvents()->cursor() as $moderationEvent) {
            $moderationEvent->delete();
        }

        foreach ($provider->contactEvents()->cursor() as $contactEvent) {
            $contactEvent->delete();
        }

        $provider->serviceCategories()->detach();

        foreach ([$provider->logo_path, $provider->cover_path] as $path) {
            if ($path) {
                Storage::disk('public')->delete($path);
            }
        }
    }
}
