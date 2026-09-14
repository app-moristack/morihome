<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePageViewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'event_id' => ['required', 'uuid'],
            'path' => ['required', 'string', 'max:255', 'regex:~^/(?:search|about|contact|for-professionals|terms|privacy|providers/[a-z0-9]+(?:-[a-z0-9]+)*)?$~D'],
        ];
    }
}
