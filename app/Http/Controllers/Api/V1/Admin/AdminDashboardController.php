<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminDashboardRequest;
use App\Services\Admin\DashboardMetrics;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function index(AdminDashboardRequest $request, DashboardMetrics $metrics): JsonResponse
    {
        return response()->json(['data' => $metrics->forDays($request->integer('days', 30))]);
    }
}
