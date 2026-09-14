<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class RateLimitServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->limit('api', 120);
        $this->limit('public', 90);
        $this->limit('page-views', 60);
        $this->limit('geocoding', 30);
        $this->limit('contact-events', 20);
        $this->limit('contact-form', 5);
        $this->limit('auth', 10);
        $this->limit('uploads', 10);
        $this->limit('password-change', 5);
    }

    private function limit(string $name, int $perMinute): void
    {
        RateLimiter::for($name, fn (Request $request) => Limit::perMinute($perMinute)
            ->by($request->user()?->id ?: $request->ip()));
    }
}
