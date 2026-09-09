<?php

namespace App\Services\Geocoding;

use App\Support\Coordinates;
use Illuminate\Contracts\Support\Arrayable;

final class GeocodeResult implements Arrayable
{
    public function __construct(
        public readonly string $label,
        public readonly Coordinates $coordinates,
        public readonly ?string $locality = null,
        public readonly ?string $district = null,
        public readonly string $source = 'unknown',
    ) {}

    public function toArray(): array
    {
        return [
            'label' => $this->label,
            'locality' => $this->locality,
            'district' => $this->district,
            'latitude' => $this->coordinates->latitude,
            'longitude' => $this->coordinates->longitude,
            'source' => $this->source,
        ];
    }
}
