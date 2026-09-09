<?php

namespace App\Http\Requests;

use App\Enums\ProviderType;
use App\Rules\ValidPhoneNumber;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProviderProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('provider') ?? $this->user()->provider);
    }

    public function rules(): array
    {
        return [
            'provider_type' => ['sometimes', Rule::enum(ProviderType::class)],
            'name' => ['sometimes', 'string', 'min:2', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'phone' => ['sometimes', 'string', 'max:20', new ValidPhoneNumber],
            'whatsapp_phone' => ['nullable', 'string', 'max:20', new ValidPhoneNumber],
            'email' => ['nullable', 'email:rfc', 'max:180'],
            'website' => ['nullable', 'url', 'max:180'],
            'social_links' => ['nullable', 'array'],
            'social_links.*' => ['url', 'max:180'],
            'address' => ['sometimes', 'string', 'max:255'],
            'locality' => ['sometimes', 'string', 'max:120'],
            'latitude' => ['sometimes', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'numeric', 'between:-180,180'],
            'service_areas' => ['nullable', 'array', 'max:20'],
            'service_areas.*' => ['string', 'max:120'],
            'service_categories' => ['sometimes', 'array', 'min:1', 'max:10'],
            'service_categories.*' => ['integer', Rule::exists('service_categories', 'id')->where('is_active', true)],
        ];
    }
}
