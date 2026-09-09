<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Enums\ApprovalStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProviderSummaryResource;
use App\Models\Provider;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FeaturedProvidersController extends Controller
{
    public function __invoke(): AnonymousResourceCollection
    {
        return ProviderSummaryResource::collection(
            Provider::query()
                ->where('approval_status', ApprovalStatus::Approved->value)
                ->where('is_active', true)
                ->where('is_featured', true)
                ->with('serviceCategories')
                ->orderByDesc('is_verified')
                ->orderByDesc('approved_at')
                ->orderBy('id')
                ->limit(5)
                ->get()
        );
    }
}
