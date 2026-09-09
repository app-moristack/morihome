<?php

namespace App\Rest\Resources;

use App\Models\ServiceCategory;
use Lomkit\Rest\Concerns\Resource\DisableGates;
use Lomkit\Rest\Http\Requests\RestRequest;
use Lomkit\Rest\Relations\BelongsTo;
use Lomkit\Rest\Relations\HasMany;

class ServiceCategoryResource extends Resource
{
    use DisableGates;

    public static $model = ServiceCategory::class;

    public function fields(RestRequest $request): array
    {
        return [
            'id',
            'parent_id',
            'name',
            'slug',
            'icon',
            'description',
            'is_active',
            'is_popular',
            'sort_order',
            'created_at',
            'updated_at',
        ];
    }

    public function relations(RestRequest $request): array
    {
        return [
            BelongsTo::make('parent', self::class),
            HasMany::make('children', self::class),
        ];
    }
}
