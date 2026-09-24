<?php

namespace App\Http\Requests;

use App\Models\PropertyListing;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePropertyListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->provider !== null;
    }

    public function rules(): array
    {
        return [
            'purpose' => ['required', Rule::in(['rental', 'sales'])],
            'property_type' => ['required', Rule::in(['house', 'apartment', 'villa', 'land', 'commercial', 'other'])],
            'title' => ['required', 'string', 'min:5', 'max:160'],
            'description' => ['required', 'string', 'min:20', 'max:5000'],
            'price_rupees' => ['required', 'integer', 'min:1', 'max:999999999999'],
            'bedrooms' => ['nullable', 'integer', 'min:0', 'max:100'],
            'bathrooms' => ['nullable', 'integer', 'min:0', 'max:100'],
            'area_sqm' => ['nullable', 'numeric', 'min:1', 'max:99999999'],
            'amenities' => ['sometimes', 'array', 'max:8'],
            'amenities.*' => ['string', 'distinct', Rule::in(PropertyListing::AMENITIES)],
            'is_furnished' => ['nullable', 'boolean'],
            'address' => ['required', 'string', 'min:4', 'max:255'],
            'locality' => ['required', 'string', 'min:2', 'max:120'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ];
    }
}
