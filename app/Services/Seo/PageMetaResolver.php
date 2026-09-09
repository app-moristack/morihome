<?php

namespace App\Services\Seo;

use App\Enums\ApprovalStatus;
use App\Models\Provider;
use App\Models\ServiceCategory;
use App\Support\PageMeta;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageMetaResolver
{
    private const TAGLINE = 'Local professionals. A stronger tomorrow.';

    public function resolve(Request $request): PageMeta
    {
        $path = trim($request->path(), '/');
        $segments = $path === '' ? [] : explode('/', $path);

        return match ($segments[0] ?? '') {
            '' => $this->home(),
            'providers' => $this->provider($segments[1] ?? null),
            'search' => $this->search($request),
            'register' => $this->staticPage(
                'Join the MoriHome directory',
                'Register your construction, renovation or maintenance business and reach customers across Mauritius.',
            ),
            'about' => $this->staticPage(
                'About MoriHome',
                'MoriHome connects people in Mauritius with reviewed construction, renovation and home-service professionals.',
            ),
            'contact' => $this->staticPage('Contact MoriHome', 'Get in touch with the MoriHome team.'),
            'terms' => $this->staticPage('Terms of use', 'The terms that govern the use of MoriHome.'),
            'privacy' => $this->staticPage('Privacy policy', 'How MoriHome collects, uses and protects your data.'),
            'install' => $this->staticPage(
                'Install MoriHome on your phone',
                'Add MoriHome to your iPhone or Android home screen and use it like an app.',
            ),
            default => $this->privatePage(),
        };
    }

    private function home(): PageMeta
    {
        $categories = ServiceCategory::query()
            ->where('is_active', true)
            ->where('is_popular', true)
            ->orderBy('sort_order')
            ->pluck('name');

        return new PageMeta(
            title: 'MoriHome — Find trusted construction & renovation professionals in Mauritius',
            description: 'Search plumbers, masons, electricians, painters and more near you in Mauritius. '
                .'Every listed professional is reviewed before appearing. '.self::TAGLINE,
            canonical: url('/'),
            structuredData: $this->websiteSchema(),
            noscript: $categories->isEmpty()
                ? null
                : '<h1>Find trusted construction &amp; renovation professionals near you in Mauritius</h1>'
                    .'<p>Popular services: '.e($categories->implode(', ')).'.</p>',
        );
    }

    private function search(Request $request): PageMeta
    {
        $category = $request->query('category');
        $locality = $request->query('address');

        $label = collect([$category, $locality])->filter()->implode(' in ');
        $title = $label === ''
            ? 'Search professionals near you — MoriHome'
            : Str::title($label).' — MoriHome';

        return new PageMeta(
            title: $title,
            description: 'Compare nearby professionals by distance, see their work and contact them on WhatsApp.',
            canonical: url('/search'),
            indexable: false,
        );
    }

    private function provider(?string $slug): PageMeta
    {
        $provider = $slug === null ? null : Provider::query()
            ->where('slug', $slug)
            ->where('approval_status', ApprovalStatus::Approved->value)
            ->where('is_active', true)
            ->with('serviceCategories:id,name,slug')
            ->first();

        if ($provider === null) {
            return new PageMeta(
                title: 'Profile not found — MoriHome',
                description: 'This provider profile is not available.',
                canonical: url('/'),
                indexable: false,
            );
        }

        $services = $provider->serviceCategories->pluck('name')->implode(', ');
        $description = Str::limit(
            $provider->description ?: "{$provider->name} offers {$services} in {$provider->locality}, Mauritius.",
            160,
        );

        return new PageMeta(
            title: "{$provider->name} — {$services} in {$provider->locality} | MoriHome",
            description: $description,
            canonical: url('/providers/'.$provider->slug),
            image: $provider->coverUrl() ?? $provider->logoUrl(),
            type: 'profile',
            structuredData: $this->providerSchema($provider, $services),
            noscript: '<h1>'.e($provider->name).'</h1><p>'.e($description).'</p>'
                .'<p>Services: '.e($services).'</p><p>Area: '.e($provider->locality).', Mauritius</p>',
        );
    }

    private function staticPage(string $title, string $description): PageMeta
    {
        return new PageMeta(
            title: $title.' — MoriHome',
            description: $description,
            canonical: url()->current(),
            noscript: '<h1>'.e($title).'</h1><p>'.e($description).'</p>',
        );
    }

    private function privatePage(): PageMeta
    {
        return new PageMeta(
            title: 'MoriHome',
            description: self::TAGLINE,
            canonical: url('/'),
            indexable: false,
        );
    }

    private function websiteSchema(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => 'MoriHome',
            'url' => url('/'),
            'inLanguage' => 'en',
            'potentialAction' => [
                '@type' => 'SearchAction',
                'target' => url('/search').'?address={search_term_string}',
                'query-input' => 'required name=search_term_string',
            ],
        ];
    }

    private function providerSchema(Provider $provider, string $services): array
    {
        $approximate = $provider->coordinates()->obfuscated();

        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'LocalBusiness',
            'name' => $provider->name,
            'description' => $provider->description,
            'url' => url('/providers/'.$provider->slug),
            'image' => $provider->logoUrl(),
            'telephone' => $provider->phone,
            'areaServed' => $provider->service_areas ?: [$provider->locality],
            'knowsAbout' => $services,
            'address' => [
                '@type' => 'PostalAddress',
                'addressLocality' => $provider->locality,
                'addressCountry' => 'MU',
            ],
            'geo' => [
                '@type' => 'GeoCoordinates',
                'latitude' => $approximate->latitude,
                'longitude' => $approximate->longitude,
            ],
        ]);
    }
}
