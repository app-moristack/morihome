<?php

use App\Http\Controllers\Api\V1\Admin\AdminCategoriesController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminUsersController;
use App\Http\Controllers\Api\V1\Admin\PlatformSettingsController;
use App\Http\Controllers\Api\V1\Admin\ProviderModerationController;
use App\Http\Controllers\Api\V1\Admin\SubscriptionsController as AdminSubscriptionsController;
use App\Http\Controllers\Api\V1\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Api\V1\Auth\CurrentUserController;
use App\Http\Controllers\Api\V1\Auth\PasswordController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\Auth\RegisteredProvidersController;
use App\Http\Controllers\Api\V1\Provider\PropertyListingImagesController;
use App\Http\Controllers\Api\V1\Provider\PropertyListingsController;
use App\Http\Controllers\Api\V1\Provider\ProviderImagesController;
use App\Http\Controllers\Api\V1\Provider\ProviderOpeningHoursController;
use App\Http\Controllers\Api\V1\Provider\ProviderPortfolioController;
use App\Http\Controllers\Api\V1\Provider\ProviderProfileController;
use App\Http\Controllers\Api\V1\Provider\ProviderSubmissionController;
use App\Http\Controllers\Api\V1\Provider\SubscriptionsController as ProviderSubscriptionsController;
use App\Http\Controllers\Api\V1\Public\ContactEventsController;
use App\Http\Controllers\Api\V1\Public\ContactMessagesController;
use App\Http\Controllers\Api\V1\Public\FeaturedProvidersController;
use App\Http\Controllers\Api\V1\Public\GeocodingController;
use App\Http\Controllers\Api\V1\Public\LocalitiesController;
use App\Http\Controllers\Api\V1\Public\PageViewsController;
use App\Http\Controllers\Api\V1\Public\PropertySearchController;
use App\Http\Controllers\Api\V1\Public\ProviderSearchController;
use App\Http\Controllers\Api\V1\Public\PublicPropertiesController;
use App\Http\Controllers\Api\V1\Public\PublicProvidersController;
use App\Http\Controllers\Api\V1\Public\ServiceCategoriesController;
use App\Http\Controllers\Api\V1\Public\SubscriptionsController;
use App\Rest\Controllers\ProvidersController as RestProvidersController;
use App\Rest\Controllers\ServiceCategoriesController as RestServiceCategoriesController;
use Illuminate\Support\Facades\Route;
use Lomkit\Rest\Facades\Rest;

Route::prefix('v1')->group(function () {
    Route::post('page-views', [PageViewsController::class, 'store'])->middleware('throttle:page-views');
    Route::middleware('throttle:public')->group(function () {
        Route::get('categories', [ServiceCategoriesController::class, 'index']);
        Route::get('subscriptions', SubscriptionsController::class);
        Route::get('localities', [LocalitiesController::class, 'index']);
        Route::get('providers/search', ProviderSearchController::class);
        Route::get('properties/search', PropertySearchController::class);
        Route::get('properties/{slug}', [PublicPropertiesController::class, 'show']);
        Route::get('providers/{slug}/properties', [PublicPropertiesController::class, 'forProvider']);
        Route::get('providers/featured', FeaturedProvidersController::class);
        Route::get('providers/{slug}', [PublicProvidersController::class, 'show']);
        Route::post('providers/{slug}/contact-events', [ContactEventsController::class, 'store'])
            ->middleware('throttle:contact-events');
        Route::post('contact-message', ContactMessagesController::class)
            ->middleware('throttle:contact-form');
    });

    Route::middleware('throttle:geocoding')->group(function () {
        Route::get('geocode/suggest', [GeocodingController::class, 'suggest']);
        Route::get('geocode/reverse', [GeocodingController::class, 'reverse']);
    });

    Route::middleware('throttle:auth')->group(function () {
        Route::post('register', [RegisteredProvidersController::class, 'store']);
        Route::post('login', [AuthenticatedSessionController::class, 'store']);
        Route::post('forgot-password', [PasswordResetController::class, 'sendLink']);
        Route::post('reset-password', [PasswordResetController::class, 'reset']);
    });

    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
        Route::get('user', [CurrentUserController::class, 'show']);
        Route::post('logout', [AuthenticatedSessionController::class, 'destroy']);
        Route::put('password', [PasswordController::class, 'update'])->middleware('throttle:password-change');

        Route::middleware('provider')->prefix('provider')->group(function () {
            Route::get('profile', [ProviderProfileController::class, 'show']);
            Route::put('profile', [ProviderProfileController::class, 'update']);
            Route::post('profile/submit', [ProviderSubmissionController::class, 'store']);
            Route::post('profile/images/{kind}', [ProviderImagesController::class, 'store'])->middleware('throttle:uploads');
            Route::get('portfolio', [ProviderPortfolioController::class, 'index']);
            Route::post('portfolio', [ProviderPortfolioController::class, 'store'])->middleware('throttle:uploads');
            Route::put('portfolio/order', [ProviderPortfolioController::class, 'update']);
            Route::delete('portfolio/{image}', [ProviderPortfolioController::class, 'destroy']);
            Route::put('opening-hours', [ProviderOpeningHoursController::class, 'update']);
            Route::get('subscriptions', [ProviderSubscriptionsController::class, 'index']);
            Route::post('subscriptions', [ProviderSubscriptionsController::class, 'store']);
            Route::get('property-listings', [PropertyListingsController::class, 'index']);
            Route::post('property-listings', [PropertyListingsController::class, 'store']);
            Route::post('property-listings/{propertyListing}/images', [PropertyListingImagesController::class, 'store'])
                ->middleware('throttle:uploads');
        });

        Route::middleware('admin')->prefix('admin')->group(function () {
            Route::get('dashboard', [AdminDashboardController::class, 'index']);
            Route::get('users', [AdminUsersController::class, 'index']);
            Route::get('categories', [AdminCategoriesController::class, 'index']);
            Route::post('categories', [AdminCategoriesController::class, 'store']);
            Route::put('categories/{category:id}', [AdminCategoriesController::class, 'update']);
            Route::get('providers/{provider:id}', [ProviderModerationController::class, 'show']);
            Route::get('providers/{provider:id}/history', [ProviderModerationController::class, 'history']);
            Route::post('providers/{provider:id}/{action}', [ProviderModerationController::class, 'update'])
                ->whereIn('action', ['approved', 'rejected', 'suspended', 'reactivated']);
            Route::get('settings', [PlatformSettingsController::class, 'index']);
            Route::put('settings', [PlatformSettingsController::class, 'update']);
            Route::get('subscriptions', [AdminSubscriptionsController::class, 'index']);
            Route::put('subscriptions/{membership}', [AdminSubscriptionsController::class, 'update']);

            Route::prefix('rest')->group(function () {
                Rest::resource('providers', RestProvidersController::class)->only(['details', 'search']);
                Rest::resource('service-categories', RestServiceCategoriesController::class);
            });
        });
    });
});
