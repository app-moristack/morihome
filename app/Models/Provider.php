<?php

namespace App\Models;

use App\Enums\ApprovalStatus;
use App\Enums\ProviderType;
use App\Support\Coordinates;
use App\Support\PhoneNumber;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Provider extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'provider_type',
        'name',
        'description',
        'phone',
        'whatsapp_phone',
        'email',
        'website',
        'social_links',
        'address',
        'locality',
        'latitude',
        'longitude',
        'service_areas',
    ];

    protected $hidden = [
        'latitude',
        'longitude',
    ];

    protected function casts(): array
    {
        return [
            'provider_type' => ProviderType::class,
            'approval_status' => ApprovalStatus::class,
            'social_links' => 'array',
            'service_areas' => 'array',
            'latitude' => 'float',
            'longitude' => 'float',
            'is_active' => 'boolean',
            'is_verified' => 'boolean',
            'is_featured' => 'boolean',
            'submitted_at' => 'datetime',
            'approved_at' => 'datetime',
            'suspended_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function serviceCategories(): BelongsToMany
    {
        return $this->belongsToMany(ServiceCategory::class)
            ->withPivot(['specialty', 'is_primary'])
            ->withTimestamps();
    }

    public function portfolioImages(): HasMany
    {
        return $this->hasMany(ProviderPortfolioImage::class)->orderBy('sort_order');
    }

    public function openingHours(): HasMany
    {
        return $this->hasMany(ProviderOpeningHour::class)->orderBy('day_of_week');
    }

    public function moderationEvents(): HasMany
    {
        return $this->hasMany(ProviderModerationEvent::class)->latest();
    }

    public function contactEvents(): HasMany
    {
        return $this->hasMany(ContactEvent::class);
    }

    public function propertyListings(): HasMany
    {
        return $this->hasMany(PropertyListing::class);
    }

    public function coordinates(): Coordinates
    {
        return new Coordinates($this->latitude, $this->longitude);
    }

    public function whatsappNumber(): ?PhoneNumber
    {
        return PhoneNumber::tryParse($this->whatsapp_phone ?? $this->phone);
    }

    public function isPubliclyVisible(): bool
    {
        return $this->approval_status->isPubliclyVisible() && $this->is_active;
    }

    public function logoUrl(): ?string
    {
        return $this->logo_path ? Storage::disk('public')->url($this->logo_path) : null;
    }

    public function coverUrl(): ?string
    {
        return $this->cover_path ? Storage::disk('public')->url($this->cover_path) : null;
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
