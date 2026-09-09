<?php

namespace App\Support;

use InvalidArgumentException;

final class Coordinates
{
    public const EARTH_RADIUS_KM = 6371.0088;

    public function __construct(public readonly float $latitude, public readonly float $longitude)
    {
        if ($latitude < -90 || $latitude > 90) {
            throw new InvalidArgumentException('Latitude must be between -90 and 90.');
        }

        if ($longitude < -180 || $longitude > 180) {
            throw new InvalidArgumentException('Longitude must be between -180 and 180.');
        }
    }

    public function distanceTo(self $other): float
    {
        $latitudeDelta = deg2rad($other->latitude - $this->latitude);
        $longitudeDelta = deg2rad($other->longitude - $this->longitude);

        $haversine = sin($latitudeDelta / 2) ** 2
            + cos(deg2rad($this->latitude)) * cos(deg2rad($other->latitude)) * sin($longitudeDelta / 2) ** 2;

        return self::EARTH_RADIUS_KM * 2 * asin(min(1.0, sqrt($haversine)));
    }

    public function boundingBox(float $radiusKm): array
    {
        $latitudeDelta = rad2deg($radiusKm / self::EARTH_RADIUS_KM);
        $cosine = cos(deg2rad($this->latitude));
        $longitudeDelta = $cosine < 0.000001
            ? 180.0
            : rad2deg($radiusKm / (self::EARTH_RADIUS_KM * $cosine));

        return [
            'min_latitude' => max(-90.0, $this->latitude - $latitudeDelta),
            'max_latitude' => min(90.0, $this->latitude + $latitudeDelta),
            'min_longitude' => max(-180.0, $this->longitude - $longitudeDelta),
            'max_longitude' => min(180.0, $this->longitude + $longitudeDelta),
        ];
    }

    public function obfuscated(int $precision = 2): self
    {
        return new self(round($this->latitude, $precision), round($this->longitude, $precision));
    }
}
