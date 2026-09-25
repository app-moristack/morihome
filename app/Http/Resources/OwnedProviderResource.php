<?php

namespace App\Http\Resources;

use App\Support\SubscriptionEntitlements;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OwnedProviderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'provider_type' => $this->provider_type->value,
            'description' => $this->description,
            'phone' => $this->phone,
            'whatsapp_phone' => $this->whatsapp_phone,
            'email' => $this->email,
            'website' => $this->website,
            'social_links' => $this->social_links,
            'address' => $this->address,
            'locality' => $this->locality,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'service_areas' => $this->service_areas,
            'service_selection_limit' => app(SubscriptionEntitlements::class)->serviceSelectionLimit($this->user),
            'logo_url' => $this->logoUrl(),
            'cover_url' => $this->coverUrl(),
            'approval_status' => $this->approval_status->value,
            'approval_status_label' => $this->approval_status->label(),
            'can_submit_for_review' => $this->approval_status->canSubmitForReview(),
            'is_publicly_visible' => $this->isPubliclyVisible(),
            'is_verified' => $this->is_verified,
            'is_featured' => $this->is_featured,
            'rejection_reason' => $this->rejection_reason,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'approved_at' => $this->approved_at?->toIso8601String(),
            'service_categories' => ServiceCategoryResource::collection($this->whenLoaded('serviceCategories')),
            'portfolio_images' => PortfolioImageResource::collection($this->whenLoaded('portfolioImages')),
            'opening_hours' => OpeningHourResource::collection($this->whenLoaded('openingHours')),
        ];
    }
}
