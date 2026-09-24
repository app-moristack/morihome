<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->supportedLocale($request->cookie('morihome_locale'));

        if ($request->is('api/*') || $locale === null) {
            foreach ($request->getLanguages() as $language) {
                $supported = $this->supportedLocale($language);

                if ($supported !== null) {
                    $locale = $supported;
                    break;
                }
            }
        }

        app()->setLocale($locale ?? 'en');

        $response = $next($request);
        $response->headers->set('Content-Language', app()->getLocale());
        $response->setVary(['Accept-Language', 'Cookie'], false);

        return $response;
    }

    private function supportedLocale(mixed $language): ?string
    {
        if (! is_string($language)) {
            return null;
        }

        $locale = strtolower(explode('-', str_replace('_', '-', $language))[0]);

        return in_array($locale, ['en', 'fr', 'mfe'], true) ? $locale : null;
    }
}
