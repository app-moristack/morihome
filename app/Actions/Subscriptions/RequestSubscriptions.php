<?php

namespace App\Actions\Subscriptions;

use App\Models\SubscriptionUser;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class RequestSubscriptions
{
    /**
     * @param  list<int>  $subscriptionIds
     * @return Collection<int, SubscriptionUser>
     */
    public function handle(User $user, array $subscriptionIds): Collection
    {
        return DB::transaction(
            fn (): Collection => collect($subscriptionIds)->map(
                fn (int $subscriptionId): SubscriptionUser => SubscriptionUser::create([
                    'subscription_id' => $subscriptionId,
                    'user_id' => $user->id,
                ]),
            ),
        );
    }
}
