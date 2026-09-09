<?php

namespace App\Http\Controllers;

use App\Enums\ApprovalStatus;
use App\Models\Provider;
use App\Models\ServiceCategory;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    private const STATIC_PATHS = ['/', '/register', '/about', '/contact', '/terms', '/privacy', '/install'];

    public function __invoke(): Response
    {
        $entries = array_map(
            fn (string $path) => ['loc' => url($path), 'changefreq' => 'weekly', 'priority' => $path === '/' ? '1.0' : '0.5'],
            self::STATIC_PATHS,
        );

        foreach (ServiceCategory::where('is_active', true)->orderBy('sort_order')->get() as $category) {
            $entries[] = [
                'loc' => url('/search?category_id='.$category->id),
                'changefreq' => 'daily',
                'priority' => '0.6',
            ];
        }

        Provider::query()
            ->where('approval_status', ApprovalStatus::Approved->value)
            ->where('is_active', true)
            ->orderBy('id')
            ->chunk(500, function ($providers) use (&$entries) {
                foreach ($providers as $provider) {
                    $entries[] = [
                        'loc' => url('/providers/'.$provider->slug),
                        'lastmod' => $provider->updated_at->toDateString(),
                        'changefreq' => 'weekly',
                        'priority' => '0.8',
                    ];
                }
            });

        return response($this->render($entries), 200, ['Content-Type' => 'application/xml']);
    }

    private function render(array $entries): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

        foreach ($entries as $entry) {
            $xml .= '  <url>'."\n";

            foreach ($entry as $tag => $value) {
                $xml .= '    <'.$tag.'>'.htmlspecialchars((string) $value, ENT_XML1).'</'.$tag.'>'."\n";
            }

            $xml .= '  </url>'."\n";
        }

        return $xml.'</urlset>'."\n";
    }
}
