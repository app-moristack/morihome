<?php

namespace App\Services\Admin;

use App\Enums\ApprovalStatus;
use App\Http\Resources\AdminUserResource;
use App\Http\Resources\ProviderSummaryResource;
use App\Models\ContactEvent;
use App\Models\PageView;
use App\Models\Provider;
use App\Models\ServiceCategory;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;

class DashboardMetrics
{
    public function forDays(int $days): array
    {
        $end = CarbonImmutable::now();
        $start = $end->startOfDay()->subDays($days - 1);
        $previousStart = $start->subDays($days);
        $users = User::query();
        $individuals = User::query()->whereHas('provider', fn (Builder $query) => $query->where('provider_type', 'individual'));
        $businesses = User::query()->whereHas('provider', fn (Builder $query) => $query->where('provider_type', 'agency'));

        $statusGroups = Provider::query()
            ->selectRaw('approval_status, is_active, COUNT(*) as total')
            ->groupBy('approval_status', 'is_active')->get();
        $providers = array_fill_keys(ApprovalStatus::values(), 0);
        $userStatus = ['active' => User::query()->whereDoesntHave('provider')->count(), 'pending' => 0, 'suspended' => 0, 'inactive' => 0];
        foreach ($statusGroups as $group) {
            $status = $group->approval_status->value;
            $providers[$status] += (int) $group->total;
            $bucket = match (true) {
                in_array($status, ['pending', 'suspended'], true) => $status,
                $status === 'approved' && $group->is_active => 'active',
                default => 'inactive',
            };
            $userStatus[$bucket] += (int) $group->total;
        }

        $dailyRegistrations = User::query()
            ->join('providers', 'users.id', '=', 'providers.user_id')
            ->whereNull('providers.deleted_at')
            ->whereBetween('users.created_at', [$start, $end])
            ->selectRaw('DATE(users.created_at) as day, providers.provider_type, COUNT(*) as total')
            ->groupByRaw('DATE(users.created_at), providers.provider_type')
            ->get();
        $dailyViews = PageView::query()->whereBetween('created_at', [$start, $end])
            ->selectRaw('DATE(created_at) as day, COUNT(*) as total')
            ->groupByRaw('DATE(created_at)')->pluck('total', 'day');

        $bucketSize = $days === 7 ? 1 : ($days === 30 ? 7 : 15);
        $overview = [];
        for ($offset = 0; $offset < $days; $offset += $bucketSize) {
            $bucketStart = $start->addDays($offset);
            $bucketEnd = $bucketStart->addDays(min($bucketSize, $days - $offset) - 1);
            $matching = $dailyRegistrations->filter(fn ($row) => $row->day >= $bucketStart->toDateString() && $row->day <= $bucketEnd->toDateString());
            $views = $dailyViews->filter(fn ($count, $day) => $day >= $bucketStart->toDateString() && $day <= $bucketEnd->toDateString())->sum();
            $overview[] = [
                'start' => $bucketStart->toDateString(),
                'end' => $bucketEnd->toDateString(),
                'individuals' => (int) $matching->where('provider_type', 'individual')->sum('total'),
                'businesses' => (int) $matching->where('provider_type', 'agency')->sum('total'),
                'views' => (int) $views,
            ];
        }

        $viewMetric = $this->metric(PageView::query(), $start, $end, $previousStart);
        $viewMetric['total'] = $viewMetric['current'];
        $recent = Provider::query()->with('serviceCategories')->latest()->limit(8)->get();

        return [
            'period' => ['days' => $days, 'start' => $start->toIso8601String(), 'end' => $end->toIso8601String()],
            'metrics' => [
                'users' => $this->metric($users, $start, $end, $previousStart),
                'individuals' => $this->metric($individuals, $start, $end, $previousStart),
                'businesses' => $this->metric($businesses, $start, $end, $previousStart),
                'views' => $viewMetric,
            ],
            'providers' => $providers,
            'user_status' => $userStatus,
            'overview' => $overview,
            'recent_users' => AdminUserResource::collection(User::query()->with(['roles', 'provider.serviceCategories'])
                ->whereBetween('created_at', [$start, $end])->latest()->orderByDesc('id')->limit(5)->get())->resolve(),
            'categories' => ServiceCategory::query()->orderBy('sort_order')->orderBy('id')->limit(5)
                ->get(['id', 'name', 'slug', 'icon', 'is_active', 'sort_order']),
            'top_pages' => PageView::query()->whereBetween('created_at', [$start, $end])
                ->selectRaw('path, COUNT(*) as views')->groupBy('path')->orderByDesc('views')->orderBy('path')->limit(8)->get(),
            'tracking_started_at' => PageView::query()->min('created_at'),
            'service_categories' => [
                'total' => ServiceCategory::count(),
                'active' => ServiceCategory::where('is_active', true)->count(),
            ],
            'contact_events_last_30_days' => ContactEvent::where('created_at', '>=', $end->subDays(30))->count(),
            'recent_registrations' => ProviderSummaryResource::collection($recent)->resolve(),
        ];
    }

    private function metric(Builder $query, CarbonImmutable $start, CarbonImmutable $end, CarbonImmutable $previousStart): array
    {
        $counts = (clone $query)->selectRaw('COUNT(*) as total')
            ->selectRaw('COUNT(CASE WHEN created_at >= ? AND created_at <= ? THEN 1 END) as current_count', [$start, $end])
            ->selectRaw('COUNT(CASE WHEN created_at >= ? AND created_at < ? THEN 1 END) as previous_count', [$previousStart, $start])
            ->first();
        $current = (int) $counts->current_count;
        $previous = (int) $counts->previous_count;

        return [
            'total' => (int) $counts->total,
            'current' => $current,
            'previous' => $previous,
            'change_percent' => $previous > 0 ? round(($current - $previous) / $previous * 100, 1) : null,
        ];
    }
}
