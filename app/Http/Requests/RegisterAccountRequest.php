<?php

namespace App\Http\Requests;

use App\Enums\ProviderType;
use App\Rules\ValidPhoneNumber;
use App\Support\PhoneNumber;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterAccountRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'provider_type' => ['required', Rule::enum(ProviderType::class)],
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'phone' => ['required', 'string', 'max:20', new ValidPhoneNumber, Rule::unique('users', 'phone')],
            'whatsapp_phone' => ['nullable', 'string', 'max:20', new ValidPhoneNumber],
            'email' => ['nullable', 'email:rfc', 'max:180', Rule::unique('users', 'email')],
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
