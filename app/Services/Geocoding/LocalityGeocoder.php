<?php

namespace App\Services\Geocoding;

use App\Models\Locality;
use App\Support\Coordinates;
use Illuminate\Support\Str;

class LocalityGeocoder implements Geocoder
{
    public function geocode(string $address): ?GeocodeResult
    {
        $needle = Str::lower(trim($address));

        if ($needle === '') {
            return null;
        }

        $locality = Locality::query()
            ->whereRaw('LOWER(name) = ?', [$needle])
            ->first()
            ?? Locality::query()
                ->where('slug', 'like', Str::slug($needle).'%')
                ->orderByRaw('CHAR_LENGTH(slug)')
                ->first();

        return $locality ? $this->toResult($locality) : null;
    }

    public function reverse(Coordinates $coordinates): ?GeocodeResult
    {
        $nearest = null;
        $shortestDistance = INF;

        foreach (Locality::all() as $locality) {
            $distance = $coordinates->distanceTo($locality->coordinates());

            if ($distance < $shortestDistance) {
                $shortestDistance = $distance;
                $nearest = $locality;
            }
        }

        return $nearest ? $this->toResult($nearest) : null;
    }

    public function suggest(string $query, int $limit = 8): array
    {
        $needle = trim($query);

        $localities = Locality::query()
            ->when($needle !== '', fn ($builder) => $builder->where('name', 'like', '%'.$needle.'%'))
            ->orderBy('name')
            ->limit($limit)
            ->get();

        return $localities->map(fn (Locality $locality) => $this->toResult($locality))->all();
    }

    private function toResult(Locality $locality): GeocodeResult
    {
        return new GeocodeResult(
            label: $locality->name.', '.$locality->district,
            coordinates: $locality->coordinates(),
            locality: $locality->name,
            district: $locality->district,
            source: 'locality',
        );
    }
}
