<?php

namespace Tests\Unit\Enums;

use App\Enums\ApprovalStatus;
use App\Enums\ModerationAction;
use PHPUnit\Framework\TestCase;

class ApprovalStatusTest extends TestCase
{
    public function test_only_approved_providers_are_publicly_visible(): void
    {
        foreach (ApprovalStatus::cases() as $status) {
            $this->assertSame(
                $status === ApprovalStatus::Approved,
                $status->isPubliclyVisible(),
                "{$status->value} visibility",
            );
        }
    }

    public function test_draft_and_rejected_profiles_may_be_submitted_for_review(): void
    {
        $this->assertTrue(ApprovalStatus::Draft->canSubmitForReview());
        $this->assertTrue(ApprovalStatus::Rejected->canSubmitForReview());
        $this->assertFalse(ApprovalStatus::Pending->canSubmitForReview());
        $this->assertFalse(ApprovalStatus::Approved->canSubmitForReview());
        $this->assertFalse(ApprovalStatus::Suspended->canSubmitForReview());
    }

    public function test_a_draft_cannot_jump_straight_to_approved(): void
    {
        $this->assertFalse(ApprovalStatus::Draft->canTransitionTo(ApprovalStatus::Approved));
        $this->assertTrue(ApprovalStatus::Draft->canTransitionTo(ApprovalStatus::Pending));
    }

    public function test_pending_can_be_approved_or_rejected(): void
    {
        $this->assertTrue(ApprovalStatus::Pending->canTransitionTo(ApprovalStatus::Approved));
        $this->assertTrue(ApprovalStatus::Pending->canTransitionTo(ApprovalStatus::Rejected));
        $this->assertFalse(ApprovalStatus::Pending->canTransitionTo(ApprovalStatus::Suspended));
    }

    public function test_a_suspended_provider_can_only_be_reactivated(): void
    {
        $this->assertSame([ApprovalStatus::Approved], ApprovalStatus::Suspended->allowedTransitions());
    }

    public function test_every_moderation_action_maps_to_a_status(): void
    {
        foreach (ModerationAction::cases() as $action) {
            $this->assertInstanceOf(ApprovalStatus::class, $action->resultingStatus());
        }
    }

    public function test_only_rejection_demands_a_reason(): void
    {
        foreach (ModerationAction::cases() as $action) {
            $this->assertSame($action === ModerationAction::Rejected, $action->requiresReason());
        }
    }
}
