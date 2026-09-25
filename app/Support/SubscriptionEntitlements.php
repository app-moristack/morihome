<?php

namespace App\Support;

use App\Enums\SubscriptionCategory;
use App\Models\SubscriptionUser;
use App\Models\User;

class SubscriptionEntitlements
{
    public function serviceSelectionLimit(User $user): int
    {
        $membership = $this->activeFor($user, SubscriptionCategory::Services);

        // Pending plans allow profile preparation without activating the subscription.
        $membership ??= SubscriptionUser::query()
            ->where('user_id', $user->id)
            ->whereNull('starts_at')
            ->whereNull('ends_at')
            ->whereHas('subscription', fn ($query) => $query
                ->where('category', SubscriptionCategory::Services->value)
                ->where('is_active', true))
            ->with('subscription')
            ->latest('id')
            ->first();

        return $membership?->subscription->active_item_limit ?? 0;
    }

    public function activeFor(
        User $user,
        SubscriptionCategory $category,
        bool $lockForUpdate = false,
    ): ?SubscriptionUser {
        return SubscriptionUser::query()
            ->where('user_id', $user->id)
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>=', now())
            ->whereHas('subscription', fn ($query) => $query
                ->where('category', $category->value)
                ->where('is_active', true))
            ->with('subscription')
            ->when($lockForUpdate, fn ($query) => $query->lockForUpdate())
            ->latest('starts_at')
            ->first();
    }
}
