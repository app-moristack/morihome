<?php

namespace App\Models;

use App\Enums\SubscriptionCategory;
use App\Enums\SubscriptionTier;
use Database\Factories\SubscriptionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Subscription extends Model
{
    /** @use HasFactory<SubscriptionFactory> */
    use HasFactory;

    protected $fillable = [
        'category',
        'tier',
        'slug',
        'name',
        'description',
        'price_rupees',
        'duration_months',
        'active_item_limit',
        'photos_per_item_limit',
        'item_duration_months',
        'business_verification_eligible',
        'priority_in_search',
        'featured_items',
        'homepage_exposure',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'category' => SubscriptionCategory::class,
            'tier' => SubscriptionTier::class,
            'price_rupees' => 'integer',
            'duration_months' => 'integer',
            'active_item_limit' => 'integer',
            'photos_per_item_limit' => 'integer',
            'item_duration_months' => 'integer',
            'business_verification_eligible' => 'boolean',
            'priority_in_search' => 'boolean',
            'featured_items' => 'boolean',
            'homepage_exposure' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->using(SubscriptionUser::class)
            ->withPivot(['id', 'starts_at', 'ends_at', 'approved_by', 'approved_at'])
            ->withTimestamps();
    }
}
