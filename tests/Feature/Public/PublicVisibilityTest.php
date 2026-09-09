<?php

namespace Tests\Feature\Public;

use App\Enums\ApprovalStatus;
use App\Models\Locality;
use App\Models\Provider;
use App\Models\ServiceCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PublicVisibilityTest extends TestCase
{
    use RefreshDatabase;

    public static function statusesHiddenFromThePublic(): array
    {
        return [
            'draft' => ['draft'],
            'pending' => ['pending'],
            'rejected' => ['rejected'],
            'suspended' => ['suspended'],
        ];
    }

    #[DataProvider('statusesHiddenFromThePublic')]
    public function test_unapproved_providers_never_appear_in_search(string $state): void
    {
        $locality = Locality::where('slug', 'port-louis')->firstOrFail();
        $plumber = ServiceCategory::where('slug', 'plumber')->firstOrFail();

        Provider::factory()->at($locality)->{$state}()->create()
            ->serviceCategories()->attach($plumber);

        $this->getJson(sprintf(
            '/api/v1/providers/search?latitude=%s&longitude=%s&radius_km=50',
            $locality->latitude,
            $locality->longitude,
        ))->assertOk()->assertJsonCount(0, 'data');
    }

    #[DataProvider('statusesHiddenFromThePublic')]
    public function test_unapproved_profiles_return_not_found(string $state): void
    {
        $provider = Provider::factory()->{$state}()->create();

        $this->getJson('/api/v1/providers/'.$provider->slug)->assertNotFound();
    }

    public function test_an_approved_but_deactivated_provider_is_hidden(): void
    {
        $provider = Provider::factory()->approved()->create(['is_active' => false]);

        $this->getJson('/api/v1/providers/'.$provider->slug)->assertNotFound();
    }

    public function test_an_approved_profile_is_publicly_readable(): void
    {
        $provider = Provider::factory()->approved()->create(['name' => 'Visible Provider']);

        $this->getJson('/api/v1/providers/'.$provider->slug)
            ->assertOk()
            ->assertJsonPath('data.name', 'Visible Provider')
            ->assertJsonPath('data.slug', $provider->slug);
    }

    public function test_a_public_profile_hides_the_exact_address_and_coordinates(): void
    {
        $provider = Provider::factory()->approved()->create([
            'address' => '12 Secret Lane',
            'latitude' => -20.1609123,
            'longitude' => 57.5012987,
        ]);

        $data = $this->getJson('/api/v1/providers/'.$provider->slug)->json('data');

        $this->assertArrayNotHasKey('address', $data);
        $this->assertArrayNotHasKey('latitude', $data);
        $this->assertSame(-20.16, $data['approximate_latitude']);
        $this->assertSame(57.5, $data['approximate_longitude']);
    }

    public function test_a_public_profile_exposes_a_whatsapp_ready_number(): void
    {
        $provider = Provider::factory()->approved()->create(['whatsapp_phone' => '+23057654321']);

        $this->getJson('/api/v1/providers/'.$provider->slug)
            ->assertJsonPath('data.whatsapp_number', '23057654321')
            ->assertJsonPath('data.whatsapp_display', '+230 5765 4321');
    }

    public function test_the_public_never_receives_moderation_fields(): void
    {
        $provider = Provider::factory()->approved()->create(['rejection_reason' => 'internal note']);

        $data = $this->getJson('/api/v1/providers/'.$provider->slug)->json('data');

        $this->assertArrayNotHasKey('rejection_reason', $data);
        $this->assertArrayNotHasKey('approval_status', $data);
        $this->assertArrayNotHasKey('user_id', $data);
    }

    public function test_active_categories_are_listed_publicly(): void
    {
        $this->getJson('/api/v1/categories')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'plumber');
    }

    public function test_inactive_categories_are_withheld(): void
    {
        ServiceCategory::where('slug', 'plumber')->update(['is_active' => false]);

        $slugs = $this->getJson('/api/v1/categories')->json('data.*.slug');

        $this->assertNotContains('plumber', $slugs);
    }

    public function test_a_soft_deleted_provider_disappears_from_the_public_site(): void
    {
        $provider = Provider::factory()->approved()->create();
        $provider->delete();

        $this->getJson('/api/v1/providers/'.$provider->slug)->assertNotFound();
        $this->assertSame(ApprovalStatus::Approved, $provider->approval_status);
    }
}
