<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Actions\Providers\RecordContactEvent;
use App\Enums\ApprovalStatus;
use App\Enums\ContactChannel;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactEventRequest;
use App\Models\Provider;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ContactEventsController extends Controller
{
    public function store(
        StoreContactEventRequest $request,
        string $slug,
        RecordContactEvent $recordContactEvent,
    ): JsonResponse {
        $provider = Provider::query()
            ->where('slug', $slug)
            ->where('approval_status', ApprovalStatus::Approved->value)
            ->where('is_active', true)
            ->first();

        if ($provider === null) {
            throw new NotFoundHttpException(__('provider.not_found'));
        }

        $recordContactEvent->handle(
            provider: $provider,
            channel: ContactChannel::from($request->validated('channel')),
            request: $request,
            serviceCategoryId: $request->validated('service_category_id'),
            source: $request->validated('source'),
        );

        return response()->json(status: JsonResponse::HTTP_NO_CONTENT);
    }
}
