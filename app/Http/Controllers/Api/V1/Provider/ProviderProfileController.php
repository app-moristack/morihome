<?php

namespace App\Http\Controllers\Api\V1\Provider;

use App\Actions\Providers\CalculateProfileCompleteness;
use App\Actions\Providers\UpdateProviderProfile;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProviderProfileRequest;
use App\Http\Resources\OwnedProviderResource;
use Illuminate\Http\Request;

class ProviderProfileController extends Controller
{
    public function show(Request $request, CalculateProfileCompleteness $calculateCompleteness): OwnedProviderResource
    {
        $provider = $request->user()->provider->load(['serviceCategories', 'portfolioImages', 'openingHours']);

        return (new OwnedProviderResource($provider))
            ->additional(['meta' => ['completeness' => $calculateCompleteness->handle($provider)]]);
    }

    public function update(
        UpdateProviderProfileRequest $request,
        UpdateProviderProfile $updateProviderProfile,
    ): OwnedProviderResource {
        $provider = $updateProviderProfile->handle($request->user()->provider, $request->validated());

        return new OwnedProviderResource($provider->load(['serviceCategories', 'portfolioImages', 'openingHours']));
    }
}
