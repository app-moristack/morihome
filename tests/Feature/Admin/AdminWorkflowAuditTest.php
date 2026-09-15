<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Mail\ContactMessage;
use App\Models\PlatformSetting;
use App\Models\Provider;
use App\Models\User;
use App\Support\WhatsappMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AdminWorkflowAuditTest extends TestCase
{
    use RefreshDatabase;

    public function test_saved_settings_reach_the_public_page_and_contact_messages(): void
    {
        Mail::fake();
        PlatformSetting::create(['key' => 'app_name', 'value' => 'Local Homes']);
        PlatformSetting::create(['key' => 'support_email', 'value' => 'support@example.com']);
        PlatformSetting::create(['key' => 'support_whatsapp', 'value' => '23051000001']);
        PlatformSetting::create(['key' => 'whatsapp_message_template', 'value' => 'Found :service on :app.']);

        $this->get('/')->assertOk()->assertViewHas('bootstrap', fn (array $bootstrap): bool => $bootstrap['appName'] === 'Local Homes'
            && $bootstrap['supportEmail'] === 'support@example.com'
            && $bootstrap['supportWhatsapp'] === '23051000001'
            && $bootstrap['whatsappTemplate'] === 'Found :service on :app.'
        );
        $this->assertSame('Found Plumbing on Local Homes.', WhatsappMessage::forService('Plumbing'));

        $this->postJson('/api/v1/contact-message', [
            'name' => 'Test visitor', 'email' => 'visitor@example.com',
            'subject' => 'General question', 'message' => 'Please help me find a local professional.',
        ])->assertAccepted();
        Mail::assertSent(ContactMessage::class, fn (ContactMessage $mail): bool => $mail->hasTo('support@example.com'));
    }

    public function test_null_settings_use_environment_defaults(): void
    {
        config(['morihome.support_email' => 'fallback@example.com']);
        PlatformSetting::create(['key' => 'support_email', 'value' => null]);

        $this->get('/')->assertOk()->assertViewHas('bootstrap', fn (array $bootstrap): bool => $bootstrap['supportEmail'] === 'fallback@example.com'
        );
    }

    public function test_admin_queue_filters_and_paginates_using_the_frontend_request(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(UserRole::Admin->value);
        Provider::factory()->pending()->count(11)->create();
        Provider::factory()->approved()->create();

        $this->loginAs($admin)->postJson('/api/v1/admin/rest/providers/search', [
            'search' => [
                'filters' => [['field' => 'approval_status', 'operator' => '=', 'value' => 'pending']],
                'sorts' => [['field' => 'created_at', 'direction' => 'desc']],
                'page' => 2,
                'limit' => 10,
            ],
        ])->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('total', 11)
            ->assertJsonPath('current_page', 2)->assertJsonPath('last_page', 2)
            ->assertJsonPath('data.0.approval_status', 'pending');
    }

    public function test_admin_can_read_all_panel_data_endpoints(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(UserRole::Admin->value);
        $provider = Provider::factory()->pending()->create();
        $this->loginAs($admin);

        foreach (['dashboard', 'users', 'categories', 'settings', 'subscriptions', 'providers/'.$provider->id, 'providers/'.$provider->id.'/history'] as $path) {
            $this->getJson('/api/v1/admin/'.$path)->assertOk()->assertJsonStructure(['data']);
        }
        $this->getJson('/api/v1/user')->assertOk()->assertJsonPath('data.provider', null);
    }

    public function test_setting_updates_require_an_explicit_value(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(UserRole::Admin->value);
        PlatformSetting::create(['key' => 'app_name', 'value' => 'MoriHome']);

        $this->loginAs($admin)->putJson('/api/v1/admin/settings', [
            'settings' => [['key' => 'app_name']],
        ])->assertUnprocessable()->assertJsonValidationErrors('settings.0.value');

        $this->assertDatabaseHas('platform_settings', ['key' => 'app_name', 'value' => 'MoriHome']);
    }

    public function test_invalid_support_email_does_not_partially_save_settings(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(UserRole::Admin->value);

        $this->loginAs($admin)->putJson('/api/v1/admin/settings', [
            'settings' => [
                ['key' => 'app_name', 'value' => 'Not saved'],
                ['key' => 'support_email', 'value' => 'invalid'],
            ],
        ])->assertUnprocessable()->assertJsonValidationErrors('settings.1.value');

        $this->assertDatabaseMissing('platform_settings', ['value' => 'Not saved']);
        $this->assertDatabaseMissing('platform_settings', ['value' => 'invalid']);
    }

    public function test_admin_can_save_settings_but_cannot_set_arbitrary_keys(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(UserRole::Admin->value);
        $this->loginAs($admin);

        $this->putJson('/api/v1/admin/settings', [
            'settings' => [['key' => 'app_name', 'value' => 'Updated name']],
        ])->assertOk()->assertJsonPath('data.app_name', 'Updated name');
        $this->assertDatabaseHas('platform_settings', ['key' => 'app_name', 'value' => 'Updated name']);

        $this->putJson('/api/v1/admin/settings', [
            'settings' => [['key' => 'APP_KEY', 'value' => 'not-allowed']],
        ])->assertUnprocessable()->assertJsonValidationErrors('settings.0.key');
        $this->assertDatabaseMissing('platform_settings', ['key' => 'APP_KEY']);
    }
}
