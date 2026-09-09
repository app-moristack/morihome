<?php

namespace App\Http\Controllers\Api\V1\Provider;

use App\Actions\Providers\ReorderPortfolioImages;
use App\Actions\Providers\StorePortfolioImage;
use App\Http\Controllers\Controller;
use App\Http\Requests\ReorderPortfolioRequest;
use App\Http\Requests\StorePortfolioImageRequest;
use App\Http\Resources\PortfolioImageResource;
use App\Models\ProviderPortfolioImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class ProviderPortfolioController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return PortfolioImageResource::collection($request->user()->provider->portfolioImages);
    }

    public function store(StorePortfolioImageRequest $request, StorePortfolioImage $storeImage): JsonResponse
    {
        $image = $storeImage->handle(
            provider: $request->user()->provider,
            file: $request->file('image'),
            caption: $request->validated('caption'),
        );

        return (new PortfolioImageResource($image))->response()->setStatusCode(JsonResponse::HTTP_CREATED);
    }

    public function update(ReorderPortfolioRequest $request, ReorderPortfolioImages $reorderImages): AnonymousResourceCollection
    {
        $provider = $request->user()->provider;
        $reorderImages->handle($provider, $request->validated('image_ids'));

        return PortfolioImageResource::collection($provider->portfolioImages()->get());
    }

    public function destroy(Request $request, ProviderPortfolioImage $image): JsonResponse
    {
        $this->authorize('managePortfolio', $image->provider);

        Storage::disk('public')->delete($image->path);
        $image->delete();

        return response()->json(status: JsonResponse::HTTP_NO_CONTENT);
    }
}
