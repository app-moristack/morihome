<?php

namespace App\Models;

use App\Enums\ContactChannel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'service_category_id',
        'channel',
        'source',
        'session_hash',
    ];

    protected function casts(): array
    {
        return [
            'channel' => ContactChannel::class,
        ];
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    public function serviceCategory(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class);
    }
}
