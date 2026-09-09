<?php

return [
    'driver' => env('GEOCODER_DRIVER', 'nominatim'),

    'country_code' => env('GEOCODER_COUNTRY_CODE', 'mu'),

    'cache_ttl' => (int) env('GEOCODER_CACHE_TTL', 604800),

    'nominatim' => [
        'url' => env('GEOCODER_NOMINATIM_URL', 'https://nominatim.openstreetmap.org'),
        'email' => env('GEOCODER_NOMINATIM_EMAIL'),
        'timeout' => 5,
    ],
];
