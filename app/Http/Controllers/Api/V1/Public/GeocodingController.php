<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Services\Geocoding\Geocoder;
use App\Services\Geocoding\GeocodeResult;
use App\Support\Coordinates;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeocodingController extends Controller
{
    public function __construct(private readonly Geocoder $geocoder) {}

    public function suggest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:120'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:10'],
        ]);

        $results = $this->geocoder->suggest($validated['q'], $validated['limit'] ?? 8);

        return response()->json([
            'data' => array_map(fn (GeocodeResult $result) => $result->toArray(), $results),
        ]);
    }

    public function reverse(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $result = $this->geocoder->reverse(
            new Coordinates((float) $validated['latitude'], (float) $validated['longitude']),
        );

        return response()->json(['data' => $result?->toArray()]);
    }
}
