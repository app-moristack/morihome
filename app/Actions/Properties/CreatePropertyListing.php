<?php

namespace App\Actions\Properties;

use App\Enums\SubscriptionCategory;
use App\Models\PropertyListing;
use App\Models\Provider;
use App\Support\SubscriptionEntitlements;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CreatePropertyListing
{
    public function __construct(private readonly SubscriptionEntitlements $entitlements) {}

    public function handle(Provider $provider, array $input): PropertyListing
    {
        return DB::transaction(function () use ($provider, $input): PropertyListing {
            $purpose = SubscriptionCategory::from($input['purpose']);
            $membership = $this->entitlements->activeFor($provider->user, $purpose, lockForUpdate: true);

            if ($membership === null) {
                throw ValidationException::withMessages([
                    'purpose' => 'You need an active '.$purpose->label().' subscription to create this listing.',
                ]);
            }

            $usedSlots = $provider->propertyListings()
                ->where('purpose', $purpose->value)
                ->whereIn('status', ['draft', 'published'])
                ->count();

            if ($usedSlots >= $membership->subscription->active_item_limit) {
                throw ValidationException::withMessages([
                    'purpose' => 'Your '.$membership->subscription->name.' plan allows only '
                        .$membership->subscription->active_item_limit.' active listings.',
                ]);
            }

            $listing = $provider->propertyListings()->make($input);
            $listing->forceFill([
                'subscription_user_id' => $membership->id,
                'slug' => $this->uniqueSlug($input['title']),
                'status' => 'published',
                'published_at' => now(),
                'expires_at' => $membership->subscription->item_duration_months === null
                    ? null
                    : now()->addMonthsNoOverflow($membership->subscription->item_duration_months),
            ])->save();

            return $listing->refresh();
        });
    }

    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title) ?: 'property';
        $slug = $base;
        $suffix = 1;

        while (PropertyListing::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.++$suffix;
        }

        return $slug;
    }
}
