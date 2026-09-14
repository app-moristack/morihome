<?php

namespace App\Models;

use App\Enums\SubscriptionCategory;
use Database\Factories\PropertyListingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PropertyListing extends Model
{
    /** @use HasFactory<PropertyListingFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'purpose',
        'property_type',
        'title',
        'description',
        'price_rupees',
        'bedrooms',
        'bathrooms',
        'area_sqm',
        'is_furnished',
        'address',
        'locality',
        'latitude',
        'longitude',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'purpose' => SubscriptionCategory::class,
            'price_rupees' => 'integer',
            'bedrooms' => 'integer',
            'bathrooms' => 'integer',
            'area_sqm' => 'float',
            'is_furnished' => 'boolean',
            'latitude' => 'float',
            'longitude' => 'float',
            'published_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    public function membership(): BelongsTo
    {
        return $this->belongsTo(SubscriptionUser::class, 'subscription_user_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(PropertyListingImage::class)->orderBy('sort_order');
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
