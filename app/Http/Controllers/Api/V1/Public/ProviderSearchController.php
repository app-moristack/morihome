<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\SearchProvidersRequest;
use App\Http\Resources\ProviderSummaryResource;
use App\Services\Geocoding\Geocoder;
use App\Services\Search\ProviderSearch;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProviderSearchController extends Controller
{
    public function __invoke(
        SearchProvidersRequest $request,
        ProviderSearch $providerSearch,
        Geocoder $geocoder,
    ): AnonymousResourceCollection {
        $criteria = $request->criteria($geocoder);

        return ProviderSummaryResource::collection($providerSearch->paginate($criteria))
            ->additional([
                'meta' => [
                    'search' => [
                        'latitude' => $criteria->coordinates?->latitude,
                        'longitude' => $criteria->coordinates?->longitude,
                        'radius_km' => $criteria->coordinates !== null ? $criteria->radiusKm : null,
                        'sort' => $criteria->sort,
                    ],
                ],
            ]);
    }
}
