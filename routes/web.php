<?php

use App\Http\Controllers\SitemapController;
use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

Route::get('sitemap.xml', SitemapController::class)->name('sitemap');

Route::get('/{path?}', SpaController::class)
    ->where('path', '^(?!api|sanctum|storage|build|icons|sitemap\.xml|up$).*$')
    ->name('spa');
