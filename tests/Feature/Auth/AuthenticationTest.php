<?php

namespace Tests\Feature\Auth;

use App\Models\Provider;
use App\Models\User;
use Illuminate\Auth\SessionGuard;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_provider_can_log_in_with_its_phone_number(): void
    {
        $user = $this->userWithPassword();

        $this->postJson('/api/v1/login', [
            'identifier' => '+23057654321',
            'password' => 'Str0ng-Passw0rd!',
        ])->assertOk()->assertJsonPath('data.phone', '+23057654321');

        $this->assertAuthenticatedAs($user);
    }

    public function test_a_phone_number_typed_in_local_form_still_logs_in(): void
    {
        $this->userWithPassword();

        $this->postJson('/api/v1/login', [
            'identifier' => '5765 4321',
            'password' => 'Str0ng-Passw0rd!',
        ])->assertOk();
    }

    public function test_a_provider_can_log_in_with_its_email(): void
    {
        $this->userWithPassword(['email' => 'pro@example.mu']);

        $this->postJson('/api/v1/login', [
            'identifier' => 'pro@example.mu',
            'password' => 'Str0ng-Passw0rd!',
        ])->assertOk();
    }

    public function test_a_wrong_password_is_refused(): void
    {
        $this->userWithPassword();

        $this->postJson('/api/v1/login', [
            'identifier' => '+23057654321',
            'password' => 'wrong-password',
        ])->assertStatus(422)->assertJsonValidationErrors('identifier');

        $this->assertGuest();
    }

    public function test_an_unknown_identifier_is_refused(): void
    {
        $this->postJson('/api/v1/login', [
            'identifier' => '+23057000000',
            'password' => 'Str0ng-Passw0rd!',
        ])->assertStatus(422);

        $this->assertGuest();
    }

    public function test_logging_in_records_the_last_login(): void
    {
        $user = $this->userWithPassword();

        $this->postJson('/api/v1/login', [
            'identifier' => '+23057654321',
            'password' => 'Str0ng-Passw0rd!',
        ])->assertOk();

        $this->assertNotNull($user->refresh()->last_login_at);
    }

    public function test_a_logged_in_provider_reads_its_own_account(): void
    {
        $provider = Provider::factory()->approved()->create();

        $this->loginAs($provider->user)
            ->getJson('/api/v1/user')
            ->assertOk()
            ->assertJsonPath('data.provider.slug', $provider->slug);
    }

    public function test_the_account_payload_never_leaks_the_password_hash(): void
    {
        $provider = Provider::factory()->approved()->create();

        $data = $this->loginAs($provider->user)->getJson('/api/v1/user')->json('data');

        $this->assertArrayNotHasKey('password', $data);
        $this->assertArrayNotHasKey('remember_token', $data);
    }

    public function test_a_guest_has_no_account(): void
    {
        $this->getJson('/api/v1/user')->assertUnauthorized();
    }

    public function test_a_provider_can_log_out(): void
    {
        $this->userWithPassword();

        $this->postJson('/api/v1/login', [
            'identifier' => '+23057654321',
            'password' => 'Str0ng-Passw0rd!',
        ])->assertOk();

        $this->getJson('/api/v1/user')->assertOk();

        $this->postJson('/api/v1/logout')->assertNoContent();

        $this->assertFalse(Auth::guard('web')->check());
        $this->assertArrayNotHasKey($this->sessionAuthKey(), session()->all());
    }

    public function test_a_provider_can_change_its_password(): void
    {
        $provider = Provider::factory()->approved()->create();
        $provider->user->forceFill(['password' => Hash::make('Str0ng-Passw0rd!')])->save();

        $this->loginAs($provider->user)->putJson('/api/v1/password', [
            'current_password' => 'Str0ng-Passw0rd!',
            'password' => 'Ev3n-Str0nger!',
            'password_confirmation' => 'Ev3n-Str0nger!',
        ])->assertNoContent();

        $this->assertTrue(Hash::check('Ev3n-Str0nger!', $provider->user->refresh()->password));
    }

    public function test_changing_the_password_requires_the_current_one(): void
    {
        $provider = Provider::factory()->approved()->create();

        $this->loginAs($provider->user)->putJson('/api/v1/password', [
            'current_password' => 'not-the-password',
            'password' => 'Ev3n-Str0nger!',
            'password_confirmation' => 'Ev3n-Str0nger!',
        ])->assertStatus(422)->assertJsonValidationErrors('current_password');
    }

    public function test_login_attempts_are_rate_limited(): void
    {
        $this->userWithPassword();

        foreach (range(1, 10) as $attempt) {
            $this->postJson('/api/v1/login', ['identifier' => '+23057654321', 'password' => 'wrong']);
        }

        $this->postJson('/api/v1/login', [
            'identifier' => '+23057654321',
            'password' => 'Str0ng-Passw0rd!',
        ])->assertStatus(429);
    }

    /**
     * Sanctum's request guard caches the resolved user for the life of the PHP
     * process, so an in-process request after logout still sees it; the session
     * and the web guard are what a real request would read.
     */
    private function sessionAuthKey(): string
    {
        return 'login_web_'.sha1(SessionGuard::class);
    }

    private function userWithPassword(array $overrides = []): User
    {
        return User::factory()->create(array_merge([
            'phone' => '+23057654321',
            'password' => Hash::make('Str0ng-Passw0rd!'),
        ], $overrides));
    }
}
