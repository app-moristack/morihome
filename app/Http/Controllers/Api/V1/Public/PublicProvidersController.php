<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Enums\ApprovalStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\PublicProviderResource;
use App\Models\Provider;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PublicProvidersController extends Controller
{
    public function show(string $slug): PublicProviderResource
    {
        $provider = Provider::query()
            ->where('slug', $slug)
            ->where('approval_status', ApprovalStatus::Approved->value)
            ->where('is_active', true)
            ->with(['serviceCategories', 'portfolioImages', 'openingHours'])
            ->first();

        if ($provider === null) {
            throw new NotFoundHttpException(__('provider.not_found'));
        }

        return new PublicProviderResource($provider);
    }
}
