<?php

use App\Providers\AppServiceProvider;
use App\Providers\GeocodingServiceProvider;
use App\Providers\RateLimitServiceProvider;

return [
    AppServiceProvider::class,
    GeocodingServiceProvider::class,
    RateLimitServiceProvider::class,
];
