<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceCategoryResource;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiceCategoriesController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $categories = ServiceCategory::query()
            ->where('is_active', true)
            ->whereNull('parent_id')
            ->when($request->boolean('popular_only'), fn ($query) => $query->where('is_popular', true))
            ->with(['children' => fn ($query) => $query->where('is_active', true)->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();

        return ServiceCategoryResource::collection($categories);
    }
}
