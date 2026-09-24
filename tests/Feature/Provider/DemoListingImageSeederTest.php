<?php

namespace Tests\Feature\Provider;

use App\Models\PropertyListing;
use App\Models\PropertyListingImage;
use App\Models\Provider;
use App\Models\ProviderPortfolioImage;
use Database\Seeders\DemoListingImageSeeder;
use Database\Seeders\DemoPropertySeeder;
use Database\Seeders\DemoProviderSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DemoListingImageSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_explicit_production_run_only_adds_images_to_existing_known_demo_records(): void
    {
        Storage::fake('public');
        $demo = PropertyListing::factory()->create(['slug' => 'demo-property-rental-01', 'property_type' => 'villa']);
        $other = PropertyListing::factory()->create(['slug' => 'demo-property-custom', 'property_type' => 'villa']);
        $this->app->detectEnvironment(fn () => 'production');
        try {
            $this->artisan('db:seed', ['--class' => DemoListingImageSeeder::class, '--force' => true])->assertSuccessful();
            $this->artisan('db:seed', ['--class' => DemoListingImageSeeder::class, '--force' => true])->assertSuccessful();
        } finally {
            $this->app->detectEnvironment(fn () => 'testing');
        }
        $this->assertSame(2, PropertyListing::count());
        $this->assertSame(2, $demo->images()->count());
        $this->assertSame(0, $other->images()->count());
        foreach ($demo->images as $image) {
            Storage::disk('public')->assertExists($image->path);
        }
    }

    public function test_all_demo_listings_receive_locally_stored_images_without_duplicates(): void
    {
        Storage::fake('public');
        $this->seed([DemoProviderSeeder::class, DemoPropertySeeder::class]);

        $this->seed(DemoListingImageSeeder::class);

        $this->assertSame(26, Provider::whereNotNull('cover_path')->count());
        $this->assertSame(40, PropertyListing::has('images')->count());
        $this->assertSame(72, PropertyListingImage::count());
        $this->assertSame(26, ProviderPortfolioImage::count());
        foreach (Provider::all() as $provider) {
            Storage::disk('public')->assertExists($provider->cover_path);
        }
        foreach (PropertyListingImage::all() as $image) {
            Storage::disk('public')->assertExists($image->path);
            $this->assertSame('image/webp', Storage::disk('public')->mimeType($image->path));
        }
        foreach (ProviderPortfolioImage::all() as $image) {
            Storage::disk('public')->assertExists($image->path);
        }
        $plumber = Provider::where('slug', 'ti-marmit-plomberie')->firstOrFail();
        $this->assertSame(
            file_get_contents(resource_path('images/listings/plumber.webp')),
            Storage::disk('public')->get($plumber->cover_path),
        );

        $this->seed(DemoListingImageSeeder::class);

        $this->assertSame(72, PropertyListingImage::count());
        $this->assertSame(26, ProviderPortfolioImage::count());
    }

    public function test_preserves_uploaded_photos_and_does_not_modify_non_demo_listings(): void
    {
        Storage::fake('public');
        $provider = Provider::factory()->create(['slug' => 'ti-marmit-plomberie', 'cover_path' => 'uploaded-cover.webp']);
        $provider->portfolioImages()->create(['path' => 'uploaded-portfolio.webp', 'sort_order' => 0]);
        $listing = PropertyListing::factory()->create(['slug' => 'demo-property-rental-01']);
        $listing->images()->create(['path' => 'uploaded-property.webp', 'sort_order' => 0]);
        $realProvider = Provider::factory()->create(['cover_path' => null]);
        $realListing = PropertyListing::factory()->create();

        $this->seed(DemoListingImageSeeder::class);

        $this->assertSame('uploaded-cover.webp', $provider->fresh()->cover_path);
        $this->assertSame(['uploaded-portfolio.webp'], $provider->portfolioImages()->pluck('path')->all());
        $this->assertSame(['uploaded-property.webp'], $listing->images()->pluck('path')->all());
        $this->assertNull($realProvider->fresh()->cover_path);
        $this->assertSame(0, $realProvider->portfolioImages()->count());
        $this->assertSame(0, $realListing->images()->count());
        $this->assertSame([], Storage::disk('public')->allFiles());
    }
}
