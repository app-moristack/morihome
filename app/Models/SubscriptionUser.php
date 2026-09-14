<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class SubscriptionUser extends Pivot
{
    public $incrementing = true;

    protected $table = 'subscription_user';

    protected $fillable = [
        'subscription_id',
        'user_id',
        'starts_at',
        'ends_at',
        'approved_by',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function state(): string
    {
        if ($this->starts_at === null || $this->ends_at === null) {
            return 'awaiting_approval';
        }

        return $this->isActive() ? 'active' : 'inactive';
    }

    public function isActive(): bool
    {
        $now = now();

        return $this->starts_at !== null
            && $this->ends_at !== null
            && $this->starts_at->lessThanOrEqualTo($now)
            && $this->ends_at->greaterThanOrEqualTo($now);
    }
}
