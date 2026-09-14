<?php

namespace App\Http\Controllers\Api\V1\Provider;

use App\Actions\Properties\CreatePropertyListing;
use App\Enums\SubscriptionCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyListingRequest;
use App\Http\Resources\PropertyListingResource;
use App\Support\SubscriptionEntitlements;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PropertyListingsController extends Controller
{
    public function index(Request $request, SubscriptionEntitlements $entitlements): AnonymousResourceCollection
    {
        $provider = $request->user()->provider;
        $listings = $provider->propertyListings()
            ->with(['images', 'membership.subscription'])
            ->latest()
            ->get();
        $limits = collect([SubscriptionCategory::Rental, SubscriptionCategory::Sales])
            ->mapWithKeys(function (SubscriptionCategory $category) use ($provider, $entitlements): array {
                $membership = $entitlements->activeFor($provider->user, $category);
                $used = $provider->propertyListings()
                    ->where('purpose', $category->value)
                    ->whereIn('status', ['draft', 'published'])
                    ->count();

                return [$category->value => $membership === null ? null : [
                    'plan' => $membership->subscription->name,
                    'listing_limit' => $membership->subscription->active_item_limit,
                    'used' => $used,
                    'remaining' => max(0, $membership->subscription->active_item_limit - $used),
                    'photos_per_listing' => $membership->subscription->photos_per_item_limit,
                ]];
            });

        return PropertyListingResource::collection($listings)->additional(['meta' => ['limits' => $limits]]);
    }

    public function store(
        StorePropertyListingRequest $request,
        CreatePropertyListing $createPropertyListing,
    ): JsonResponse {
        $listing = $createPropertyListing->handle($request->user()->provider, $request->validated());

        return (new PropertyListingResource($listing->load(['images', 'membership.subscription'])))
            ->response()
            ->setStatusCode(JsonResponse::HTTP_CREATED);
    }
}
