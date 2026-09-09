<?php

namespace App\Http\Requests;

use App\Enums\ModerationAction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ModerateProviderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'reason' => [
                Rule::requiredIf(fn () => $this->moderationAction()->requiresReason()),
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    public function moderationAction(): ModerationAction
    {
        return ModerationAction::from($this->route('action'));
    }
}
