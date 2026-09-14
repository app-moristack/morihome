<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionMembershipResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'state' => $this->state(),
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'requested_at' => $this->created_at,
            'approved_at' => $this->approved_at,
            'subscription' => new SubscriptionResource($this->whenLoaded('subscription')),
            'user' => $this->whenLoaded('user', fn (): array => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'phone' => $this->user->phone,
                'email' => $this->user->email,
                'provider_type' => $this->user->provider?->provider_type->value,
            ]),
        ];
    }
}
