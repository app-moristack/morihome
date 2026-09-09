<?php

namespace App\Http\Requests;

use App\Enums\ContactChannel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContactEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'channel' => ['required', Rule::enum(ContactChannel::class)],
            'service_category_id' => ['nullable', 'integer', Rule::exists('service_categories', 'id')],
            'source' => ['nullable', 'string', 'max:30'],
        ];
    }
}
