<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Actions\Moderation\ModerateProvider;
use App\Http\Controllers\Controller;
use App\Http\Requests\ModerateProviderRequest;
use App\Http\Resources\ModerationEventResource;
use App\Http\Resources\OwnedProviderResource;
use App\Models\Provider;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProviderModerationController extends Controller
{
    public function show(Provider $provider): OwnedProviderResource
    {
        return new OwnedProviderResource(
            $provider->load(['user', 'serviceCategories', 'portfolioImages', 'openingHours']),
        );
    }

    public function history(Provider $provider): AnonymousResourceCollection
    {
        return ModerationEventResource::collection($provider->moderationEvents()->with('actor')->get());
    }

    public function update(
        ModerateProviderRequest $request,
        Provider $provider,
        ModerateProvider $moderateProvider,
    ): OwnedProviderResource {
        $moderated = $moderateProvider->handle(
            provider: $provider,
            action: $request->moderationAction(),
            actor: $request->user(),
            reason: $request->validated('reason'),
        );

        return new OwnedProviderResource($moderated->load('serviceCategories'));
    }
}
