<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubscriptionResource;
use App\Models\Subscription;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SubscriptionsController extends Controller
{
    public function __invoke(): AnonymousResourceCollection
    {
        return SubscriptionResource::collection(
            Subscription::query()->where('is_active', true)->orderBy('sort_order')->get(),
        );
    }
}
