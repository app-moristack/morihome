<?php

namespace Tests\Feature\Auth;

use App\Enums\ApprovalStatus;
use App\Enums\UserRole;
use App\Models\Provider;
use App\Models\ServiceCategory;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProviderRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_provider_can_register_with_the_mandatory_fields_only(): void
    {
        $response = $this->postJson('/api/v1/register', $this->payload());

        $response->assertCreated()
            ->assertJsonPath('data.provider.approval_status', 'draft')
            ->assertJsonPath('data.subscriptions.0.membership.state', 'awaiting_approval');

        $this->assertDatabaseHas('users', ['phone' => '+23057654321']);
        $this->assertDatabaseHas('providers', ['name' => 'Jean Plombier', 'locality' => 'Port Louis']);
        $this->assertDatabaseHas('subscription_user', ['starts_at' => null, 'ends_at' => null]);
    }

    public function test_a_new_provider_starts_as_a_draft_and_is_not_public(): void
    {
        $this->postJson('/api/v1/register', $this->payload())->assertCreated();

        $provider = Provider::firstOrFail();

        $this->assertSame(ApprovalStatus::Draft, $provider->approval_status);
        $this->assertFalse($provider->isPubliclyVisible());
        $this->getJson('/api/v1/providers/'.$provider->slug)->assertNotFound();
    }

    public function test_a_registered_provider_receives_the_provider_role(): void
    {
        $this->postJson('/api/v1/register', $this->payload())->assertCreated();

        $this->assertTrue(User::firstOrFail()->hasRole(UserRole::Provider->value));
    }

    public function test_the_phone_number_is_normalised_to_e164(): void
    {
        $this->postJson('/api/v1/register', $this->payload(['phone' => '5765 4321']))->assertCreated();

        $this->assertDatabaseHas('users', ['phone' => '+23057654321']);
        $this->assertDatabaseHas('providers', ['phone' => '+23057654321']);
    }

    public function test_whatsapp_defaults_to_the_registered_phone(): void
    {
        $this->postJson('/api/v1/register', $this->payload())->assertCreated();

        $this->assertSame('+23057654321', Provider::firstOrFail()->whatsapp_phone);
    }

    public function test_the_slug_is_unique_across_providers_sharing_a_name(): void
    {
        $this->postJson('/api/v1/register', $this->payload())->assertCreated();
        $this->postJson('/api/v1/register', $this->payload([
            'phone' => '57654322',
            'email' => 'second@example.mu',
        ]))->assertCreated();

        $this->assertSame(2, Provider::whereIn('slug', ['jean-plombier', 'jean-plombier-2'])->count());
    }

    public function test_registration_requires_accepting_the_terms(): void
    {
        $payload = $this->payload();
        unset($payload['accepts_terms']);

        $this->postJson('/api/v1/register', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors('accepts_terms');
    }

    public function test_registration_requires_at_least_one_service_category(): void
    {
        $this->postJson('/api/v1/register', $this->payload(['service_categories' => []]))
            ->assertStatus(422)
            ->assertJsonValidationErrors('service_categories');
    }

    public function test_registration_requires_a_location(): void
    {
        $payload = $this->payload();
        unset($payload['latitude'], $payload['longitude']);

        $this->postJson('/api/v1/register', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['latitude', 'longitude']);
    }

    public function test_an_invalid_phone_number_is_rejected(): void
    {
        $this->postJson('/api/v1/register', $this->payload(['phone' => '12345']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('phone');
    }

    public function test_a_phone_number_cannot_be_registered_twice(): void
    {
        $this->postJson('/api/v1/register', $this->payload())->assertCreated();

        $this->postJson('/api/v1/register', $this->payload(['email' => 'other@example.mu']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('phone');
    }

    public function test_an_inactive_category_cannot_be_selected(): void
    {
        $category = ServiceCategory::where('slug', 'plumber')->firstOrFail();
        $category->update(['is_active' => false]);

        $this->postJson('/api/v1/register', $this->payload(['service_categories' => [$category->id]]))
            ->assertStatus(422)
            ->assertJsonValidationErrors('service_categories.0');
    }

    public function test_business_is_not_a_separate_provider_type(): void
    {
        $this->postJson('/api/v1/register', $this->payload(['provider_type' => 'business']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('provider_type');
    }

    public function test_an_individual_can_request_all_three_free_subscriptions(): void
    {
        $freeSubscriptions = Subscription::query()->where('tier', 'free')->pluck('id')->all();

        $this->postJson('/api/v1/register', $this->payload(['subscription_ids' => $freeSubscriptions]))
            ->assertCreated()
            ->assertJsonCount(3, 'data.subscriptions');

        $this->assertDatabaseCount('subscription_user', 3);
    }

    public function test_an_individual_cannot_request_a_paid_subscription(): void
    {
        $paidSubscription = Subscription::query()->where('slug', 'services-plus')->firstOrFail();

        $this->postJson('/api/v1/register', $this->payload(['subscription_ids' => [$paidSubscription->id]]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('subscription_ids');

        $this->assertDatabaseCount('users', 0);
    }

    public function test_an_agency_can_request_one_paid_subscription_from_each_category(): void
    {
        $paidSubscriptions = Subscription::query()
            ->whereIn('slug', ['services-plus', 'rental-pro', 'sales-plus'])
            ->pluck('id')
            ->all();

        $this->postJson('/api/v1/register', $this->payload([
            'provider_type' => 'agency',
            'subscription_ids' => $paidSubscriptions,
        ]))->assertCreated()->assertJsonCount(3, 'data.subscriptions');

        $this->assertDatabaseCount('subscription_user', 3);
    }

    public function test_an_agency_cannot_request_a_free_subscription(): void
    {
        $freeSubscription = Subscription::query()->where('slug', 'services-free')->firstOrFail();

        $this->postJson('/api/v1/register', $this->payload([
            'provider_type' => 'agency',
            'subscription_ids' => [$freeSubscription->id],
        ]))->assertUnprocessable()->assertJsonValidationErrors('subscription_ids');
    }

    public function test_registration_rejects_two_subscriptions_from_the_same_category(): void
    {
        $serviceSubscriptions = Subscription::query()
            ->whereIn('slug', ['services-plus', 'services-pro'])
            ->pluck('id')
            ->all();

        $this->postJson('/api/v1/register', $this->payload([
            'provider_type' => 'agency',
            'subscription_ids' => $serviceSubscriptions,
        ]))->assertUnprocessable()->assertJsonValidationErrors('subscription_ids');
    }

    public function test_approval_fields_cannot_be_set_from_the_registration_payload(): void
    {
        $this->postJson('/api/v1/register', $this->payload([
            'approval_status' => 'approved',
            'is_verified' => true,
            'is_featured' => true,
        ]))->assertCreated();

        $provider = Provider::firstOrFail();

        $this->assertSame(ApprovalStatus::Draft, $provider->approval_status);
        $this->assertFalse($provider->is_verified);
        $this->assertFalse($provider->is_featured);
    }

    private function payload(array $overrides = []): array
    {
        $plumber = ServiceCategory::where('slug', 'plumber')->firstOrFail();
        $subscription = Subscription::where('slug', 'services-free')->firstOrFail();

        return array_merge([
            'provider_type' => 'individual',
            'name' => 'Jean Plombier',
            'phone' => '+23057654321',
            'password' => 'Str0ng-Passw0rd!',
            'password_confirmation' => 'Str0ng-Passw0rd!',
            'address' => '10 Royal Road, Port Louis',
            'locality' => 'Port Louis',
            'latitude' => -20.1609,
            'longitude' => 57.5012,
            'service_categories' => [$plumber->id],
            'subscription_ids' => [$subscription->id],
            'accepts_terms' => true,
        ], $overrides);
    }
}
