<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyListingResource;
use App\Models\PropertyListing;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class PropertySearchController extends Controller
{
    public function __invoke(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'purpose' => ['sometimes', Rule::in(['rental', 'sales'])],
            'property_type' => ['sometimes', Rule::in(['house', 'apartment', 'villa', 'land', 'commercial', 'other'])],
            'location' => ['sometimes', 'string', 'max:120'],
            'min_price' => ['sometimes', 'integer', 'min:0'],
            'max_price' => [
                'sometimes',
                'integer',
                'min:0',
                ...($request->filled('min_price') ? ['gte:min_price'] : []),
            ],
            'bedrooms' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'bathrooms' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'min_area' => ['sometimes', 'numeric', 'min:0', 'max:99999999'],
            'is_furnished' => ['sometimes', 'boolean'],
            'amenities' => ['sometimes', 'array', 'max:8'],
            'amenities.*' => ['string', 'distinct', Rule::in(PropertyListing::AMENITIES)],
            'featured_only' => ['sometimes', 'boolean'],
            'sort' => ['sometimes', Rule::in(['newest', 'price_asc', 'price_desc'])],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $listings = PropertyListing::query()
            ->publiclyListed()
            ->when($validated['featured_only'] ?? false, fn ($query) => $query
                ->whereHas('membership.subscription', fn ($query) => $query->where('featured_items', true)))
            ->when($validated['purpose'] ?? null, fn ($query, string $purpose) => $query->where('purpose', $purpose))
            ->when($validated['property_type'] ?? null, fn ($query, string $propertyType) => $query->where('property_type', $propertyType))
            ->when($validated['location'] ?? null, fn ($query, string $location) => $query
                ->where(function ($query) use ($location): void {
                    $query->where('locality', 'like', "%{$location}%")
                        ->orWhere('address', 'like', "%{$location}%");
                }))
            ->when(isset($validated['min_price']), fn ($query) => $query->where('price_rupees', '>=', $validated['min_price']))
            ->when(isset($validated['max_price']), fn ($query) => $query->where('price_rupees', '<=', $validated['max_price']))
            ->when(isset($validated['bedrooms']), fn ($query) => $query->where('bedrooms', '>=', $validated['bedrooms']))
            ->when(isset($validated['bathrooms']), fn ($query) => $query->where('bathrooms', '>=', $validated['bathrooms']))
            ->when(isset($validated['min_area']), fn ($query) => $query->where('area_sqm', '>=', $validated['min_area']))
            ->when(isset($validated['is_furnished']), fn ($query) => $query->where('is_furnished', $validated['is_furnished']))
            ->when($validated['amenities'] ?? [], function ($query, array $amenities): void {
                foreach ($amenities as $amenity) {
                    $query->whereJsonContains('amenities', $amenity);
                }
            })
            ->with(['images', 'provider', 'membership.subscription'])
            ->when(($validated['sort'] ?? 'newest') === 'price_asc', fn ($query) => $query->orderBy('price_rupees'))
            ->when(($validated['sort'] ?? 'newest') === 'price_desc', fn ($query) => $query->orderByDesc('price_rupees'))
            ->latest('published_at')
            ->orderByDesc('id')
            ->paginate(24)
            ->withQueryString();

        return PropertyListingResource::collection($listings);
    }
}
