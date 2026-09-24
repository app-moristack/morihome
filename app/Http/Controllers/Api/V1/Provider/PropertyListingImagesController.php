<?php

namespace App\Http\Controllers\Api\V1\Provider;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyListingImageRequest;
use App\Http\Resources\PropertyListingImageResource;
use App\Models\PropertyListing;
use App\Models\PropertyListingImage;
use App\Services\WebpImageStorage;
use App\Support\SubscriptionEntitlements;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class PropertyListingImagesController extends Controller
{
    public function store(
        StorePropertyListingImageRequest $request,
        PropertyListing $propertyListing,
        SubscriptionEntitlements $entitlements,
        WebpImageStorage $images,
    ): JsonResponse {
        $image = DB::transaction(function () use ($request, $propertyListing, $entitlements, $images): PropertyListingImage {
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
            $stored = $images->store($uploadedImage->getRealPath(), 'property-listings/'.$propertyListing->id);
            $path = $stored['path'];

            try {
                return $propertyListing->images()->create([
                    ...$stored,
                    'caption' => $request->validated('caption'),
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
