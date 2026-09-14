<?php

namespace App\Http\Resources;

use App\Models\SubscriptionUser;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category' => $this->category->value,
            'category_label' => $this->category->label(),
            'tier' => $this->tier->value,
            'tier_label' => $this->tier->label(),
            'slug' => $this->slug,
            'name' => $this->name,
            'description' => $this->description,
            'price_rupees' => $this->price_rupees,
            'duration_months' => $this->duration_months,
            'active_item_limit' => $this->active_item_limit,
            'photos_per_item_limit' => $this->photos_per_item_limit,
            'item_duration_months' => $this->item_duration_months,
            'business_verification_eligible' => $this->business_verification_eligible,
            'priority_in_search' => $this->priority_in_search,
            'featured_items' => $this->featured_items,
            'homepage_exposure' => $this->homepage_exposure,
            'membership' => $this->whenPivotLoaded('subscription_user', function (): array {
                /** @var SubscriptionUser $membership */
                $membership = $this->pivot;

                return [
                    'id' => $membership->id,
                    'starts_at' => $membership->starts_at,
                    'ends_at' => $membership->ends_at,
                    'state' => $membership->state(),
                    'approved_at' => $membership->approved_at,
                ];
            }),
        ];
    }
}
