<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class StorePortfolioImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('managePortfolio', $this->user()->provider);
    }

    public function rules(): array
    {
        $uploads = config('morihome.uploads');

        return [
            'image' => [
                'required',
                File::image()
                    ->types($uploads['mime_types'])
                    ->max($uploads['max_kilobytes'])
                    ->dimensions(
                        Rule::dimensions()
                            ->minWidth($uploads['min_dimension'])
                            ->minHeight($uploads['min_dimension'])
                            ->maxWidth($uploads['max_dimension'])
                            ->maxHeight($uploads['max_dimension']),
                    ),
            ],
            'caption' => ['nullable', 'string', 'max:140'],
        ];
    }
}
