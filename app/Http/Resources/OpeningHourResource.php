<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OpeningHourResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'day_of_week' => $this->day_of_week,
            'is_closed' => $this->is_closed,
            'opens_at' => $this->opens_at,
            'closes_at' => $this->closes_at,
        ];
    }
}
