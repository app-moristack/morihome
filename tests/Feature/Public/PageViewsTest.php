<?php

namespace Tests\Feature\Public;

use App\Enums\UserRole;
use App\Models\Provider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class PageViewsTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_public_view_is_recorded_once_per_event_id(): void
    {
        $eventId = Str::uuid()->toString();
        $this->postJson('/api/v1/page-views', ['event_id' => $eventId, 'path' => '/'])->assertNoContent();
        $this->postJson('/api/v1/page-views', ['event_id' => $eventId, 'path' => '/'])->assertNoContent();
        $this->assertDatabaseCount('page_views', 1);
        $this->assertDatabaseHas('page_views', ['event_id' => $eventId, 'path' => '/']);
        $this->postJson('/api/v1/page-views', ['event_id' => Str::uuid()->toString(), 'path' => '/about'])->assertNoContent();
        $this->assertDatabaseCount('page_views', 2);
    }

    public function test_private_paths_queries_and_invalid_ids_are_rejected(): void
    {
        foreach (['/admin', '/dashboard', '/login', '/reset-password', '/search?email=private@example.com', '//external.example', '/unknown', '/providers/invalid/extra'] as $path) {
            $this->postJson('/api/v1/page-views', ['event_id' => Str::uuid()->toString(), 'path' => $path])->assertJsonValidationErrors('path');
        }
        $this->postJson('/api/v1/page-views', ['event_id' => 'invalid', 'path' => '/'])->assertJsonValidationErrors('event_id');
        $this->assertDatabaseCount('page_views', 0);
    }

    public function test_only_publicly_visible_provider_profiles_are_counted(): void
    {
        $public = Provider::factory()->approved()->create();
        $pending = Provider::factory()->pending()->create();
        $this->postJson('/api/v1/page-views', ['event_id' => Str::uuid()->toString(), 'path' => '/providers/'.$pending->slug])->assertNotFound();
        $this->postJson('/api/v1/page-views', ['event_id' => Str::uuid()->toString(), 'path' => '/providers/'.$public->slug])->assertNoContent();
        $this->assertDatabaseCount('page_views', 1);
    }

    public function test_administrator_visits_are_excluded(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(UserRole::Admin->value);
        $this->loginAs($admin)->postJson('/api/v1/page-views', ['event_id' => Str::uuid()->toString(), 'path' => '/'])->assertNoContent();
        $this->assertDatabaseCount('page_views', 0);
    }
}
