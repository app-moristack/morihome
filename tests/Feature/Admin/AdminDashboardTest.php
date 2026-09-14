<?php

namespace Tests\Feature\Admin;

use App\Enums\ProviderType;
use App\Enums\UserRole;
use App\Models\PageView;
use App\Models\Provider;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $admin = User::factory()->create(['created_at' => now()->subYear()]);
        $admin->assignRole(UserRole::Admin->value);

        return $admin;
    }

    public function test_metrics_compare_periods_and_charts_include_zero_days(): void
    {
        $this->travelTo(now()->setDate(2026, 9, 11)->setTime(12, 0));
        $admin = $this->admin();
        $current = User::factory()->create(['created_at' => now()->subDays(2)]);
        Provider::factory()->ofType(ProviderType::Individual)->approved()->for($current)->create();
        $previous = User::factory()->create(['created_at' => now()->subDays(9)]);
        Provider::factory()->ofType(ProviderType::Agency)->pending()->for($previous)->create();
        PageView::query()->create(['event_id' => Str::uuid()->toString(), 'path' => '/']);
        $oldView = PageView::query()->create(['event_id' => Str::uuid()->toString(), 'path' => '/about']);
        $oldView->forceFill(['created_at' => now()->subDays(9)])->save();
        $ancientView = PageView::query()->create(['event_id' => Str::uuid()->toString(), 'path' => '/search']);
        $ancientView->forceFill(['created_at' => now()->subDays(90)])->save();

        $data = $this->loginAs($admin)->getJson('/api/v1/admin/dashboard?days=7')
            ->assertJsonPath('data.metrics.users.total', 3)
            ->assertJsonPath('data.metrics.users.current', 1)
            ->assertJsonPath('data.metrics.users.previous', 1)
            ->assertJsonPath('data.metrics.users.change_percent', 0)
            ->assertJsonPath('data.metrics.individuals.total', 1)
            ->assertJsonPath('data.metrics.businesses.total', 1)
            ->assertJsonPath('data.metrics.views.total', 1)
            ->assertJsonPath('data.metrics.views.previous', 1)
            ->assertJsonPath('data.user_status.active', 2)
            ->assertJsonPath('data.user_status.pending', 1)
            ->assertJsonCount(1, 'data.recent_users')
            ->assertJsonPath('data.recent_users.0.id', $current->id)
            ->assertJsonPath('data.top_pages.0.path', '/')
            ->assertJsonCount(7, 'data.overview')->json('data');

        $this->assertSame(1, array_sum(array_column($data['overview'], 'individuals')));
        $this->assertSame(0, array_sum(array_column($data['overview'], 'businesses')));
        $this->assertSame(1, array_sum(array_column($data['overview'], 'views')));
        $this->assertSame('2026-09-05', $data['overview'][0]['start']);
        $this->assertSame('2026-09-11', $data['overview'][6]['end']);
        $this->assertNull($data['metrics']['individuals']['change_percent']);

        $this->getJson('/api/v1/admin/dashboard?days=30')
            ->assertJsonPath('data.metrics.views.total', 2)
            ->assertJsonCount(5, 'data.overview');
    }

    public function test_dashboard_and_user_endpoints_require_an_admin(): void
    {
        $this->getJson('/api/v1/admin/dashboard')->assertUnauthorized();
        $this->getJson('/api/v1/admin/users')->assertUnauthorized();
        $user = User::factory()->create();
        $this->loginAs($user)->getJson('/api/v1/admin/dashboard')->assertForbidden();
        $this->getJson('/api/v1/admin/users')->assertForbidden();
    }

    public function test_user_filters_search_and_pagination_are_combined(): void
    {
        $admin = $this->admin();
        $category = ServiceCategory::factory()->create(['name' => 'Electrical testing']);
        $business = Provider::factory()->ofType(ProviderType::Agency)->pending()->create(['name' => 'Volt Mauritius', 'locality' => 'Curepipe']);
        $business->serviceCategories()->attach($category);
        Provider::factory()->ofType(ProviderType::Individual)->pending()->create(['name' => 'Volt Individual']);
        Provider::factory()->ofType(ProviderType::Agency)->approved()->create(['name' => 'Volt Approved']);
        Provider::factory()->suspended()->create();
        Provider::factory()->draft()->create();
        User::factory()->count(12)->create();

        $this->loginAs($admin)->getJson('/api/v1/admin/users?type=agency&status=pending&term=Electrical')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.provider_id', $business->id)
            ->assertJsonPath('data.0.name', 'Volt Mauritius')
            ->assertJsonPath('data.0.status', 'pending')
            ->assertJsonPath('meta.total', 1)
            ->assertJsonMissingPath('data.0.password')
            ->assertJsonMissingPath('data.0.remember_token');
        $this->getJson('/api/v1/admin/users?term=Curepipe&type=agency&status=pending')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/admin/users?status=inactive')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/admin/users?status=suspended')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/admin/users?per_page=10&page=2')->assertJsonPath('meta.current_page', 2)->assertJsonCount(8, 'data');
        $this->getJson('/api/v1/admin/users?term=does-not-exist')->assertJsonPath('meta.total', 0);
    }

    public function test_invalid_ranges_and_filters_are_rejected(): void
    {
        $this->loginAs($this->admin())->getJson('/api/v1/admin/dashboard?days=365')->assertJsonValidationErrors('days');
        $this->getJson('/api/v1/admin/users?type=admin&status=unknown&page=0&per_page=999')->assertJsonValidationErrors(['type', 'status', 'page', 'per_page']);
    }

    public function test_admin_can_create_and_update_categories_without_reactivating_them(): void
    {
        $this->loginAs($this->admin());
        $payload = ['name' => 'Solar inspections', 'slug' => 'solar-inspections', 'icon' => 'zap', 'sort_order' => 50, 'is_active' => false, 'is_popular' => false];
        $id = $this->postJson('/api/v1/admin/categories', $payload)->assertCreated()->json('data.id');
        $this->assertDatabaseHas('service_categories', ['id' => $id, 'name' => 'Solar inspections', 'is_active' => false]);
        $this->putJson('/api/v1/admin/categories/'.$id, [...$payload, 'name' => 'Solar safety inspections'])->assertJsonPath('data.is_active', false);
        $this->assertDatabaseHas('service_categories', ['id' => $id, 'name' => 'Solar safety inspections', 'is_active' => false]);
        $this->getJson('/api/v1/admin/categories')->assertJsonFragment(['id' => $id, 'is_active' => false]);
        $this->postJson('/api/v1/admin/categories', $payload)->assertJsonValidationErrors('slug');
        $this->putJson('/api/v1/admin/categories/'.$id, [...$payload, 'name' => '', 'sort_order' => -1])->assertJsonValidationErrors(['name', 'sort_order']);
    }

    public function test_non_admin_cannot_manage_categories(): void
    {
        $this->getJson('/api/v1/admin/categories')->assertUnauthorized();
        $category = ServiceCategory::factory()->create();
        $this->loginAs(User::factory()->create())->postJson('/api/v1/admin/categories', [])->assertForbidden();
        $this->putJson('/api/v1/admin/categories/'.$category->id, [])->assertForbidden();
    }
}
