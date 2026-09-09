<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Sanctum\Sanctum;

abstract class TestCase extends BaseTestCase
{
    /**
     * Sanctum only attaches the session to requests from a stateful origin, so
     * without this header every session-backed auth test sees no session store.
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->withHeader('Origin', 'http://localhost');
    }

    /**
     * Authenticates against the sanctum guard rather than the session, so a
     * single test can act as several users in turn.
     */
    protected function loginAs(User $user): static
    {
        $this->flushSession();
        $this->app['auth']->forgetGuards();

        Sanctum::actingAs($user);

        return $this;
    }
}
