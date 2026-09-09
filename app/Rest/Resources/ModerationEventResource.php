<?php

namespace App\Rest\Resources;

use App\Models\ProviderModerationEvent;
use Lomkit\Rest\Concerns\Resource\DisableGates;
use Lomkit\Rest\Http\Requests\RestRequest;
use Lomkit\Rest\Relations\BelongsTo;

class ModerationEventResource extends Resource
{
    use DisableGates;

    public static $model = ProviderModerationEvent::class;

    public function fields(RestRequest $request): array
    {
        return ['id', 'provider_id', 'actor_id', 'action', 'from_status', 'to_status', 'reason', 'created_at'];
    }

    public function relations(RestRequest $request): array
    {
        return [
            BelongsTo::make('actor', UserResource::class),
        ];
    }
}
