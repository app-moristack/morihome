<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <script nonce="{{ Vite::cspNonce() }}">
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
    </script>

    <title>{{ $meta->title }}</title>
    <meta name="description" content="{{ $meta->description }}">
    <link rel="canonical" href="{{ $meta->canonical }}">
    @unless ($meta->indexable)
        <meta name="robots" content="noindex, follow">
    @endunless

    <meta property="og:site_name" content="{{ config('app.name') }}">
    <meta property="og:type" content="{{ $meta->type }}">
    <meta property="og:title" content="{{ $meta->title }}">
    <meta property="og:description" content="{{ $meta->description }}">
    <meta property="og:url" content="{{ $meta->canonical }}">
    <meta property="og:image" content="{{ $meta->imageUrl() }}">
    <meta property="og:locale" content="en_MU">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $meta->title }}">
    <meta name="twitter:description" content="{{ $meta->description }}">
    <meta name="twitter:image" content="{{ $meta->imageUrl() }}">

    <meta name="theme-color" content="#F5C518">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="MoriHome">
    <meta name="format-detection" content="telephone=no">

    <link rel="manifest" href="/build/manifest.webmanifest">
    <link rel="icon" href="/favicon.ico" sizes="48x48">
    <link rel="icon" href="/icons/icon-192.png" type="image/png" sizes="192x192">
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">

    <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
    <link rel="stylesheet" href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800&display=swap">

    @if ($meta->structuredData)
        <script nonce="{{ Vite::cspNonce() }}" type="application/ld+json">{!! json_encode($meta->structuredData, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) !!}</script>
    @endif

    <script nonce="{{ Vite::cspNonce() }}">
        window.__MORIHOME__ = @json($bootstrap);
    </script>

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.tsx'])
</head>
<body>
    <svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" style="position:absolute">
        <defs>
            <filter id="brand-dark" color-interpolation-filters="sRGB">
                <!-- Invert neutral lettering while retaining the original yellow accents. -->
                <feColorMatrix type="matrix" values="0 0 -1 0 1  -1 1 -1 0 1  -1 0 0 0 1  0 0 0 1 0" />
            </filter>
        </defs>
    </svg>
    <div id="app"></div>

    @if ($meta->noscript)
        <noscript>
            <div style="max-width:48rem;margin:0 auto;padding:2rem 1rem;font-family:system-ui,sans-serif">
                {!! $meta->noscript !!}
                <p><a href="/">MoriHome</a> needs JavaScript for search and messaging.</p>
            </div>
        </noscript>
    @endif
</body>
</html>
