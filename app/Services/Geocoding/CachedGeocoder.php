<?php

namespace App\Services\Geocoding;

use App\Support\Coordinates;
use Illuminate\Contracts\Cache\Repository as CacheRepository;

class CachedGeocoder implements Geocoder
{
    public function __construct(
        private readonly Geocoder $geocoder,
        private readonly CacheRepository $cache,
        private readonly int $ttl,
    ) {}

    public function geocode(string $address): ?GeocodeResult
    {
        return $this->remember('geocode:'.$address, fn () => $this->geocoder->geocode($address));
    }

    public function reverse(Coordinates $coordinates): ?GeocodeResult
    {
        $key = sprintf('reverse:%.4f,%.4f', $coordinates->latitude, $coordinates->longitude);

        return $this->remember($key, fn () => $this->geocoder->reverse($coordinates));
    }

    public function suggest(string $query, int $limit = 8): array
    {
        return $this->remember('suggest:'.$limit.':'.$query, fn () => $this->geocoder->suggest($query, $limit)) ?? [];
    }

    private function remember(string $key, callable $callback): mixed
    {
        return $this->cache->remember('geocoding:'.sha1($key), $this->ttl, $callback);
    }
}
