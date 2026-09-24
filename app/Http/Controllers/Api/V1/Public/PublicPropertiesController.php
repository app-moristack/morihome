<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Enums\ApprovalStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyListingResource;
use App\Models\PropertyListing;
use App\Models\Provider;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PublicPropertiesController extends Controller
{
    public function show(string $slug): PropertyListingResource
    {
        $listing = PropertyListing::query()->publiclyListed()
            ->where('slug', $slug)
            ->whereHas('provider', fn ($query) => $query->where('is_active', true))
            ->with(['images', 'provider', 'membership.subscription'])
            ->firstOrFail();

        return new PropertyListingResource($listing);
    }

    public function forProvider(Request $request, string $slug): AnonymousResourceCollection
    {
        $request->validate(['page' => ['sometimes', 'integer', 'min:1']]);
        $provider = Provider::query()->where('slug', $slug)
            ->where('approval_status', ApprovalStatus::Approved->value)
            ->where('is_active', true)->firstOrFail();

        return PropertyListingResource::collection(
            PropertyListing::query()->publiclyListed()->where('provider_id', $provider->id)
                ->with(['images', 'provider', 'membership.subscription'])
                ->latest('published_at')->orderByDesc('id')->paginate(12)
        );
    }
}
