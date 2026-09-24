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
            'properties' => $this->staticPage(
                __('Property for rent and sale in Mauritius'),
                __('Search houses, apartments, land and commercial property for rent or sale across Mauritius.'),
            ),
            'for-professionals' => $this->staticPage(
                __('Grow your business with MoriHome'),
                __('Compare MoriHome plans for individual professionals, agencies and companies in Mauritius.'),
            ),
            'register' => $this->staticPage(
                __('Create your MoriHome account'),
                __('Register as an individual or agency and choose subscriptions for services, property rentals or property sales.'),
            ),
            'about' => $this->staticPage(
                __('About MoriHome'),
                __('MoriHome connects people in Mauritius with reviewed home-service professionals and properties for rent or sale.'),
            ),
            'contact' => $this->staticPage(__('Contact MoriHome'), __('Get in touch with the MoriHome team.')),
            'terms' => $this->staticPage(__('Terms of use'), __('The terms that govern the use of MoriHome.')),
            'privacy' => $this->staticPage(__('Privacy policy'), __('How MoriHome collects, uses and protects your data.')),
            'install' => $this->staticPage(
                __('Install MoriHome on your phone'),
                __('Add MoriHome to your iPhone or Android home screen and use it like an app.'),
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
            ->pluck('name')
            ->map(fn (string $name): string => __($name));

        return new PageMeta(
            title: __('MoriHome — Find services and property in Mauritius'),
            description: __('Search trusted home-service professionals and browse property for rent or sale across Mauritius. ')
                .__(self::TAGLINE),
            canonical: url('/'),
            structuredData: $this->websiteSchema(),
            noscript: $categories->isEmpty()
                ? null
                : '<h1>'.e(__('Find trusted services and property in Mauritius')).'</h1>'
                    .'<p>'.e(__('Browse property for rent or sale. Popular services: :services.', ['services' => $categories->implode(', ')])).'</p>',
        );
    }

    private function search(Request $request): PageMeta
    {
        $category = $request->query('category');
        $locality = $request->query('address');

        $label = collect([$category, $locality])->filter()->implode(' in ');
        $title = $label === ''
            ? __('Search professionals near you — MoriHome')
            : Str::title($label).' — MoriHome';

        return new PageMeta(
            title: $title,
            description: __('Compare nearby professionals by distance, see their work and contact them on WhatsApp.'),
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
                title: __('Profile not found — MoriHome'),
                description: __('This provider profile is not available.'),
                canonical: url('/'),
                indexable: false,
            );
        }

        $services = $provider->serviceCategories->pluck('name')
            ->map(fn (string $name): string => __($name))
            ->implode(', ');
        $description = Str::limit(
            $provider->description ?: __(':name offers :services in :locality, Mauritius.', ['name' => $provider->name, 'services' => $services, 'locality' => $provider->locality]),
            160,
        );

        return new PageMeta(
            title: __(':name — :services in :locality | MoriHome', ['name' => $provider->name, 'services' => $services, 'locality' => $provider->locality]),
            description: $description,
            canonical: url('/providers/'.$provider->slug),
            image: $provider->coverUrl() ?? $provider->logoUrl(),
            type: 'profile',
            structuredData: $this->providerSchema($provider, $services),
            noscript: '<h1>'.e($provider->name).'</h1><p>'.e($description).'</p>'
                .'<p>'.e(__('Services: :services', ['services' => $services])).'</p><p>'.e(__('Area: :locality, Mauritius', ['locality' => $provider->locality])).'</p>',
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
            description: __(self::TAGLINE),
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
            'inLanguage' => app()->getLocale(),
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
