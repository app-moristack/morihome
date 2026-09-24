<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyListingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'purpose' => $this->purpose->value,
            'property_type' => $this->property_type,
            'title' => $this->title,
            'description' => $this->description,
            'price_rupees' => $this->price_rupees,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'area_sqm' => $this->area_sqm,
            'amenities' => $this->amenities ?? [],
            'is_furnished' => $this->is_furnished,
            'address' => $this->address,
            'locality' => $this->locality,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'status' => $this->status,
            'expires_at' => $this->expires_at,
            'images' => PropertyListingImageResource::collection($this->whenLoaded('images')),
            'photo_limit' => $this->whenLoaded(
                'membership',
                fn (): ?int => $this->membership->subscription?->photos_per_item_limit,
            ),
            'provider' => $this->whenLoaded('provider', fn (): array => [
                'name' => $this->provider->name,
                'logo_url' => $this->provider->logoUrl(),
                'profile_available' => $this->provider->isPubliclyVisible(),
                'slug' => $this->provider->slug,
                'phone' => $this->provider->phone,
                'whatsapp_phone' => $this->provider->whatsapp_phone,
                'is_verified' => $this->provider->is_verified,
            ]),
        ];
    }
}
