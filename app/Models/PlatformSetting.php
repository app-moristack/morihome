<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformSetting extends Model
{
    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'key',
        'value',
    ];

    /** @return array<string, string|null> */
    public static function current(): array
    {
        $stored = static::query()->pluck('value', 'key');
        $defaults = [
            'app_name' => config('app.name'),
            'support_email' => config('morihome.support_email'),
            'support_whatsapp' => config('morihome.support_whatsapp'),
            'whatsapp_message_template' => config('morihome.whatsapp.message_template'),
        ];

        return collect($defaults)->mapWithKeys(fn ($default, string $key) => [$key => $stored[$key] ?? $default])->all();
    }
}
