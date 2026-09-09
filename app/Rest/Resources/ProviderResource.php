<?php

namespace App\Rest\Resources;

use App\Models\Provider;
use Lomkit\Rest\Concerns\Resource\DisableGates;
use Lomkit\Rest\Http\Requests\RestRequest;
use Lomkit\Rest\Relations\BelongsTo;
use Lomkit\Rest\Relations\BelongsToMany;
use Lomkit\Rest\Relations\HasMany;

class ProviderResource extends Resource
{
    use DisableGates;

    public static $model = Provider::class;

    public function fields(RestRequest $request): array
    {
        return [
            'id',
            'user_id',
            'provider_type',
            'name',
            'slug',
            'description',
            'phone',
            'whatsapp_phone',
            'email',
            'website',
            'address',
            'locality',
            'latitude',
            'longitude',
            'logo_path',
            'cover_path',
            'approval_status',
            'submitted_at',
            'approved_at',
            'approved_by',
            'rejection_reason',
            'suspended_at',
            'is_active',
            'is_verified',
            'is_featured',
            'created_at',
            'updated_at',
        ];
    }

    public function relations(RestRequest $request): array
    {
        return [
            BelongsTo::make('user', UserResource::class),
            BelongsToMany::make('serviceCategories', ServiceCategoryResource::class),
            HasMany::make('portfolioImages', PortfolioImageResource::class),
            HasMany::make('moderationEvents', ModerationEventResource::class),
        ];
    }
}
