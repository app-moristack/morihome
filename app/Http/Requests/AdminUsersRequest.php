<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminUsersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'term' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', Rule::in(['individual', 'agency'])],
            'status' => ['nullable', Rule::in(['active', 'pending', 'suspended', 'inactive'])],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', Rule::in([10, 25, 50])],
        ];
    }
}
