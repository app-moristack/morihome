<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function provider(): HasOne
    {
        return $this->hasOne(Provider::class);
    }

    public function subscriptions(): BelongsToMany
    {
        return $this->belongsToMany(Subscription::class)
            ->using(SubscriptionUser::class)
            ->withPivot(['id', 'starts_at', 'ends_at', 'approved_by', 'approved_at'])
            ->withTimestamps();
    }

    public function activeSubscriptions(): BelongsToMany
    {
        return $this->subscriptions()
            ->wherePivot('starts_at', '<=', now())
            ->wherePivot('ends_at', '>=', now());
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(UserRole::Admin->value);
    }
}
