<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ActivateSubscriptionRequest;
use App\Http\Resources\SubscriptionMembershipResource;
use App\Models\SubscriptionUser;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class SubscriptionsController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'state' => ['sometimes', Rule::in(['awaiting_approval', 'active', 'inactive'])],
            'term' => ['sometimes', 'string', 'max:100'],
        ]);

        $memberships = SubscriptionUser::query()
            ->with(['subscription', 'user.provider'])
            ->when($validated['state'] ?? null, function ($query, string $state): void {
                $query
                    ->when($state === 'awaiting_approval', fn ($query) => $query->where(function ($query): void {
                        $query->whereNull('starts_at')->orWhereNull('ends_at');
                    }))
                    ->when($state === 'active', fn ($query) => $query
                        ->where('starts_at', '<=', now())
                        ->where('ends_at', '>=', now()))
                    ->when($state === 'inactive', fn ($query) => $query
                        ->whereNotNull('starts_at')
                        ->whereNotNull('ends_at')
                        ->where(function ($query): void {
                            $query->where('starts_at', '>', now())->orWhere('ends_at', '<', now());
                        }));
            })
            ->when($validated['term'] ?? null, function ($query, string $term): void {
                $query->where(function ($query) use ($term): void {
                    $query->whereHas('user', fn ($query) => $query
                        ->where('name', 'like', "%{$term}%")
                        ->orWhere('phone', 'like', "%{$term}%"))
                        ->orWhereHas('subscription', fn ($query) => $query->where('name', 'like', "%{$term}%"));
                });
            })
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return SubscriptionMembershipResource::collection($memberships);
    }

    public function update(ActivateSubscriptionRequest $request, int $membership): SubscriptionMembershipResource
    {
        $subscription = SubscriptionUser::query()->findOrFail($membership);
        $subscription->update([
            ...$request->validated(),
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return new SubscriptionMembershipResource($subscription->load(['subscription', 'user.provider']));
    }
}
