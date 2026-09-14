<?php

namespace Tests\Feature\Public;

use App\Models\Provider;
use App\Models\ServiceCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoAndSpaTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_home_page_carries_a_descriptive_title_and_description(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('Find trusted construction &amp; renovation professionals in Mauritius', false)
            ->assertSee('<meta name="description"', false);
    }

    public function test_the_home_page_publishes_website_structured_data(): void
    {
        $this->get('/')
            ->assertSee('application/ld+json', false)
            ->assertSee('"@type":"WebSite"', false);
    }

    public function test_an_approved_profile_gets_its_own_title_and_structured_data(): void
    {
        $provider = Provider::factory()->approved()->create(['name' => 'Volt Maurice', 'locality' => 'Curepipe']);
        $provider->serviceCategories()->attach(ServiceCategory::where('slug', 'electrician')->firstOrFail());

        $this->get('/providers/'.$provider->slug)
            ->assertOk()
            ->assertSee('<title>Volt Maurice — Electrician in Curepipe | MoriHome</title>', false)
            ->assertSee('"@type":"LocalBusiness"', false)
            ->assertSee('og:title', false);
    }

    public function test_a_profile_page_renders_crawlable_content_without_javascript(): void
    {
        $provider = Provider::factory()->approved()->create(['name' => 'Sega Tiles']);
        $provider->serviceCategories()->attach(ServiceCategory::where('slug', 'tiler')->firstOrFail());

        $this->get('/providers/'.$provider->slug)
            ->assertSee('<noscript>', false)
            ->assertSee('<h1>Sega Tiles</h1>', false);
    }

    public function test_structured_data_never_carries_the_exact_coordinates(): void
    {
        $provider = Provider::factory()->approved()->create([
            'latitude' => -20.1609123,
            'longitude' => 57.5012987,
        ]);

        $response = $this->get('/providers/'.$provider->slug);

        $response->assertDontSee('-20.1609123', false);
        $response->assertSee('"latitude":-20.16', false);
    }

    public function test_an_unapproved_profile_is_marked_noindex(): void
    {
        $provider = Provider::factory()->pending()->create();

        $this->get('/providers/'.$provider->slug)
            ->assertOk()
            ->assertSee('Profile not found', false)
            ->assertSee('name="robots" content="noindex', false);
    }

    public function test_search_results_are_not_indexed(): void
    {
        $this->get('/search?address=Curepipe')
            ->assertOk()
            ->assertSee('name="robots" content="noindex', false);
    }

    public function test_the_shell_declares_the_pwa_manifest_and_ios_metadata(): void
    {
        $this->get('/')
            ->assertSee('rel="manifest"', false)
            ->assertSee('apple-mobile-web-app-capable', false)
            ->assertSee('apple-touch-icon', false)
            ->assertSee('name="theme-color" content="#F5C518"', false)
            ->assertSee('viewport-fit=cover', false);
    }

    public function test_the_shell_bootstraps_the_client_with_search_settings(): void
    {
        $this->get('/')
            ->assertSee('window.__MORIHOME__', false)
            ->assertSee('"defaultRadiusKm":10', false)
            ->assertSee('"providerTypes":[{"value":"individual","label":"Individual worker"},{"value":"agency","label":"Agency\\/Business"}]', false)
            ->assertDontSee('"value":"business"', false);
    }

    public function test_deep_links_into_the_spa_are_served_rather_than_404(): void
    {
        foreach (['/search', '/for-professionals', '/register/individual', '/register/business', '/login', '/dashboard', '/admin', '/install', '/terms'] as $path) {
            $this->get($path)->assertOk();
        }
    }

    public function test_api_routes_are_not_swallowed_by_the_spa_catch_all(): void
    {
        $this->getJson('/api/v1/does-not-exist')->assertNotFound();
        $this->get('/up')->assertOk();
    }

    public function test_static_pages_expose_their_own_titles(): void
    {
        $this->get('/privacy')->assertSee('<title>Privacy policy — MoriHome</title>', false);
        $this->get('/terms')->assertSee('<title>Terms of use — MoriHome</title>', false);
    }
}
