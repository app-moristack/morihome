<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactMessageRequest;
use App\Mail\ContactMessage;
use App\Models\PlatformSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class ContactMessagesController extends Controller
{
    public function __invoke(StoreContactMessageRequest $request): JsonResponse
    {
        $data = $request->validated();

        Mail::to(PlatformSetting::current()['support_email'])->send(new ContactMessage(
            senderName: $data['name'],
            senderEmail: $data['email'],
            senderPhone: $data['phone'] ?? null,
            subjectLine: $data['subject'],
            bodyText: $data['message'],
        ));

        return response()->json([
            'message' => 'Your message has been sent. We will get back to you shortly.',
        ], JsonResponse::HTTP_ACCEPTED);
    }
}
