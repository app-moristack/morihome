<?php

namespace Tests\Feature\Public;

use App\Enums\ProviderType;
use App\Models\Locality;
use App\Models\Provider;
use App\Models\ServiceCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProviderSearchTest extends TestCase
{
    use RefreshDatabase;

    private Locality $portLouis;

    private ServiceCategory $plumber;

    protected function setUp(): void
    {
        parent::setUp();

        $this->portLouis = Locality::where('slug', 'port-louis')->firstOrFail();
        $this->plumber = ServiceCategory::where('slug', 'plumber')->firstOrFail();
    }

    public function test_a_visitor_can_search_without_an_account(): void
    {
        $this->approvedProviderAt($this->portLouis);

        $response = $this->getJson($this->searchUrl());

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_results_carry_the_calculated_distance(): void
    {
        $this->approvedProviderAt($this->portLouis);

        $response = $this->getJson($this->searchUrl(['radius_km' => 50]));

        $this->assertIsNumeric($response->json('data.0.distance_km'));
        $this->assertLessThan(50, $response->json('data.0.distance_km'));
    }

    public function test_providers_outside_the_radius_are_excluded(): void
    {
        $mahebourg = Locality::where('slug', 'mahebourg')->firstOrFail();
        $this->approvedProviderAt($mahebourg, ['name' => 'Far Away Plumber']);

        $this->getJson($this->searchUrl(['radius_km' => 10]))->assertJsonCount(0, 'data');
        $this->getJson($this->searchUrl(['radius_km' => 50]))->assertJsonCount(1, 'data');
    }

    public function test_results_are_ordered_by_distance_when_sorting_by_distance(): void
    {
        $this->approvedProviderAt(Locality::where('slug', 'curepipe')->firstOrFail(), ['name' => 'Far']);
        $this->approvedProviderAt($this->portLouis, ['name' => 'Near']);

        $response = $this->getJson($this->searchUrl(['radius_km' => 50, 'sort' => 'distance']));

        $this->assertSame(['Near', 'Far'], $response->json('data.*.name'));
    }

    public function test_featured_providers_lead_the_recommended_ordering(): void
    {
        $this->approvedProviderAt($this->portLouis, ['name' => 'Plain']);
        Provider::factory()->approved()->featured()->at($this->portLouis)->create(['name' => 'Featured'])
            ->serviceCategories()->attach($this->plumber);

        $response = $this->getJson($this->searchUrl(['radius_km' => 50, 'sort' => 'recommended']));

        $this->assertSame('Featured', $response->json('data.0.name'));
    }

    public function test_featured_providers_lead_distance_sorting_after_filters_and_before_pagination(): void
    {
        $plain = $this->approvedProviderAt($this->portLouis);
        $featured = Provider::factory()->approved()->featured()
            ->at(Locality::where('slug', 'curepipe')->firstOrFail())->create();
        $featured->serviceCategories()->attach($this->plumber);
        Provider::factory()->approved()->featured()->at($this->portLouis)->create()
            ->serviceCategories()->attach(ServiceCategory::where('slug', 'electrician')->firstOrFail());
        $filters = ['radius_km' => 50, 'sort' => 'distance', 'service_category_id' => $this->plumber->id, 'per_page' => 1];
        $this->getJson($this->searchUrl($filters))->assertOk()
            ->assertJsonPath('meta.total', 2)->assertJsonPath('data.0.id', $featured->id);
        $this->getJson($this->searchUrl([...$filters, 'page' => 2]))->assertOk()
            ->assertJsonPath('data.0.id', $plain->id);
        $this->getJson($this->searchUrl([...$filters, 'radius_km' => 10]))->assertOk()
            ->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.id', $plain->id);
    }

    public function test_only_the_requested_category_is_returned(): void
    {
        $electrician = ServiceCategory::where('slug', 'electrician')->firstOrFail();
        $this->approvedProviderAt($this->portLouis, ['name' => 'The Plumber']);
        Provider::factory()->approved()->at($this->portLouis)->create(['name' => 'The Electrician'])
            ->serviceCategories()->attach($electrician);

        $response = $this->getJson($this->searchUrl(['service_category_id' => $this->plumber->id]));

        $response->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'The Plumber');
    }

    public function test_an_address_is_geocoded_into_coordinates(): void
    {
        $this->approvedProviderAt($this->portLouis);

        $response = $this->getJson('/api/v1/providers/search?address=Port+Louis&radius_km=10');

        $response->assertOk()->assertJsonCount(1, 'data');
        $this->assertEqualsWithDelta(-20.1609, $response->json('meta.search.latitude'), 0.01);
    }

    public function test_category_only_search_returns_matching_professionals_across_mauritius(): void
    {
        $near = $this->approvedProviderAt($this->portLouis);
        $far = $this->approvedProviderAt(Locality::where('slug', 'mahebourg')->firstOrFail());
        Provider::factory()->approved()->at($this->portLouis)->create()
            ->serviceCategories()->attach(ServiceCategory::where('slug', 'electrician')->firstOrFail());
        Provider::factory()->pending()->at($this->portLouis)->create()
            ->serviceCategories()->attach($this->plumber);
        $this->approvedProviderAt($this->portLouis, ['is_active' => false]);

        $response = $this->getJson('/api/v1/providers/search?'.http_build_query([
            'service_category_id' => $this->plumber->id,
            'address' => '   ',
            'radius_km' => 1,
        ]));

        $response->assertOk()->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.search.latitude', null)
            ->assertJsonPath('meta.search.longitude', null)
            ->assertJsonPath('meta.search.radius_km', null);
        $this->assertEqualsCanonicalizing([$near->id, $far->id], $response->json('data.*.id'));
        $this->assertArrayNotHasKey('distance_km', $response->json('data.0'));
    }

    public function test_category_only_search_uses_recommended_ordering_and_pagination(): void
    {
        $this->approvedProviderAt($this->portLouis);
        $featured = Provider::factory()->approved()->featured()->at($this->portLouis)->create();
        $featured->serviceCategories()->attach($this->plumber);

        $this->getJson('/api/v1/providers/search?'.http_build_query([
            'service_category_id' => $this->plumber->id,
            'sort' => 'distance',
            'per_page' => 1,
        ]))->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $featured->id)
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonPath('meta.search.sort', 'recommended');
    }

    public function test_category_search_still_rejects_an_unknown_address(): void
    {
        $this->getJson('/api/v1/providers/search?'.http_build_query([
            'service_category_id' => $this->plumber->id,
            'address' => 'Atlantis',
        ]))->assertStatus(422);
    }

    public function test_category_search_still_requires_a_complete_coordinate_pair(): void
    {
        $this->getJson('/api/v1/providers/search?'.http_build_query([
            'service_category_id' => $this->plumber->id,
            'latitude' => $this->portLouis->latitude,
        ]))->assertStatus(422)->assertJsonValidationErrors('longitude');
    }

    public function test_an_unknown_address_is_reported_rather_than_silently_ignored(): void
    {
        $this->getJson('/api/v1/providers/search?address=Atlantis&radius_km=10')
            ->assertStatus(422);
    }

    public function test_a_search_without_any_location_is_rejected(): void
    {
        $this->getJson('/api/v1/providers/search?radius_km=10')
            ->assertStatus(422)
            ->assertJsonValidationErrors('address');
    }

    public function test_the_radius_is_capped_at_the_configured_maximum(): void
    {
        $this->getJson($this->searchUrl(['radius_km' => 999]))
            ->assertStatus(422)
            ->assertJsonValidationErrors('radius_km');
    }

    public function test_exact_coordinates_are_never_exposed_in_search_results(): void
    {
        $this->approvedProviderAt($this->portLouis, [
            'latitude' => -20.1609123,
            'longitude' => 57.5012987,
        ]);

        $result = $this->getJson($this->searchUrl())->json('data.0');

        $this->assertArrayNotHasKey('latitude', $result);
        $this->assertArrayNotHasKey('longitude', $result);
        $this->assertArrayNotHasKey('address', $result);
        $this->assertSame(-20.16, $result['approximate_latitude']);
        $this->assertSame(57.5, $result['approximate_longitude']);
    }

    public function test_results_can_be_narrowed_to_verified_providers(): void
    {
        $this->approvedProviderAt($this->portLouis, ['name' => 'Unverified']);
        Provider::factory()->approved()->verified()->at($this->portLouis)->create(['name' => 'Verified'])
            ->serviceCategories()->attach($this->plumber);

        $response = $this->getJson($this->searchUrl(['verified_only' => 1]));

        $response->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Verified');
    }

    public function test_results_can_be_narrowed_to_a_provider_type(): void
    {
        $this->approvedProviderAt($this->portLouis, ['name' => 'Solo'], ProviderType::Individual);
        $this->approvedProviderAt($this->portLouis, ['name' => 'Firm'], ProviderType::Agency);

        $response = $this->getJson($this->searchUrl(['provider_types' => ['agency']]));

        $response->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Firm');
    }

    public function test_results_are_paginated(): void
    {
        Provider::factory()->count(15)->approved()->at($this->portLouis)->create()
            ->each(fn (Provider $provider) => $provider->serviceCategories()->attach($this->plumber));

        $response = $this->getJson($this->searchUrl(['radius_km' => 50, 'per_page' => 5]));

        $response->assertJsonCount(5, 'data')->assertJsonPath('meta.total', 15);
    }

    private function searchUrl(array $overrides = []): string
    {
        $query = array_merge([
            'latitude' => $this->portLouis->latitude,
            'longitude' => $this->portLouis->longitude,
            'radius_km' => 10,
        ], $overrides);

        return '/api/v1/providers/search?'.http_build_query($query);
    }

    private function approvedProviderAt(
        Locality $locality,
        array $attributes = [],
        ?ProviderType $type = null,
    ): Provider {
        $provider = Provider::factory()
            ->approved()
            ->at($locality)
            ->ofType($type ?? ProviderType::Individual)
            ->create($attributes);

        $provider->serviceCategories()->attach($this->plumber);

        return $provider;
    }
}
