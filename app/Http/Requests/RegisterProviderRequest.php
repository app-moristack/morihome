<?php

namespace App\Http\Requests;

use App\Enums\ProviderType;
use App\Rules\ValidPhoneNumber;
use App\Support\PhoneNumber;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterProviderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'provider_type' => ['required', Rule::enum(ProviderType::class)],
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'phone' => ['required', 'string', 'max:20', new ValidPhoneNumber, Rule::unique('users', 'phone')],
            'whatsapp_phone' => ['nullable', 'string', 'max:20', new ValidPhoneNumber],
            'email' => ['nullable', 'email:rfc', 'max:180', Rule::unique('users', 'email')],
            'password' => ['required', 'confirmed', Password::defaults()],
            'description' => ['nullable', 'string', 'max:2000'],
            'website' => ['nullable', 'url', 'max:180'],
            'social_links' => ['nullable', 'array'],
            'social_links.*' => ['url', 'max:180'],
            'address' => ['required', 'string', 'max:255'],
            'locality' => ['required', 'string', 'max:120'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'service_areas' => ['nullable', 'array', 'max:20'],
            'service_areas.*' => ['string', 'max:120'],
            'service_categories' => ['required', 'array', 'min:1', 'max:10'],
            'service_categories.*' => ['integer', Rule::exists('service_categories', 'id')->where('is_active', true)],
            'accepts_terms' => ['accepted'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(array_filter([
            'phone' => PhoneNumber::tryParse($this->input('phone'))?->e164,
            'whatsapp_phone' => PhoneNumber::tryParse($this->input('whatsapp_phone'))?->e164,
        ]));
    }
}
