<?php

namespace App\Actions\Providers;

use App\Actions\Moderation\ModerateProvider;
use App\Enums\ApprovalStatus;
use App\Enums\ModerationAction;
use App\Models\Provider;
use App\Support\PhoneNumber;
use Illuminate\Support\Facades\DB;

class UpdateProviderProfile
{
    public const SENSITIVE_FIELDS = [
        'provider_type',
        'name',
        'phone',
        'whatsapp_phone',
        'address',
        'locality',
        'latitude',
        'longitude',
    ];

    public function __construct(
        private readonly SyncProviderServiceCategories $syncServiceCategories,
        private readonly ModerateProvider $moderateProvider,
    ) {}

    public function handle(Provider $provider, array $input): Provider
    {
        return DB::transaction(function () use ($provider, $input) {
            $provider->fill($this->normalizePhones($input));
            $changedSensitiveFields = array_keys(array_intersect_key($provider->getDirty(), array_flip(self::SENSITIVE_FIELDS)));
            $provider->save();

            if (array_key_exists('service_categories', $input)) {
                $before = $provider->serviceCategories()->pluck('service_categories.id')->sort()->values();
                $this->syncServiceCategories->handle($provider, $input['service_categories']);
                $after = $provider->serviceCategories()->pluck('service_categories.id')->sort()->values();

                if ($before->toArray() !== $after->toArray()) {
                    $changedSensitiveFields[] = 'service_categories';
                }
            }

            if ($this->requiresReReview($provider, $changedSensitiveFields)) {
                return $this->moderateProvider->handle(
                    provider: $provider,
                    action: ModerationAction::SentBackToReview,
                    actor: $provider->user,
                    changedFields: $changedSensitiveFields,
                );
            }

            return $provider->refresh();
        });
    }

    private function requiresReReview(Provider $provider, array $changedSensitiveFields): bool
    {
        return $changedSensitiveFields !== []
            && $provider->approval_status === ApprovalStatus::Approved
            && config('morihome.moderation.review_on_sensitive_edit');
    }

    private function normalizePhones(array $input): array
    {
        foreach (['phone', 'whatsapp_phone'] as $field) {
            if (array_key_exists($field, $input)) {
                $input[$field] = PhoneNumber::tryParse($input[$field])?->e164;
            }
        }

        return array_filter($input, fn (string $key) => $key !== 'service_categories', ARRAY_FILTER_USE_KEY);
    }
}
