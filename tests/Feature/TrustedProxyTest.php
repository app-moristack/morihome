<?php

namespace Tests\Feature;

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class TrustedProxyTest extends TestCase
{
    public function createApplication(): Application
    {
        $previous = getenv('TRUSTED_PROXIES');
        putenv('TRUSTED_PROXIES=172.30.10.2');

        try {
            return parent::createApplication();
        } finally {
            putenv($previous === false ? 'TRUSTED_PROXIES' : 'TRUSTED_PROXIES='.$previous);
        }
    }

    protected function setUp(): void
    {
        parent::setUp();

        Route::get('/api/proxy-test', fn (Request $request) => [
            'secure' => $request->isSecure(),
            'ip' => $request->ip(),
            'host' => $request->getHost(),
        ]);
    }

    public function test_trusts_https_and_client_ip_from_the_configured_proxy(): void
    {
        $this->withServerVariables(['REMOTE_ADDR' => '172.30.10.2'])
            ->withHeaders([
                'X-Forwarded-Proto' => 'https',
                'X-Forwarded-For' => '203.0.113.10',
                'X-Forwarded-Host' => 'attacker.example',
            ])
            ->get('/api/proxy-test')
            ->assertExactJson(['secure' => true, 'ip' => '203.0.113.10', 'host' => 'localhost']);
    }

    public function test_ignores_forwarded_headers_from_other_sources(): void
    {
        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.20'])
            ->withHeaders([
                'X-Forwarded-Proto' => 'https',
                'X-Forwarded-For' => '203.0.113.10',
            ])
            ->get('/api/proxy-test')
            ->assertExactJson(['secure' => false, 'ip' => '203.0.113.20', 'host' => 'localhost']);
    }
}
