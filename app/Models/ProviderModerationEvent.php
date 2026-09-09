<?php

namespace App\Models;

use App\Enums\ApprovalStatus;
use App\Enums\ModerationAction;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProviderModerationEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'actor_id',
        'action',
        'from_status',
        'to_status',
        'reason',
        'changed_fields',
    ];

    protected function casts(): array
    {
        return [
            'action' => ModerationAction::class,
            'from_status' => ApprovalStatus::class,
            'to_status' => ApprovalStatus::class,
            'changed_fields' => 'array',
        ];
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
