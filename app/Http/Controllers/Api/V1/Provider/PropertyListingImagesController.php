<?php

namespace App\Http\Controllers\Api\V1\Provider;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyListingImageRequest;
use App\Http\Resources\PropertyListingImageResource;
use App\Models\PropertyListing;
use App\Models\PropertyListingImage;
use App\Support\SubscriptionEntitlements;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class PropertyListingImagesController extends Controller
{
    public function store(
        StorePropertyListingImageRequest $request,
        PropertyListing $propertyListing,
        SubscriptionEntitlements $entitlements,
    ): JsonResponse {
        $image = DB::transaction(function () use ($request, $propertyListing, $entitlements): PropertyListingImage {
            $membership = $entitlements->activeFor(
                $propertyListing->provider->user,
                $propertyListing->purpose,
                lockForUpdate: true,
            );

            if ($membership === null) {
                throw ValidationException::withMessages([
                    'image' => __('messages.photo_subscription'),
                ]);
            }

            if ($propertyListing->images()->count() >= $membership->subscription->photos_per_item_limit) {
                throw ValidationException::withMessages([
                    'image' => __('messages.photo_limit', ['plan' => $membership->subscription->name, 'limit' => $membership->subscription->photos_per_item_limit]),
                ]);
            }

            $uploadedImage = $request->file('image');
            $dimensions = getimagesize($uploadedImage->getRealPath());
            $path = $uploadedImage->store('property-listings/'.$propertyListing->id, 'public');

            if ($path === false) {
                throw new RuntimeException('The property image could not be stored.');
            }

            try {
                return $propertyListing->images()->create([
                    'path' => $path,
                    'caption' => $request->validated('caption'),
                    'width' => $dimensions[0] ?? null,
                    'height' => $dimensions[1] ?? null,
                    'sort_order' => ($propertyListing->images()->max('sort_order') ?? 0) + 10,
                ]);
            } catch (\Throwable $exception) {
                Storage::disk('public')->delete($path);

                throw $exception;
            }
        });

        return (new PropertyListingImageResource($image))
            ->response()
            ->setStatusCode(JsonResponse::HTTP_CREATED);
    }
}
