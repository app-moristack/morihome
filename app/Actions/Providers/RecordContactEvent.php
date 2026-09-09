<?php

namespace App\Actions\Providers;

use App\Enums\ContactChannel;
use App\Models\ContactEvent;
use App\Models\Provider;
use Illuminate\Http\Request;

class RecordContactEvent
{
    public function handle(
        Provider $provider,
        ContactChannel $channel,
        Request $request,
        ?int $serviceCategoryId = null,
        ?string $source = null,
    ): ContactEvent {
        return ContactEvent::create([
            'provider_id' => $provider->id,
            'service_category_id' => $serviceCategoryId,
            'channel' => $channel,
            'source' => $source,
            'session_hash' => $this->sessionHash($request),
        ]);
    }

    private function sessionHash(Request $request): string
    {
        return hash_hmac(
            'sha256',
            $request->ip().'|'.$request->userAgent().'|'.now()->toDateString(),
            config('app.key'),
        );
    }
}
