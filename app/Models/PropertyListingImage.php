<?php

namespace App\Models;

use Database\Factories\PropertyListingImageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PropertyListingImage extends Model
{
    /** @use HasFactory<PropertyListingImageFactory> */
    use HasFactory;

    protected $fillable = ['path', 'caption', 'width', 'height', 'sort_order'];

    protected function casts(): array
    {
        return [
            'width' => 'integer',
            'height' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(PropertyListing::class, 'property_listing_id');
    }

    public function url(): string
    {
        return Storage::disk('public')->url($this->path);
    }
}
