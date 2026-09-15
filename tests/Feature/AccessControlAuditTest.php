<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\PropertyListing;
use App\Models\Provider;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Tests\Support\FakeImage;
use Tests\TestCase;

class AccessControlAuditTest extends TestCase
{
    use RefreshDatabase;

    public function test_every_admin_and_provider_endpoint_requires_authentication(): void
    {
        foreach ($this->protectedEndpoints() as [$method, $uri]) {
            $this->json($method, $uri)->assertUnauthorized();
        }
    }

    public function test_a_provider_cannot_call_any_admin_endpoint(): void
    {
        $provider = Provider::factory()->pending()->create();
        $category = ServiceCategory::query()->firstOrFail();
        $this->loginAs($provider->user);

        foreach ($this->protectedEndpoints('admin', ['provider' => $provider->id, 'category' => $category->id]) as [$method, $uri]) {
            $this->json($method, $uri)->assertForbidden();
        }

        $this->assertSame('pending', $provider->fresh()->approval_status->value);
    }

    public function test_an_admin_without_a_provider_profile_cannot_use_provider_endpoints(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(UserRole::Admin->value);
        $owner = Provider::factory()->create();
        $image = $owner->portfolioImages()->create(['path' => 'audit/existing.png']);
        $listing = PropertyListing::factory()->for($owner)->create();
        $this->loginAs($admin);

        foreach ($this->protectedEndpoints('provider', ['image' => $image->id, 'propertyListing' => $listing->slug]) as [$method, $uri]) {
            $this->json($method, $uri)->assertForbidden();
        }

        $this->assertModelExists($image);
    }

    public function test_a_provider_cannot_upload_photos_to_another_providers_property(): void
    {
        Storage::fake('public');
        $listing = PropertyListing::factory()->create();
        $other = Provider::factory()->create();

        $this->loginAs($other->user)
            ->postJson('/api/v1/provider/property-listings/'.$listing->slug.'/images', [
                'image' => FakeImage::upload('audit.png', 800, 600),
            ])->assertForbidden();

        $this->assertDatabaseCount('property_listing_images', 0);
        Storage::disk('public')->assertDirectoryEmpty('property-listings');
    }

    public function test_provider_listing_and_portfolio_reads_are_scoped_to_the_owner(): void
    {
        $own = PropertyListing::factory()->create();
        $other = PropertyListing::factory()->create();
        $ownImage = $own->provider->portfolioImages()->create(['path' => 'audit/own.png']);
        $other->provider->portfolioImages()->create(['path' => 'audit/other.png']);
        $this->loginAs($own->provider->user);

        $this->getJson('/api/v1/provider/property-listings')->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $own->id);
        $this->getJson('/api/v1/provider/portfolio')->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $ownImage->id);
    }

    /** @return array<int, array{string, string}> */
    private function protectedEndpoints(?string $area = null, array $parameters = []): array
    {
        $endpoints = [];
        foreach (Route::getRoutes() as $route) {
            if (! preg_match('#^api/v1/(admin|provider)/#', $route->uri(), $match) || ($area !== null && $match[1] !== $area)) {
                continue;
            }
            $uri = preg_replace_callback('/\{([^}:]+)(?::[^}]+)?\}/', fn (array $match): string => (string) ($parameters[$match[1]] ?? match ($match[1]) {
                'action' => 'approved',
                'kind' => 'logo',
                default => 1,
            }), $route->uri());
            foreach (array_diff($route->methods(), ['HEAD']) as $method) {
                $endpoints[] = [$method, '/'.$uri];
            }
        }

        return $endpoints;
    }
}
