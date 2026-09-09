<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ApprovalStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProviderSummaryResource;
use App\Models\ContactEvent;
use App\Models\Provider;
use App\Models\ServiceCategory;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $countsByStatus = Provider::query()
            ->selectRaw('approval_status, COUNT(*) as total')
            ->groupBy('approval_status')
            ->pluck('total', 'approval_status');

        $counts = [];

        foreach (ApprovalStatus::cases() as $status) {
            $counts[$status->value] = (int) ($countsByStatus[$status->value] ?? 0);
        }

        $recent = Provider::query()
            ->with('serviceCategories:id,name,slug,icon')
            ->latest()
            ->limit(8)
            ->get();

        return response()->json([
            'data' => [
                'providers' => $counts,
                'service_categories' => [
                    'total' => ServiceCategory::count(),
                    'active' => ServiceCategory::where('is_active', true)->count(),
                ],
                'contact_events_last_30_days' => ContactEvent::where('created_at', '>=', now()->subDays(30))->count(),
                'recent_registrations' => ProviderSummaryResource::collection($recent)->resolve(),
            ],
        ]);
    }
}
