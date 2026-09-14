<?php

namespace App\Http\Controllers\Api\V1\Provider;

use App\Actions\Providers\StoreProviderImage;
use App\Http\Controllers\Controller;
use App\Http\Resources\OwnedProviderResource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class ProviderImagesController extends Controller
{
    private const ATTRIBUTES = ['logo' => 'logo_path', 'cover' => 'cover_path'];

    public function store(Request $request, string $kind, StoreProviderImage $storeProviderImage): OwnedProviderResource
    {
        abort_unless(array_key_exists($kind, self::ATTRIBUTES), 404);

        $provider = $request->user()->provider;
        $this->authorize('update', $provider);

        $uploads = config('morihome.uploads');

        $request->validate([
            'image' => [
                'required',
                File::image()->types($uploads['mime_types'])->max($uploads['max_kilobytes'])
                    ->dimensions(Rule::dimensions()->maxWidth($uploads['max_dimension'])->maxHeight($uploads['max_dimension'])),
            ],
        ]);

        return new OwnedProviderResource(
            $storeProviderImage->handle($provider, $request->file('image'), self::ATTRIBUTES[$kind]),
        );
    }
}
