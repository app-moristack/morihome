<?php

namespace App\Providers;

use App\Listeners\CascadeProviderDeletion;
use App\Models\Provider;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Password::defaults(fn () => Password::min(12)->mixedCase()->numbers());
        ResetPassword::createUrlUsing(fn ($user, string $token) => rtrim(config('app.url'), '/').'/reset-password?'.http_build_query(['token' => $token, 'email' => $user->getEmailForPasswordReset()]));

        TrustProxies::at(config('app.trusted_proxies'));

        Model::shouldBeStrict(! $this->app->isProduction());

        Provider::deleting(CascadeProviderDeletion::class);
    }
}
