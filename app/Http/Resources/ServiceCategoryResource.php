<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'icon' => $this->icon,
            'description' => $this->description,
            'is_popular' => $this->is_popular,
            'sort_order' => $this->sort_order,
            'parent_id' => $this->parent_id,
            'children' => self::collection($this->whenLoaded('children')),
            'specialty' => $this->whenPivotLoaded('provider_service_category', fn () => $this->pivot->specialty),
            'is_primary' => $this->whenPivotLoaded('provider_service_category', fn () => (bool) $this->pivot->is_primary),
        ];
    }
}
