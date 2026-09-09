<?php

namespace App\Providers;

use App\Listeners\CascadeProviderDeletion;
use App\Models\Provider;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Model::shouldBeStrict(! $this->app->isProduction());

        Provider::deleting(CascadeProviderDeletion::class);
    }
}
