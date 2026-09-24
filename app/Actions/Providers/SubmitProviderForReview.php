<?php

namespace App\Actions\Providers;

use App\Actions\Moderation\ModerateProvider;
use App\Enums\ModerationAction;
use App\Models\Provider;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class SubmitProviderForReview
{
    public function __construct(
        private readonly ModerateProvider $moderateProvider,
        private readonly CalculateProfileCompleteness $calculateCompleteness,
    ) {}

    public function handle(Provider $provider): Provider
    {
        if (! $provider->approval_status->canSubmitForReview()) {
            throw new UnprocessableEntityHttpException(__('provider.cannot_submit'));
        }

        $missing = $this->calculateCompleteness->missingRequirements($provider);

        if ($missing !== []) {
            throw new UnprocessableEntityHttpException(
                __('provider.incomplete_profile', ['fields' => implode(', ', array_map(
                    fn (string $field): string => __('validation.attributes.'.$field) === 'validation.attributes.'.$field
                        ? $field
                        : __('validation.attributes.'.$field),
                    $missing,
                ))]),
            );
        }

        return $this->moderateProvider->handle(
            provider: $provider,
            action: ModerationAction::Submitted,
            actor: $provider->user,
        );
    }
}
