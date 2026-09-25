<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Actions\Providers\RegisterProvider;
use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterAccountRequest;
use App\Http\Requests\RegisterProviderRequest;
use App\Http\Resources\UserResource;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class RegisteredProvidersController extends Controller
{
    public function validateAccount(RegisterAccountRequest $request): Response
    {
        return response()->noContent();
    }

    public function store(RegisterProviderRequest $request, RegisterProvider $registerProvider): JsonResponse
    {
        $provider = $registerProvider->handle($request->validated());

        event(new Registered($provider->user));
        Auth::login($provider->user);
        $request->session()->regenerate();

        return (new UserResource($provider->user->load(['provider.serviceCategories', 'subscriptions'])))
            ->response()
            ->setStatusCode(JsonResponse::HTTP_CREATED);
    }
}
