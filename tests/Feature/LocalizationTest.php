<?php

namespace Tests\Feature;

use App\Models\PlatformSetting;
use App\Models\Provider;
use App\Models\ServiceCategory;
use App\Support\WhatsappMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\TestCase;

class LocalizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_french_profile_metadata_translates_services_and_preserves_the_business_name(): void
    {
        $this->withoutVite();
        $provider = Provider::factory()->approved()->create(['name' => 'Volt Maurice', 'locality' => 'Curepipe']);
        $provider->serviceCategories()->attach(ServiceCategory::where('slug', 'electrician')->firstOrFail());

        $this->withUnencryptedCookie('morihome_locale', 'fr')
            ->get('/providers/'.$provider->slug)
            ->assertOk()
            ->assertSee('<title>Volt Maurice — Électricien à Curepipe | MoriHome</title>', false);
    }

    #[TestWith(['fr-MU, en;q=0.8', 'fr', 'Le champ mot de passe est obligatoire.'])]
    #[TestWith(['mfe-MU, fr;q=0.8', 'mfe', 'modpas obligatwar.'])]
    #[TestWith(['de-DE, fr;q=0.8', 'fr', 'Le champ mot de passe est obligatoire.'])]
    #[TestWith(['de-DE', 'en', 'The password field is required.'])]
    public function test_api_validation_uses_the_preferred_supported_language(string $header, string $locale, string $message): void
    {
        $this->withHeader('Accept-Language', $header)
            ->postJson('/api/v1/login', [])
            ->assertUnprocessable()
            ->assertHeader('Content-Language', $locale)
            ->assertJsonPath('errors.password.0', $message);
    }

    public function test_api_header_overrides_the_saved_cookie(): void
    {
        $this->withUnencryptedCookie('morihome_locale', 'fr')
            ->withHeader('Accept-Language', 'mfe')
            ->postJson('/api/v1/login', [])
            ->assertHeader('Content-Language', 'mfe')
            ->assertJsonPath('errors.password.0', 'modpas obligatwar.');
    }

    public function test_saved_language_controls_html_and_metadata_over_browser_language(): void
    {
        $this->withoutVite();

        $response = $this->withUnencryptedCookie('morihome_locale', 'mfe')
            ->withHeader('Accept-Language', 'en-US')
            ->get('/about');

        $response->assertOk()
            ->assertHeader('Content-Language', 'mfe')
            ->assertSee('<html lang="mfe">', false)
            ->assertSee('<title>Lor MoriHome', false);
        $this->assertContains('Accept-Language', $response->baseResponse->getVary());
        $this->assertContains('Cookie', $response->baseResponse->getVary());
    }

    public function test_invalid_cookie_cannot_select_an_arbitrary_locale(): void
    {
        $this->withoutVite();

        $this->withUnencryptedCookie('morihome_locale', '../../fr')
            ->withHeader('Accept-Language', 'zz')
            ->get('/about')
            ->assertOk()
            ->assertHeader('Content-Language', 'en')
            ->assertSee('<html lang="en">', false);
    }

    public function test_default_whatsapp_message_is_localized_but_custom_content_is_preserved(): void
    {
        app()->setLocale('mfe');
        $this->assertStringStartsWith('Bonzour,', WhatsappMessage::forService());

        PlatformSetting::query()->create(['key' => 'whatsapp_message_template', 'value' => 'Custom message: :service']);

        $this->assertSame('Custom message: Plumbing', WhatsappMessage::forService('Plumbing'));
    }
}
