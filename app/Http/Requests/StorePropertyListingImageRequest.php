<?php

namespace App\Http\Requests;

use App\Models\PropertyListing;
use Illuminate\Foundation\Http\FormRequest;

class StorePropertyListingImageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $listing = $this->route('propertyListing');

        return $listing instanceof PropertyListing
            && $listing->provider->user_id === $this->user()?->id;
    }

    public function rules(): array
    {
        return [
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:8192', 'dimensions:min_width=400,min_height=300'],
            'caption' => ['nullable', 'string', 'max:180'],
        ];
    }
}
