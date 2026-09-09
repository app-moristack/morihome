<?php

namespace App\Services\Geocoding;

use App\Support\Coordinates;

interface Geocoder
{
    public function geocode(string $address): ?GeocodeResult;

    public function reverse(Coordinates $coordinates): ?GeocodeResult;

    /**
     * @return array<int, GeocodeResult>
     */
    public function suggest(string $query, int $limit = 8): array;
}
