<?php

namespace Tests\Feature\Public;

use App\Models\Provider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class FeaturedProvidersTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_at_most_five_featured_profiles_with_verified_profiles_first(): void
    {
        Provider::factory()->approved()->featured()->count(5)->create();
        $verified = Provider::factory()->approved()->featured()->verified()->create();

        $this->getJson('/api/v1/providers/featured')
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('data.0.id', $verified->id)
            ->assertJsonPath('data.0.is_verified', true);
    }

    public static function hiddenStates(): array
    {
        return ['draft' => ['draft'], 'pending' => ['pending'], 'rejected' => ['rejected'], 'suspended' => ['suspended']];
    }

    #[DataProvider('hiddenStates')]
    public function test_unapproved_featured_profiles_are_withheld(string $state): void
    {
        Provider::factory()->featured()->{$state}()->create();

        $this->getJson('/api/v1/providers/featured')->assertExactJson(['data' => []]);
    }

    public function test_inactive_deleted_and_nonfeatured_profiles_are_withheld(): void
    {
        Provider::factory()->approved()->featured()->create(['is_active' => false]);
        Provider::factory()->approved()->create();
        Provider::factory()->approved()->featured()->create()->delete();

        $this->getJson('/api/v1/providers/featured')->assertExactJson(['data' => []]);
    }

    public function test_featured_profiles_expose_contact_details_without_private_addresses(): void
    {
        Provider::factory()->approved()->featured()->create(['whatsapp_phone' => '+23057654321']);

        $response = $this->getJson('/api/v1/providers/featured');
        $response->assertJsonPath('data.0.whatsapp_number', '23057654321');
        $data = $response->json('data.0');
        $this->assertArrayNotHasKey('address', $data);
        $this->assertArrayNotHasKey('latitude', $data);
        $this->assertArrayNotHasKey('longitude', $data);
        $this->assertArrayNotHasKey('rejection_reason', $data);
    }
}
