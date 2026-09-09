<?php

namespace App\Enums;

enum ModerationAction: string
{
    case Submitted = 'submitted';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Suspended = 'suspended';
    case Reactivated = 'reactivated';
    case SentBackToReview = 'sent_back_to_review';

    public function resultingStatus(): ApprovalStatus
    {
        return match ($this) {
            self::Submitted, self::SentBackToReview => ApprovalStatus::Pending,
            self::Approved, self::Reactivated => ApprovalStatus::Approved,
            self::Rejected => ApprovalStatus::Rejected,
            self::Suspended => ApprovalStatus::Suspended,
        };
    }

    public function requiresReason(): bool
    {
        return $this === self::Rejected;
    }
}
