<?php

namespace App\Rest\Resources;

use App\Models\ProviderPortfolioImage;
use Lomkit\Rest\Concerns\Resource\DisableGates;
use Lomkit\Rest\Http\Requests\RestRequest;

class PortfolioImageResource extends Resource
{
    use DisableGates;

    public static $model = ProviderPortfolioImage::class;

    public function fields(RestRequest $request): array
    {
        return ['id', 'provider_id', 'path', 'caption', 'width', 'height', 'sort_order'];
    }

    public function relations(RestRequest $request): array
    {
        return [];
    }
}
