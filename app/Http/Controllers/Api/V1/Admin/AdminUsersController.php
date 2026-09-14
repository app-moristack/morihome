<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminUsersRequest;
use App\Http\Resources\AdminUserResource;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminUsersController extends Controller
{
    public function index(AdminUsersRequest $request): AnonymousResourceCollection
    {
        $query = User::query()->with(['roles', 'provider.serviceCategories']);

        if ($term = $request->validated('term')) {
            $query->where(function (Builder $query) use ($term) {
                $query->where('name', 'like', '%'.$term.'%')
                    ->orWhere('email', 'like', '%'.$term.'%')
                    ->orWhere('phone', 'like', '%'.$term.'%')
                    ->orWhereHas('provider', function (Builder $query) use ($term) {
                        $query->where('name', 'like', '%'.$term.'%')
                            ->orWhere('locality', 'like', '%'.$term.'%')
                            ->orWhereHas('serviceCategories', fn (Builder $query) => $query->where('name', 'like', '%'.$term.'%'));
                    });
            });
        }

        if ($type = $request->validated('type')) {
            $query->whereHas('provider', fn (Builder $query) => $query->where('provider_type', $type));
        }

        $status = $request->validated('status');
        if ($status === 'active') {
            $query->where(fn (Builder $query) => $query->whereDoesntHave('provider')
                ->orWhereHas('provider', fn (Builder $query) => $query->where('approval_status', 'approved')->where('is_active', true)));
        } elseif (in_array($status, ['pending', 'suspended'], true)) {
            $query->whereHas('provider', fn (Builder $query) => $query->where('approval_status', $status));
        } elseif ($status === 'inactive') {
            $query->whereHas('provider', fn (Builder $query) => $query->where(function (Builder $query) {
                $query->whereIn('approval_status', ['draft', 'rejected'])
                    ->orWhere(fn (Builder $query) => $query->where('approval_status', 'approved')->where('is_active', false));
            }));
        }

        return AdminUserResource::collection($query->latest()->orderByDesc('id')->paginate($request->integer('per_page', 25)));
    }
}
