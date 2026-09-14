<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePageViewRequest;
use App\Models\PageView;
use App\Models\Provider;
use Illuminate\Http\Response;

class PageViewsController extends Controller
{
    public function store(StorePageViewRequest $request): Response
    {
        if ($request->user('sanctum')?->isAdmin()) {
            return response()->noContent();
        }

        $path = $request->validated('path');

        if (str_starts_with($path, '/providers/')) {
            $provider = Provider::query()->where('slug', substr($path, 11))->first();
            abort_unless($provider?->isPubliclyVisible(), 404);
        }

        PageView::query()->firstOrCreate(
            ['event_id' => $request->validated('event_id')],
            ['path' => $path],
        );

        return response()->noContent();
    }
}
