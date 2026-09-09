<?php

namespace App\Actions\Moderation;

use App\Enums\ModerationAction;
use App\Models\Provider;
use App\Models\ProviderModerationEvent;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ModerateProvider
{
    public function handle(
        Provider $provider,
        ModerationAction $action,
        ?User $actor = null,
        ?string $reason = null,
        ?array $changedFields = null,
    ): Provider {
        $fromStatus = $provider->approval_status;
        $toStatus = $action->resultingStatus();

        if (! $fromStatus->canTransitionTo($toStatus)) {
            throw new ConflictHttpException(
                __('moderation.invalid_transition', ['from' => $fromStatus->value, 'to' => $toStatus->value]),
            );
        }

        if ($action->requiresReason() && blank($reason)) {
            throw new UnprocessableEntityHttpException(__('moderation.reason_required'));
        }

        return DB::transaction(function () use ($provider, $action, $actor, $reason, $changedFields, $fromStatus, $toStatus) {
            $provider->forceFill($this->attributesFor($action, $actor, $reason))->save();

            ProviderModerationEvent::create([
                'provider_id' => $provider->id,
                'actor_id' => $actor?->id,
                'action' => $action,
                'from_status' => $fromStatus,
                'to_status' => $toStatus,
                'reason' => $reason,
                'changed_fields' => $changedFields,
            ]);

            return $provider->refresh();
        });
    }

    private function attributesFor(ModerationAction $action, ?User $actor, ?string $reason): array
    {
        $base = ['approval_status' => $action->resultingStatus()];

        return match ($action) {
            ModerationAction::Submitted, ModerationAction::SentBackToReview => $base + [
                'submitted_at' => now(),
                'rejection_reason' => null,
            ],
            ModerationAction::Approved, ModerationAction::Reactivated => $base + [
                'approved_at' => now(),
                'approved_by' => $actor?->id,
                'rejection_reason' => null,
                'suspended_at' => null,
                'is_active' => true,
            ],
            ModerationAction::Rejected => $base + ['rejection_reason' => $reason],
            ModerationAction::Suspended => $base + [
                'suspended_at' => now(),
                'is_active' => false,
                'rejection_reason' => $reason,
            ],
        };
    }
}
