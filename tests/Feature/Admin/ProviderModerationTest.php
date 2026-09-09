<?php

namespace Tests\Feature\Admin;

use App\Enums\ApprovalStatus;
use App\Enums\ModerationAction;
use App\Enums\UserRole;
use App\Models\Provider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProviderModerationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
        $this->admin->assignRole(UserRole::Admin->value);
    }

    public function test_an_admin_can_approve_a_pending_provider(): void
    {
        $provider = Provider::factory()->pending()->create();

        $this->loginAs($this->admin)
            ->postJson("/api/v1/admin/providers/{$provider->id}/approved")
            ->assertOk()
            ->assertJsonPath('data.approval_status', 'approved');

        $provider->refresh();

        $this->assertSame(ApprovalStatus::Approved, $provider->approval_status);
        $this->assertNotNull($provider->approved_at);
        $this->assertSame($this->admin->id, $provider->approved_by);
    }

    public function test_approving_makes_the_provider_publicly_reachable(): void
    {
        $provider = Provider::factory()->pending()->create();

        $this->getJson('/api/v1/providers/'.$provider->slug)->assertNotFound();

        $this->loginAs($this->admin)->postJson("/api/v1/admin/providers/{$provider->id}/approved")->assertOk();

        $this->getJson('/api/v1/providers/'.$provider->slug)->assertOk();
    }

    public function test_rejecting_requires_a_reason(): void
    {
        $provider = Provider::factory()->pending()->create();

        $this->loginAs($this->admin)
            ->postJson("/api/v1/admin/providers/{$provider->id}/rejected")
            ->assertStatus(422)
            ->assertJsonValidationErrors('reason');

        $this->assertSame(ApprovalStatus::Pending, $provider->refresh()->approval_status);
    }

    public function test_a_rejection_reason_is_stored_and_shown_to_the_provider(): void
    {
        $provider = Provider::factory()->pending()->create();

        $this->loginAs($this->admin)->postJson(
            "/api/v1/admin/providers/{$provider->id}/rejected",
            ['reason' => 'Address could not be verified.'],
        )->assertOk();

        $this->assertSame('Address could not be verified.', $provider->refresh()->rejection_reason);

        $this->loginAs($provider->user)
            ->getJson('/api/v1/provider/profile')
            ->assertJsonPath('data.rejection_reason', 'Address could not be verified.');
    }

    public function test_suspending_removes_the_provider_from_public_search(): void
    {
        $provider = Provider::factory()->approved()->create();

        $this->getJson('/api/v1/providers/'.$provider->slug)->assertOk();

        $this->loginAs($this->admin)
            ->postJson("/api/v1/admin/providers/{$provider->id}/suspended", ['reason' => 'Complaint received.'])
            ->assertOk();

        $provider->refresh();

        $this->assertSame(ApprovalStatus::Suspended, $provider->approval_status);
        $this->assertFalse($provider->is_active);
        $this->getJson('/api/v1/providers/'.$provider->slug)->assertNotFound();
    }

    public function test_a_suspended_provider_can_be_reactivated(): void
    {
        $provider = Provider::factory()->suspended()->create();

        $this->loginAs($this->admin)
            ->postJson("/api/v1/admin/providers/{$provider->id}/reactivated")
            ->assertOk();

        $provider->refresh();

        $this->assertSame(ApprovalStatus::Approved, $provider->approval_status);
        $this->assertTrue($provider->is_active);
        $this->getJson('/api/v1/providers/'.$provider->slug)->assertOk();
    }

    public function test_an_illegal_transition_is_refused(): void
    {
        $provider = Provider::factory()->draft()->create();

        $this->loginAs($this->admin)
            ->postJson("/api/v1/admin/providers/{$provider->id}/approved")
            ->assertStatus(409);

        $this->assertSame(ApprovalStatus::Draft, $provider->refresh()->approval_status);
    }

    public function test_every_moderation_decision_is_recorded_in_the_audit_trail(): void
    {
        $provider = Provider::factory()->pending()->create();

        $this->loginAs($this->admin)->postJson("/api/v1/admin/providers/{$provider->id}/approved")->assertOk();

        $this->assertDatabaseHas('provider_moderation_events', [
            'provider_id' => $provider->id,
            'actor_id' => $this->admin->id,
            'action' => ModerationAction::Approved->value,
            'from_status' => ApprovalStatus::Pending->value,
            'to_status' => ApprovalStatus::Approved->value,
        ]);
    }

    public function test_a_provider_cannot_moderate_itself(): void
    {
        $provider = Provider::factory()->pending()->create();

        $this->loginAs($provider->user)
            ->postJson("/api/v1/admin/providers/{$provider->id}/approved")
            ->assertForbidden();

        $this->assertSame(ApprovalStatus::Pending, $provider->refresh()->approval_status);
    }

    public function test_a_guest_cannot_moderate(): void
    {
        $provider = Provider::factory()->pending()->create();

        $this->postJson("/api/v1/admin/providers/{$provider->id}/approved")->assertUnauthorized();
    }

    public function test_a_provider_cannot_reach_the_admin_dashboard(): void
    {
        $provider = Provider::factory()->approved()->create();

        $this->loginAs($provider->user)->getJson('/api/v1/admin/dashboard')->assertForbidden();
    }

    public function test_the_admin_dashboard_counts_providers_by_status(): void
    {
        Provider::factory()->count(2)->pending()->create();
        Provider::factory()->count(3)->approved()->create();
        Provider::factory()->suspended()->create();

        $this->loginAs($this->admin)
            ->getJson('/api/v1/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('data.providers.pending', 2)
            ->assertJsonPath('data.providers.approved', 3)
            ->assertJsonPath('data.providers.suspended', 1);
    }

    public function test_an_admin_can_read_the_moderation_history(): void
    {
        $provider = Provider::factory()->pending()->create();
        $this->loginAs($this->admin)->postJson("/api/v1/admin/providers/{$provider->id}/approved")->assertOk();

        $this->loginAs($this->admin)
            ->getJson("/api/v1/admin/providers/{$provider->id}/history")
            ->assertOk()
            ->assertJsonPath('data.0.action', 'approved');
    }
}
