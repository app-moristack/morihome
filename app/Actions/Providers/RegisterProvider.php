<?php

namespace App\Actions\Providers;

use App\Actions\Subscriptions\RequestSubscriptions;
use App\Enums\ApprovalStatus;
use App\Enums\UserRole;
use App\Models\Provider;
use App\Models\User;
use App\Support\PhoneNumber;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RegisterProvider
{
    public function __construct(
        private readonly SyncProviderServiceCategories $syncServiceCategories,
        private readonly RequestSubscriptions $requestSubscriptions,
    ) {}

    public function handle(array $input): Provider
    {
        return DB::transaction(function () use ($input) {
            $phone = PhoneNumber::parse($input['phone']);
            $whatsapp = PhoneNumber::tryParse($input['whatsapp_phone'] ?? $input['phone']);

            $user = User::create([
                'name' => $input['name'],
                'phone' => $phone->e164,
                'email' => $input['email'] ?? null,
                'password' => $input['password'],
            ]);

            $user->assignRole(UserRole::Provider->value);
            $this->requestSubscriptions->handle($user, $input['subscription_ids']);

            $provider = $user->provider()->make([
                'provider_type' => $input['provider_type'],
                'name' => $input['name'],
                'description' => $input['description'] ?? null,
                'phone' => $phone->e164,
                'whatsapp_phone' => $whatsapp?->e164,
                'email' => $input['email'] ?? null,
                'website' => $input['website'] ?? null,
                'social_links' => $input['social_links'] ?? null,
                'address' => $input['address'],
                'locality' => $input['locality'],
                'latitude' => $input['latitude'],
                'longitude' => $input['longitude'],
                'service_areas' => $input['service_areas'] ?? null,
            ]);

            $provider->forceFill([
                'slug' => $this->uniqueSlug($input['name']),
                'approval_status' => ApprovalStatus::Draft,
            ])->save();

            $this->syncServiceCategories->handle($provider, $input['service_categories']);

            return $provider->refresh();
        });
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'provider';
        $slug = $base;
        $suffix = 1;

        while (Provider::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.++$suffix;
        }

        return $slug;
    }
}
