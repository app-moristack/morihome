<?php

namespace Tests\Feature\Provider;

use App\Models\Provider;
use App\Models\ServiceCategory;
use App\Models\Subscription;
use App\Models\SubscriptionUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\TestCase;

class ServiceSelectionLimitTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_property_only_profile_can_be_submitted_without_service_categories(): void
    {
        $provider = Provider::factory()->draft()->create();
        $provider->user->subscriptions()->attach(Subscription::where('slug', 'rental-free')->firstOrFail()->id);

        $this->loginAs($provider->user)->postJson('/api/v1/provider/profile/submit')
            ->assertOk()->assertJsonPath('data.approval_status', 'pending');
        $this->assertSame(0, $provider->serviceCategories()->count());
    }

    public function test_a_services_profile_still_requires_a_service_before_review(): void
    {
        $provider = Provider::factory()->draft()->create();
        $provider->user->subscriptions()->attach(Subscription::where('slug', 'services-free')->firstOrFail()->id);

        $this->loginAs($provider->user)->postJson('/api/v1/provider/profile/submit')->assertUnprocessable();
    }

    #[TestWith(['services-free', 1])]
    #[TestWith(['services-plus', 5])]
    #[TestWith(['services-pro', 15])]
    public function test_selected_plan_limits_are_enforced_for_profile_services(string $slug, int $limit): void
    {
        $provider = Provider::factory()->draft()->create();
        $provider->user->subscriptions()->attach(Subscription::where('slug', $slug)->firstOrFail()->id);
        $categories = ServiceCategory::where('is_active', true)->limit($limit + 1)->pluck('id')->all();

        $this->loginAs($provider->user)->getJson('/api/v1/provider/profile')
            ->assertOk()->assertJsonPath('data.service_selection_limit', $limit);

        $this->putJson('/api/v1/provider/profile', ['service_categories' => array_slice($categories, 0, $limit)])
            ->assertOk()->assertJsonCount($limit, 'data.service_categories');

        $this->putJson('/api/v1/provider/profile', ['service_categories' => $categories])
            ->assertUnprocessable()->assertJsonValidationErrors('service_categories');

        $this->assertSame($limit, $provider->serviceCategories()->count());
    }

    public function test_no_services_plan_prevents_selection_but_allows_an_empty_profile(): void
    {
        $provider = Provider::factory()->draft()->create();
        $category = ServiceCategory::firstOrFail();
        $this->loginAs($provider->user)->putJson('/api/v1/provider/profile', ['service_categories' => [$category->id]])
            ->assertUnprocessable()->assertJsonValidationErrors('service_categories');
        $this->putJson('/api/v1/provider/profile', ['service_categories' => []])->assertOk();
        $this->assertSame(0, $provider->serviceCategories()->count());
    }

    public function test_an_active_plan_takes_precedence_over_a_pending_upgrade(): void
    {
        $provider = Provider::factory()->draft()->create();
        SubscriptionUser::create([
            'user_id' => $provider->user_id,
            'subscription_id' => Subscription::where('slug', 'services-free')->firstOrFail()->id,
            'starts_at' => now()->subDay(), 'ends_at' => now()->addMonth(),
        ]);
        $provider->user->subscriptions()->attach(Subscription::where('slug', 'services-pro')->firstOrFail()->id);
        $this->loginAs($provider->user)->getJson('/api/v1/provider/profile')
            ->assertOk()->assertJsonPath('data.service_selection_limit', 1);
    }

    public function test_expired_services_plans_do_not_allow_new_service_selection(): void
    {
        $provider = Provider::factory()->draft()->create();
        SubscriptionUser::create([
            'user_id' => $provider->user_id,
            'subscription_id' => Subscription::where('slug', 'services-plus')->firstOrFail()->id,
            'starts_at' => now()->subMonths(7), 'ends_at' => now()->subDay(),
        ]);
        $this->loginAs($provider->user)->getJson('/api/v1/provider/profile')
            ->assertOk()->assertJsonPath('data.service_selection_limit', 0);

        $this->putJson('/api/v1/provider/profile', ['service_categories' => [ServiceCategory::firstOrFail()->id]])
            ->assertUnprocessable()->assertJsonValidationErrors('service_categories');
    }
}
