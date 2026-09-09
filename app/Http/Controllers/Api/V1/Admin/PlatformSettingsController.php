<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PlatformSettingsController extends Controller
{
    private const EDITABLE_KEYS = ['app_name', 'support_email', 'support_whatsapp', 'whatsapp_message_template'];

    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->currentSettings()]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', Rule::in(self::EDITABLE_KEYS)],
            'settings.*.value' => ['nullable', 'string', 'max:500'],
        ]);

        foreach ($validated['settings'] as $setting) {
            PlatformSetting::updateOrCreate(['key' => $setting['key']], ['value' => $setting['value']]);
        }

        return response()->json(['data' => $this->currentSettings()]);
    }

    private function currentSettings(): array
    {
        $stored = PlatformSetting::pluck('value', 'key');

        $defaults = [
            'app_name' => config('app.name'),
            'support_email' => config('morihome.support_email'),
            'support_whatsapp' => config('morihome.support_whatsapp'),
            'whatsapp_message_template' => config('morihome.whatsapp.message_template'),
        ];

        return collect(self::EDITABLE_KEYS)
            ->mapWithKeys(fn (string $key) => [$key => $stored[$key] ?? $defaults[$key] ?? null])
            ->all();
    }
}
