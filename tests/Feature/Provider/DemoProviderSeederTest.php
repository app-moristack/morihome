<?php

namespace Tests\Feature\Provider;

use App\Enums\SubscriptionCategory;
use App\Models\Provider;
use App\Models\ProviderModerationEvent;
use App\Models\ProviderOpeningHour;
use App\Models\SubscriptionUser;
use App\Models\User;
use App\Support\SubscriptionEntitlements;
use Database\Seeders\DemoProviderSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemoProviderSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_services_have_active_subscriptions_with_sufficient_capacity(): void
    {
        $this->freezeTime();

        $this->seed(DemoProviderSeeder::class);

        $providers = Provider::with('user', 'serviceCategories')->get();
        $this->assertNotEmpty($providers);

        foreach ($providers as $provider) {
            $membership = app(SubscriptionEntitlements::class)->activeFor($provider->user, SubscriptionCategory::Services);
            $this->assertNotNull($membership);
            $this->assertLessThanOrEqual($membership->subscription->active_item_limit, $provider->serviceCategories->count());

            if ($provider->is_featured) {
                $this->assertTrue($membership->subscription->featured_items);
            }
        }
    }

    public function test_rerunning_updates_existing_demo_subscriptions_without_duplicate_records(): void
    {
        $this->freezeTime();
        $this->seed(DemoProviderSeeder::class);
        $counts = [
            'users' => User::count(),
            'providers' => Provider::count(),
            'subscription_user' => SubscriptionUser::count(),
            'provider_opening_hours' => ProviderOpeningHour::count(),
            'provider_moderation_events' => ProviderModerationEvent::count(),
        ];
        SubscriptionUser::query()->update(['ends_at' => now()->subDay()]);

        $this->seed(DemoProviderSeeder::class);

        foreach ($counts as $table => $count) {
            $this->assertDatabaseCount($table, $count);
        }
        $this->assertSame(0, SubscriptionUser::where('ends_at', '<', now())->count());
    }
}
