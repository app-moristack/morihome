<?php

namespace App\Rest\Resources;

use Lomkit\Rest\Http\Requests\RestRequest;
use Lomkit\Rest\Http\Resource as RestResource;

abstract class Resource extends RestResource
{
    public function limits(RestRequest $request): array
    {
        return [10, 25, 50, 100];
    }
}
