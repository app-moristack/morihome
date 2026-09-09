<?php

namespace App\Services\Geocoding;

use App\Support\Coordinates;

class ChainGeocoder implements Geocoder
{
    /**
     * @param  array<int, Geocoder>  $geocoders
     */
    public function __construct(private readonly array $geocoders) {}

    public function geocode(string $address): ?GeocodeResult
    {
        foreach ($this->geocoders as $geocoder) {
            $result = $geocoder->geocode($address);

            if ($result !== null) {
                return $result;
            }
        }

        return null;
    }

    public function reverse(Coordinates $coordinates): ?GeocodeResult
    {
        foreach ($this->geocoders as $geocoder) {
            $result = $geocoder->reverse($coordinates);

            if ($result !== null) {
                return $result;
            }
        }

        return null;
    }

    public function suggest(string $query, int $limit = 8): array
    {
        $results = [];

        foreach ($this->geocoders as $geocoder) {
            foreach ($geocoder->suggest($query, $limit) as $result) {
                $results[$result->label] = $result;

                if (count($results) >= $limit) {
                    return array_values($results);
                }
            }
        }

        return array_values($results);
    }
}
