<?php

namespace Tests\Feature\Subscription;

use App\Enums\ProviderType;
use App\Enums\UserRole;
use App\Models\Provider;
use App\Models\Subscription;
use App\Models\SubscriptionUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_catalog_returns_all_nine_subscription_options(): void
    {
        $this->getJson('/api/v1/subscriptions')
            ->assertOk()
            ->assertJsonCount(9, 'data')
            ->assertJsonPath('data.0.slug', 'services-free');
    }

    public function test_individual_can_request_multiple_missing_free_categories_later(): void
    {
        $provider = Provider::factory()->ofType(ProviderType::Individual)->create();
        $subscriptions = Subscription::query()
            ->whereIn('slug', ['rental-free', 'sales-free'])
            ->pluck('id')
            ->all();

        $this->loginAs($provider->user)
            ->postJson('/api/v1/provider/subscriptions', ['subscription_ids' => $subscriptions])
            ->assertCreated()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.membership.state', 'awaiting_approval');

        $this->assertDatabaseCount('subscription_user', 2);
    }

    public function test_provider_cannot_request_a_second_plan_while_category_is_awaiting_approval(): void
    {
        $provider = Provider::factory()->ofType(ProviderType::Agency)->create();
        $plus = Subscription::query()->where('slug', 'services-plus')->firstOrFail();
        $pro = Subscription::query()->where('slug', 'services-pro')->firstOrFail();
        SubscriptionUser::create(['user_id' => $provider->user_id, 'subscription_id' => $plus->id]);

        $this->loginAs($provider->user)
            ->postJson('/api/v1/provider/subscriptions', ['subscription_ids' => [$pro->id]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('subscription_ids');

        $this->assertDatabaseCount('subscription_user', 1);
    }

    public function test_admin_activates_an_awaiting_subscription_with_start_and_end_dates(): void
    {
        $this->travelTo('2026-09-14 10:00:00');
        $provider = Provider::factory()->ofType(ProviderType::Agency)->create();
        $subscription = Subscription::query()->where('slug', 'services-plus')->firstOrFail();
        $membership = SubscriptionUser::create([
            'user_id' => $provider->user_id,
            'subscription_id' => $subscription->id,
        ]);
        $admin = User::factory()->create();
        $admin->assignRole(UserRole::Admin->value);

        $this->loginAs($admin)
            ->putJson('/api/v1/admin/subscriptions/'.$membership->id, [
                'starts_at' => '2026-09-14 00:00:00',
                'ends_at' => '2027-03-14 23:59:59',
            ])
            ->assertOk()
            ->assertJsonPath('data.state', 'active');

        $this->assertDatabaseHas('subscription_user', [
            'id' => $membership->id,
            'approved_by' => $admin->id,
            'starts_at' => '2026-09-14 00:00:00',
            'ends_at' => '2027-03-14 23:59:59',
        ]);
    }

    public function test_admin_cannot_activate_with_an_end_date_before_the_start_date(): void
    {
        $provider = Provider::factory()->ofType(ProviderType::Agency)->create();
        $subscription = Subscription::query()->where('slug', 'services-plus')->firstOrFail();
        $membership = SubscriptionUser::create([
            'user_id' => $provider->user_id,
            'subscription_id' => $subscription->id,
        ]);
        $admin = User::factory()->create();
        $admin->assignRole(UserRole::Admin->value);

        $this->loginAs($admin)
            ->putJson('/api/v1/admin/subscriptions/'.$membership->id, [
                'starts_at' => '2026-09-14',
                'ends_at' => '2026-09-13',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('ends_at');

        $this->assertNull($membership->refresh()->approved_at);
    }

    public function test_provider_cannot_activate_its_own_subscription(): void
    {
        $provider = Provider::factory()->ofType(ProviderType::Agency)->create();
        $subscription = Subscription::query()->where('slug', 'services-plus')->firstOrFail();
        $membership = SubscriptionUser::create([
            'user_id' => $provider->user_id,
            'subscription_id' => $subscription->id,
        ]);

        $this->loginAs($provider->user)
            ->putJson('/api/v1/admin/subscriptions/'.$membership->id, [
                'starts_at' => '2026-09-14',
                'ends_at' => '2027-03-14',
            ])
            ->assertForbidden();
    }
}
