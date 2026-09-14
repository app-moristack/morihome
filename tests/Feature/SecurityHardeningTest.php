<?php

namespace Tests\Feature;

use App\Models\Provider;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_html_has_nonce_protection_and_private_responses_are_not_cached(): void
    {
        $response = $this->get('/login')->assertOk()
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('X-Content-Type-Options', 'nosniff');
        $policy = $response->headers->get('Content-Security-Policy');
        $this->assertStringContainsString("frame-ancestors 'none'", $policy);
        preg_match("/'nonce-([^']+)'/", $policy, $matches);
        $response->assertSee('nonce="'.$matches[1].'"', false);
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        $user = User::factory()->create();
        $response = $this->loginAs($user)->getJson('/api/v1/user')->assertOk();
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
    }

    public function test_provider_text_cannot_escape_structured_data_script(): void
    {
        $provider = Provider::factory()->approved()->create(['name' => '</script><script>alert(1)</script>']);
        $this->get('/providers/'.$provider->slug)->assertOk()
            ->assertDontSee('</script><script>alert(1)</script>', false)
            ->assertSee('\\u003C', false);
    }

    public function test_password_recovery_does_not_disclose_registered_email(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $known = $this->postJson('/api/v1/forgot-password', ['email' => $user->email])->assertOk()->json();
        $unknown = $this->postJson('/api/v1/forgot-password', ['email' => 'absent@example.mu'])->assertOk()->json();
        $this->assertSame($known, $unknown);
        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_password_reset_revokes_sessions_and_tokens(): void
    {
        config(['session.driver' => 'database']);
        $user = User::factory()->create();
        $user->createToken('previous-device');
        DB::table('sessions')->insert(['id' => 'old-session', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time()]);
        $token = Password::createToken($user);
        $this->postJson('/api/v1/reset-password', [
            'email' => $user->email, 'token' => $token,
            'password' => 'New-Secure-Password9', 'password_confirmation' => 'New-Secure-Password9',
        ])->assertOk();
        $this->assertTrue(Hash::check('New-Secure-Password9', $user->fresh()->password));
        $this->assertDatabaseMissing('sessions', ['id' => 'old-session']);
        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_reset_email_uses_configured_origin_and_page_prevents_referrer_leaks(): void
    {
        config(['app.url' => 'https://moristack.duckdns.org']);
        $user = User::factory()->create();
        $message = (new ResetPassword('sample-token'))->toMail($user);
        $this->assertStringStartsWith('https://moristack.duckdns.org/reset-password?', $message->actionUrl);
        $this->get('/reset-password?token=sample-token')->assertOk()->assertHeader('Referrer-Policy', 'no-referrer');
    }

    public function test_profile_links_and_oversized_images_are_rejected(): void
    {
        $provider = Provider::factory()->approved()->create();
        $this->loginAs($provider->user)->putJson('/api/v1/provider/profile', [
            'website' => 'ftp://example.com/file',
            'social_links' => ['javascript:alert(1)'],
        ])->assertUnprocessable()->assertJsonValidationErrors(['website', 'social_links.0']);
        Storage::fake('public');
        config(['morihome.uploads.max_dimension' => 100]);
        $this->postJson('/api/v1/provider/profile/images/logo', [
            'image' => UploadedFile::fake()->createWithContent('large.png', file_get_contents(public_path('icons/icon-192.png'))),
        ])->assertUnprocessable()->assertJsonValidationErrors('image');
    }

    public function test_production_does_not_write_reset_tokens_to_log_mailer(): void
    {
        $this->app->instance('env', 'production');
        config(['mail.default' => 'log']);
        $this->withSession(['_token' => 'test-csrf-token'])->withHeader('X-CSRF-TOKEN', 'test-csrf-token');
        Notification::fake();
        $user = User::factory()->create();
        $this->postJson('/api/v1/forgot-password', ['email' => $user->email])->assertOk();
        Notification::assertNothingSent();
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $user->email]);
    }

    public function test_password_change_revokes_tokens_and_rejects_weak_passwords(): void
    {
        $user = User::factory()->create(['password' => Hash::make('Existing-Password9')]);
        $user->createToken('old-token');
        $this->loginAs($user)->putJson('/api/v1/password', [
            'current_password' => 'Existing-Password9', 'password' => 'weakpass',
            'password_confirmation' => 'weakpass',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');
        $this->putJson('/api/v1/password', [
            'current_password' => 'Existing-Password9', 'password' => 'Updated-Password9',
            'password_confirmation' => 'Updated-Password9',
        ])->assertNoContent();
        $this->assertSame(0, $user->tokens()->count());
    }
}
