<?php

namespace App\Services\Geocoding;

use App\Support\Coordinates;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NominatimGeocoder implements Geocoder
{
    public function __construct(
        private readonly string $baseUrl,
        private readonly string $countryCode,
        private readonly int $timeout,
        private readonly ?string $contactEmail = null,
    ) {}

    public function geocode(string $address): ?GeocodeResult
    {
        return $this->suggest($address, 1)[0] ?? null;
    }

    public function reverse(Coordinates $coordinates): ?GeocodeResult
    {
        $payload = $this->request('reverse', [
            'lat' => $coordinates->latitude,
            'lon' => $coordinates->longitude,
            'zoom' => 16,
        ]);

        return $payload === null ? null : $this->toResult($payload);
    }

    public function suggest(string $query, int $limit = 8): array
    {
        if (trim($query) === '') {
            return [];
        }

        $payload = $this->request('search', [
            'q' => $query,
            'countrycodes' => $this->countryCode,
            'limit' => $limit,
        ]);

        if (! is_array($payload)) {
            return [];
        }

        return array_values(array_filter(array_map(
            fn (array $place) => $this->toResult($place),
            $payload,
        )));
    }

    private function request(string $endpoint, array $query): ?array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders(['User-Agent' => $this->userAgent()])
                ->get($this->baseUrl.'/'.$endpoint, $query + [
                    'format' => 'jsonv2',
                    'addressdetails' => 1,
                ]);
        } catch (ConnectionException $exception) {
            Log::warning('Geocoding request failed.', ['endpoint' => $endpoint, 'reason' => $exception->getMessage()]);

            return null;
        }

        return $response->successful() ? $response->json() : null;
    }

    private function toResult(array $place): ?GeocodeResult
    {
        if (! isset($place['lat'], $place['lon'])) {
            return null;
        }

        $address = $place['address'] ?? [];

        return new GeocodeResult(
            label: $place['display_name'] ?? '',
            coordinates: new Coordinates((float) $place['lat'], (float) $place['lon']),
            locality: $address['village'] ?? $address['town'] ?? $address['city'] ?? $address['suburb'] ?? null,
            district: $address['state'] ?? $address['county'] ?? null,
            source: 'nominatim',
        );
    }

    private function userAgent(): string
    {
        $contact = $this->contactEmail ? ' ('.$this->contactEmail.')' : '';

        return config('app.name').' geocoder'.$contact;
    }
}
