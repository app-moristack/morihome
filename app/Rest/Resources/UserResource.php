<?php

namespace App\Rest\Resources;

use App\Models\User;
use Lomkit\Rest\Concerns\Resource\DisableGates;
use Lomkit\Rest\Http\Requests\RestRequest;

class UserResource extends Resource
{
    use DisableGates;

    public static $model = User::class;

    public function fields(RestRequest $request): array
    {
        return ['id', 'name', 'phone', 'email', 'last_login_at', 'created_at'];
    }

    public function relations(RestRequest $request): array
    {
        return [];
    }
}
