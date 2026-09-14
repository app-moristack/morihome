<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContactMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'subject' => [
                'required',
                'string',
                Rule::in([
                    'General question',
                    'Professional registration',
                    'Profile or listing support',
                    'Report a concern',
                    'Partnership enquiry',
                ]),
            ],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
        ];
    }
}
