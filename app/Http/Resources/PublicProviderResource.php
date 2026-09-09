<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicProviderResource extends JsonResource
{
    private const APPROXIMATE_COORDINATE_PRECISION = 2;

    public function toArray(Request $request): array
    {
        $approximate = $this->coordinates()->obfuscated(self::APPROXIMATE_COORDINATE_PRECISION);
        $whatsapp = $this->whatsappNumber();

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'provider_type' => $this->provider_type->value,
            'provider_type_label' => $this->provider_type->label(),
            'description' => $this->description,
            'locality' => $this->locality,
            'service_areas' => $this->service_areas,
            'approximate_latitude' => $approximate->latitude,
            'approximate_longitude' => $approximate->longitude,
            'distance_km' => $this->when(
                isset($this->distance_km),
                fn () => round((float) $this->distance_km, 1),
            ),
            'phone' => $this->phone,
            'whatsapp_number' => $whatsapp?->whatsappDigits(),
            'whatsapp_display' => $whatsapp?->format(),
            'email' => $this->email,
            'website' => $this->website,
            'social_links' => $this->social_links,
            'logo_url' => $this->logoUrl(),
            'cover_url' => $this->coverUrl(),
            'is_verified' => $this->is_verified,
            'is_featured' => $this->is_featured,
            'approved_at' => $this->approved_at?->toDateString(),
            'service_categories' => ServiceCategoryResource::collection($this->whenLoaded('serviceCategories')),
            'portfolio_images' => PortfolioImageResource::collection($this->whenLoaded('portfolioImages')),
            'opening_hours' => OpeningHourResource::collection($this->whenLoaded('openingHours')),
        ];
    }
}
