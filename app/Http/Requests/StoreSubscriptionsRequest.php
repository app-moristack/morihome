<?php

namespace App\Http\Requests;

use App\Enums\ProviderType;
use App\Enums\SubscriptionTier;
use App\Models\Subscription;
use App\Models\SubscriptionUser;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreSubscriptionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->provider !== null;
    }

    public function rules(): array
    {
        return [
            'subscription_ids' => ['required', 'array', 'min:1', 'max:3'],
            'subscription_ids.*' => [
                'integer',
                'distinct',
                Rule::exists('subscriptions', 'id')->where('is_active', true),
            ],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->hasAny(['subscription_ids', 'subscription_ids.*'])) {
                    return;
                }

                $subscriptions = Subscription::query()->whereKey($this->input('subscription_ids'))->get();

                if ($subscriptions->map(
                    fn (Subscription $subscription): string => $subscription->category->value,
                )->unique()->count() !== $subscriptions->count()) {
                    $validator->errors()->add(
                        'subscription_ids',
                        'Choose no more than one subscription from each category.',
                    );
                }

                $isIndividual = $this->user()->provider->provider_type === ProviderType::Individual;
                $hasIneligiblePlan = $subscriptions->contains(
                    fn (Subscription $subscription): bool => $isIndividual
                        ? $subscription->tier !== SubscriptionTier::Free
                        : $subscription->tier === SubscriptionTier::Free,
                );

                if ($hasIneligiblePlan) {
                    $validator->errors()->add(
                        'subscription_ids',
                        $isIndividual
                            ? 'Individuals can only choose free subscriptions.'
                            : 'Agencies must choose from the paid subscriptions.',
                    );
                }

                $unavailableCategories = SubscriptionUser::query()
                    ->where('user_id', $this->user()->id)
                    ->where(function ($query): void {
                        $query->whereNull('starts_at')
                            ->orWhereNull('ends_at')
                            ->orWhere(function ($active): void {
                                $active->where('starts_at', '<=', now())->where('ends_at', '>=', now());
                            });
                    })
                    ->with('subscription:id,category')
                    ->get()
                    ->map(fn (SubscriptionUser $membership): string => $membership->subscription->category->value);

                $requestedCategories = $subscriptions->map(
                    fn (Subscription $subscription): string => $subscription->category->value,
                );

                if ($requestedCategories->intersect($unavailableCategories)->isNotEmpty()) {
                    $validator->errors()->add(
                        'subscription_ids',
                        'You already have an active or awaiting subscription in one of these categories.',
                    );
                }
            },
        ];
    }
}
