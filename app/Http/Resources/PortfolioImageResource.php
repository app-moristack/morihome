<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PortfolioImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'url' => $this->url(),
            'caption' => $this->caption,
            'width' => $this->width,
            'height' => $this->height,
            'sort_order' => $this->sort_order,
        ];
    }
}
