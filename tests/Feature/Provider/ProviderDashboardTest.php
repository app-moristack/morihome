<?php

namespace Tests\Feature\Provider;

use App\Enums\ApprovalStatus;
use App\Models\Provider;
use App\Models\ServiceCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Support\FakeImage;
use Tests\TestCase;

class ProviderDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_provider_reads_its_own_profile_with_completeness(): void
    {
        $provider = Provider::factory()->draft()->create();

        $this->loginAs($provider->user)
            ->getJson('/api/v1/provider/profile')
            ->assertOk()
            ->assertJsonPath('data.approval_status', 'draft')
            ->assertJsonStructure(['meta' => ['completeness' => ['percentage', 'missing_required', 'missing_recommended']]]);
    }

    public function test_a_provider_sees_its_exact_address_on_its_own_profile(): void
    {
        $provider = Provider::factory()->draft()->create(['address' => '12 Rue Test']);

        $this->loginAs($provider->user)
            ->getJson('/api/v1/provider/profile')
            ->assertJsonPath('data.address', '12 Rue Test');
    }

    public function test_a_guest_cannot_read_a_provider_dashboard(): void
    {
        $this->getJson('/api/v1/provider/profile')->assertUnauthorized();
    }

    public function test_a_provider_can_edit_its_description(): void
    {
        $provider = Provider::factory()->draft()->create();

        $this->loginAs($provider->user)
            ->putJson('/api/v1/provider/profile', ['description' => 'Twenty years of tiling.'])
            ->assertOk()
            ->assertJsonPath('data.description', 'Twenty years of tiling.');
    }

    public function test_a_provider_cannot_approve_itself_through_the_profile_endpoint(): void
    {
        $provider = Provider::factory()->draft()->create();

        $this->loginAs($provider->user)->putJson('/api/v1/provider/profile', [
            'approval_status' => 'approved',
            'is_verified' => true,
            'is_featured' => true,
        ])->assertOk();

        $provider->refresh();

        $this->assertSame(ApprovalStatus::Draft, $provider->approval_status);
        $this->assertFalse($provider->is_verified);
        $this->assertFalse($provider->is_featured);
    }

    public function test_a_complete_draft_can_be_submitted_for_review(): void
    {
        $provider = $this->completeDraft();

        $this->loginAs($provider->user)
            ->postJson('/api/v1/provider/profile/submit')
            ->assertOk()
            ->assertJsonPath('data.approval_status', 'pending');

        $this->assertNotNull($provider->refresh()->submitted_at);
    }

    public function test_an_incomplete_draft_cannot_be_submitted(): void
    {
        $provider = Provider::factory()->draft()->create();

        $this->loginAs($provider->user)
            ->postJson('/api/v1/provider/profile/submit')
            ->assertStatus(422);

        $this->assertSame(ApprovalStatus::Draft, $provider->refresh()->approval_status);
    }

    public function test_an_already_approved_provider_cannot_resubmit(): void
    {
        $provider = Provider::factory()->approved()->create();

        $this->loginAs($provider->user)->postJson('/api/v1/provider/profile/submit')->assertForbidden();
    }

    public function test_editing_a_sensitive_field_sends_an_approved_provider_back_to_review(): void
    {
        $provider = $this->completeDraft(approved: true);

        $this->loginAs($provider->user)
            ->putJson('/api/v1/provider/profile', ['address' => '99 New Road, Curepipe'])
            ->assertOk()
            ->assertJsonPath('data.approval_status', 'pending');

        $this->getJson('/api/v1/providers/'.$provider->slug)->assertNotFound();
    }

    public function test_editing_a_cosmetic_field_leaves_an_approved_provider_public(): void
    {
        $provider = $this->completeDraft(approved: true);

        $this->loginAs($provider->user)
            ->putJson('/api/v1/provider/profile', ['description' => 'Updated blurb.'])
            ->assertOk()
            ->assertJsonPath('data.approval_status', 'approved');

        $this->getJson('/api/v1/providers/'.$provider->slug)->assertOk();
    }

    public function test_a_re_review_records_which_fields_changed(): void
    {
        $provider = $this->completeDraft(approved: true);

        $this->loginAs($provider->user)
            ->putJson('/api/v1/provider/profile', ['locality' => 'Curepipe'])
            ->assertOk();

        $event = $provider->moderationEvents()->firstOrFail();

        $this->assertContains('locality', $event->changed_fields);
    }

    public function test_a_provider_can_replace_its_service_categories(): void
    {
        $provider = $this->completeDraft();
        $electrician = ServiceCategory::where('slug', 'electrician')->firstOrFail();

        $this->loginAs($provider->user)
            ->putJson('/api/v1/provider/profile', ['service_categories' => [$electrician->id]])
            ->assertOk();

        $this->assertSame([$electrician->id], $provider->serviceCategories()->pluck('service_categories.id')->all());
    }

    public function test_a_provider_can_upload_a_portfolio_image(): void
    {
        Storage::fake('public');
        $provider = $this->completeDraft();

        $this->loginAs($provider->user)->postJson('/api/v1/provider/portfolio', [
            'image' => FakeImage::upload('job.png', 1200, 800),
            'caption' => 'Bathroom refit',
        ])->assertCreated()->assertJsonPath('data.caption', 'Bathroom refit');

        $this->assertDatabaseCount('provider_portfolio_images', 1);
    }

    public function test_a_non_image_upload_is_rejected(): void
    {
        Storage::fake('public');
        $provider = $this->completeDraft();

        $this->loginAs($provider->user)->postJson('/api/v1/provider/portfolio', [
            'image' => UploadedFile::fake()->create('invoice.pdf', 200, 'application/pdf'),
        ])->assertStatus(422)->assertJsonValidationErrors('image');
    }

    public function test_a_tiny_image_is_rejected(): void
    {
        Storage::fake('public');
        $provider = $this->completeDraft();

        $this->loginAs($provider->user)->postJson('/api/v1/provider/portfolio', [
            'image' => FakeImage::upload('thumb.png', 50, 50),
        ])->assertStatus(422)->assertJsonValidationErrors('image');
    }

    public function test_a_provider_cannot_delete_another_providers_image(): void
    {
        Storage::fake('public');
        $owner = $this->completeDraft();
        $intruder = Provider::factory()->approved()->create();

        $image = $owner->portfolioImages()->create(['path' => 'demo.jpg', 'sort_order' => 10]);

        $this->loginAs($intruder->user)
            ->deleteJson('/api/v1/provider/portfolio/'.$image->id)
            ->assertForbidden();

        $this->assertDatabaseHas('provider_portfolio_images', ['id' => $image->id]);
    }

    public function test_a_provider_can_reorder_its_portfolio(): void
    {
        $provider = $this->completeDraft();
        $first = $provider->portfolioImages()->create(['path' => 'a.jpg', 'sort_order' => 10]);
        $second = $provider->portfolioImages()->create(['path' => 'b.jpg', 'sort_order' => 20]);

        $this->loginAs($provider->user)
            ->putJson('/api/v1/provider/portfolio/order', ['image_ids' => [$second->id, $first->id]])
            ->assertOk()
            ->assertJsonPath('data.0.id', $second->id);
    }

    private function completeDraft(bool $approved = false): Provider
    {
        $factory = Provider::factory();
        $provider = ($approved ? $factory->approved() : $factory->draft())->create([
            'description' => 'A complete profile.',
            'whatsapp_phone' => '+23057654321',
            'email' => 'complete@example.mu',
        ]);

        $provider->serviceCategories()->attach(ServiceCategory::where('slug', 'plumber')->firstOrFail());

        return $provider;
    }
}
