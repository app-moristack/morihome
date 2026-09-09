<?php

namespace App\Providers;

use App\Services\Geocoding\CachedGeocoder;
use App\Services\Geocoding\ChainGeocoder;
use App\Services\Geocoding\Geocoder;
use App\Services\Geocoding\LocalityGeocoder;
use App\Services\Geocoding\NominatimGeocoder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\ServiceProvider;

class GeocodingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(Geocoder::class, function () {
            $localityGeocoder = new LocalityGeocoder;

            if (config('geocoding.driver') !== 'nominatim') {
                return $localityGeocoder;
            }

            $nominatim = new CachedGeocoder(
                geocoder: new NominatimGeocoder(
                    baseUrl: rtrim(config('geocoding.nominatim.url'), '/'),
                    countryCode: config('geocoding.country_code'),
                    timeout: config('geocoding.nominatim.timeout'),
                    contactEmail: config('geocoding.nominatim.email'),
                ),
                cache: Cache::store(),
                ttl: config('geocoding.cache_ttl'),
            );

            return new ChainGeocoder([$localityGeocoder, $nominatim]);
        });
    }
}
