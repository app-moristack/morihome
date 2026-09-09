<?php

namespace App\Enums;

enum ApprovalStatus: string
{
    case Draft = 'draft';
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Suspended = 'suspended';

    public function label(): string
    {
        return __('provider.status.'.$this->value);
    }

    public function isPubliclyVisible(): bool
    {
        return $this === self::Approved;
    }

    public function canSubmitForReview(): bool
    {
        return in_array($this, [self::Draft, self::Rejected], true);
    }

    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Draft => [self::Pending],
            self::Pending => [self::Approved, self::Rejected],
            self::Approved => [self::Suspended, self::Pending],
            self::Rejected => [self::Pending],
            self::Suspended => [self::Approved],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
