<?php

namespace App\Http\Requests;

use App\Support\PhoneNumber;
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'identifier' => ['required', 'string', 'max:180'],
            'password' => ['required', 'string'],
            'remember' => ['boolean'],
        ];
    }

    public function credentials(): array
    {
        $identifier = $this->string('identifier')->trim()->value();
        $phone = PhoneNumber::tryParse($identifier);

        return $phone !== null
            ? ['phone' => $phone->e164, 'password' => $this->input('password')]
            : ['email' => $identifier, 'password' => $this->input('password')];
    }
}
