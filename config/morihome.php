<?php

return [
    'admin' => [
        'email' => env('ADMIN_EMAIL', 'admin@morihome.mu'),
        'password' => env('ADMIN_PASSWORD'),
    ],

    'support_email' => env('MORIHOME_SUPPORT_EMAIL', 'support@morihome.mu'),
    'support_whatsapp' => env('MORIHOME_SUPPORT_WHATSAPP'),

    'search' => [
        'default_radius_km' => (int) env('MORIHOME_DEFAULT_RADIUS_KM', 10),
        'max_radius_km' => (int) env('MORIHOME_MAX_RADIUS_KM', 50),
        'radius_options_km' => [2, 5, 10, 20, 30, 50],
        'per_page' => 12,
        'max_per_page' => 50,
    ],

    'moderation' => [
        'review_on_sensitive_edit' => (bool) env('MORIHOME_REVIEW_ON_SENSITIVE_EDIT', true),
    ],

    'whatsapp' => [
        'message_template' => env(
            'MORIHOME_WHATSAPP_TEMPLATE',
            'Hello, I found your profile on :app. I am looking for help with :service.',
        ),
    ],

    'uploads' => [
        'max_kilobytes' => 5120,
        'min_dimension' => 200,
        'max_dimension' => 6000,
        'mime_types' => ['image/jpeg', 'image/png', 'image/webp'],
        'max_portfolio_images' => 20,
    ],
];
