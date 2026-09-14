<?php

namespace App\Http\Resources;

use App\Enums\ApprovalStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $provider = $this->provider;
        $status = match (true) {
            $provider === null => 'active',
            $provider->approval_status === ApprovalStatus::Pending => 'pending',
            $provider->approval_status === ApprovalStatus::Suspended => 'suspended',
            $provider->isPubliclyVisible() => 'active',
            default => 'inactive',
        };

        return [
            'id' => $this->id,
            'name' => $provider?->name ?? $this->name,
            'account_name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'type' => $provider?->provider_type->value ?? 'account',
            'roles' => $this->roles->pluck('name'),
            'locality' => $provider?->locality,
            'logo_url' => $provider?->logoUrl(),
            'service' => $provider?->serviceCategories->first()?->name,
            'status' => $status,
            'joined_at' => $this->created_at?->toIso8601String(),
            'provider_id' => $provider?->id,
            'provider_slug' => $provider?->slug,
            'approval_status' => $provider?->approval_status->value,
        ];
    }
}
