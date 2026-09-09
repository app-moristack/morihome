<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Locality;
use Illuminate\Http\JsonResponse;

class LocalitiesController extends Controller
{
    public function index(): JsonResponse
    {
        $localities = Locality::query()
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'district', 'latitude', 'longitude']);

        return response()->json(['data' => $localities]);
    }
}
