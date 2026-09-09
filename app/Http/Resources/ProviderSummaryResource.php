<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProviderSummaryResource extends JsonResource
{
    private const APPROXIMATE_COORDINATE_PRECISION = 2;

    public function toArray(Request $request): array
    {
        $approximate = $this->coordinates()->obfuscated(self::APPROXIMATE_COORDINATE_PRECISION);

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'provider_type' => $this->provider_type->value,
            'provider_type_label' => $this->provider_type->label(),
            'excerpt' => str($this->description ?? '')->limit(140)->value(),
            'locality' => $this->locality,
            'approximate_latitude' => $approximate->latitude,
            'approximate_longitude' => $approximate->longitude,
            'logo_url' => $this->logoUrl(),
            'cover_url' => $this->coverUrl(),
            'is_verified' => $this->is_verified,
            'is_featured' => $this->is_featured,
            'distance_km' => $this->when(
                isset($this->distance_km),
                fn () => round((float) $this->distance_km, 1),
            ),
            'whatsapp_number' => $this->whatsappNumber()?->whatsappDigits(),
            'service_categories' => ServiceCategoryTagResource::collection($this->whenLoaded('serviceCategories')),
        ];
    }
}
