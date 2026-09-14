<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveAdminCategoryRequest;
use App\Models\ServiceCategory;
use Illuminate\Http\JsonResponse;

class AdminCategoriesController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => ServiceCategory::query()->orderBy('sort_order')->orderBy('id')->get()]);
    }

    public function store(SaveAdminCategoryRequest $request): JsonResponse
    {
        $category = ServiceCategory::query()->create($request->validated());

        return response()->json(['data' => $category], 201);
    }

    public function update(SaveAdminCategoryRequest $request, ServiceCategory $category): JsonResponse
    {
        $category->update($request->validated());

        return response()->json(['data' => $category]);
    }
}
