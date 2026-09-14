<?php

namespace App\Http\Controllers\Api\V1\Provider;

use App\Actions\Subscriptions\RequestSubscriptions;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubscriptionsRequest;
use App\Http\Resources\SubscriptionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SubscriptionsController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return SubscriptionResource::collection(
            $request->user()->subscriptions()->orderByPivot('created_at', 'desc')->get(),
        );
    }

    public function store(
        StoreSubscriptionsRequest $request,
        RequestSubscriptions $requestSubscriptions,
    ): JsonResponse {
        $requestSubscriptions->handle($request->user(), $request->validated('subscription_ids'));

        return SubscriptionResource::collection(
            $request->user()->subscriptions()->orderByPivot('created_at', 'desc')->get(),
        )->response()->setStatusCode(JsonResponse::HTTP_CREATED);
    }
}
