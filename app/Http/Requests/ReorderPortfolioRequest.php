<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReorderPortfolioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('managePortfolio', $this->user()->provider);
    }

    public function rules(): array
    {
        return [
            'image_ids' => ['required', 'array', 'min:1'],
            'image_ids.*' => ['integer'],
        ];
    }
}
