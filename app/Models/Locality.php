<?php

namespace App\Models;

use App\Support\Coordinates;
use Illuminate\Database\Eloquent\Model;

class Locality extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'district',
        'latitude',
        'longitude',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public function coordinates(): Coordinates
    {
        return new Coordinates($this->latitude, $this->longitude);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
