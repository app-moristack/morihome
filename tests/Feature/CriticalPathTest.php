<?php

namespace Tests\Feature;

use App\Enums\ContactChannel;
use App\Enums\UserRole;
use App\Models\Provider;
use App\Models\ServiceCategory;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class CriticalPathTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_provider_registers_is_approved_and_is_then_found_and_contacted(): void
    {
        $plumber = ServiceCategory::where('slug', 'plumber')->firstOrFail();
        $servicesSubscription = Subscription::where('slug', 'services-free')->firstOrFail();

        $registration = $this->postJson('/api/v1/register', [
            'provider_type' => 'individual',
            'name' => 'Dev Plombier',
            'phone' => '5765 4321',
            'password' => 'Str0ng-Passw0rd!',
            'password_confirmation' => 'Str0ng-Passw0rd!',
            'description' => 'Emergency plumbing across Port Louis.',
            'email' => 'dev@example.mu',
            'address' => '10 Royal Road, Port Louis',
            'locality' => 'Port Louis',
            'latitude' => -20.1609,
            'longitude' => 57.5012,
            'service_categories' => [$plumber->id],
            'subscription_ids' => [$servicesSubscription->id],
            'accepts_terms' => true,
        ])->assertCreated();

        $slug = $registration->json('data.provider.slug');
        $provider = Provider::where('slug', $slug)->firstOrFail();

        $this->assertSame('pending', $this->submitForReview($provider));
        $this->assertSearchFindsNothing();
        $this->getJson('/api/v1/providers/'.$slug)->assertNotFound();

        $this->approveAsAdmin($provider);

        $result = $this->searchNearPortLouis()->assertOk()->assertJsonCount(1, 'data')->json('data.0');

        $this->assertSame('Dev Plombier', $result['name']);
        $this->assertSame('23057654321', $result['whatsapp_number']);
        $this->assertLessThan(1, $result['distance_km']);

        $profile = $this->getJson('/api/v1/providers/'.$slug)->assertOk()->json('data');

        $this->assertSame('23057654321', $profile['whatsapp_number']);
        $this->assertSame('+230 5765 4321', $profile['whatsapp_display']);

        $this->postJson('/api/v1/providers/'.$slug.'/contact-events', [
            'channel' => ContactChannel::Whatsapp->value,
            'service_category_id' => $plumber->id,
            'source' => 'profile',
        ])->assertNoContent();

        $this->assertDatabaseHas('contact_events', [
            'provider_id' => $provider->id,
            'channel' => ContactChannel::Whatsapp->value,
            'service_category_id' => $plumber->id,
        ]);
    }

    public function test_a_contact_event_never_stores_the_message_content(): void
    {
        $provider = Provider::factory()->approved()->create();

        $this->postJson('/api/v1/providers/'.$provider->slug.'/contact-events', [
            'channel' => ContactChannel::Whatsapp->value,
            'message' => 'Hello, please call me on 5765 4321',
        ])->assertNoContent();

        $columns = array_keys($provider->contactEvents()->firstOrFail()->getAttributes());

        $this->assertNotContains('message', $columns);
    }

    public function test_a_contact_event_cannot_be_recorded_for_a_hidden_provider(): void
    {
        $provider = Provider::factory()->pending()->create();

        $this->postJson('/api/v1/providers/'.$provider->slug.'/contact-events', [
            'channel' => ContactChannel::Whatsapp->value,
        ])->assertNotFound();

        $this->assertDatabaseCount('contact_events', 0);
    }

    private function submitForReview(Provider $provider): string
    {
        return $this->loginAs($provider->user)
            ->postJson('/api/v1/provider/profile/submit')
            ->assertOk()
            ->json('data.approval_status');
    }

    private function approveAsAdmin(Provider $provider): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(UserRole::Admin->value);

        $this->loginAs($admin)
            ->postJson("/api/v1/admin/providers/{$provider->id}/approved")
            ->assertOk();
    }

    private function assertSearchFindsNothing(): void
    {
        $this->searchNearPortLouis()->assertOk()->assertJsonCount(0, 'data');
    }

    private function searchNearPortLouis(): TestResponse
    {
        return $this->getJson('/api/v1/providers/search?latitude=-20.1609&longitude=57.5012&radius_km=10');
    }
}
