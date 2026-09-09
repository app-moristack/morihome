<?php

namespace App\Http\Requests;

use App\Enums\ProviderType;
use App\Services\Geocoding\Geocoder;
use App\Services\Search\SearchCriteria;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class SearchProvidersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'address' => ['required_without_all:latitude,longitude,service_category_id', 'nullable', 'string', 'max:255'],
            'latitude' => ['required_with:longitude', 'nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['required_with:latitude', 'nullable', 'numeric', 'between:-180,180'],
            'radius_km' => ['nullable', 'numeric', 'min:1', 'max:'.config('morihome.search.max_radius_km')],
            'service_category_id' => ['nullable', 'integer', Rule::exists('service_categories', 'id')],
            'provider_types' => ['nullable', 'array'],
            'provider_types.*' => [Rule::enum(ProviderType::class)],
            'locality' => ['nullable', 'string', 'max:120'],
            'has_whatsapp' => ['nullable', 'boolean'],
            'verified_only' => ['nullable', 'boolean'],
            'term' => ['nullable', 'string', 'max:120'],
            'sort' => ['nullable', Rule::in([SearchCriteria::SORT_DISTANCE, SearchCriteria::SORT_RECOMMENDED])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:'.config('morihome.search.max_per_page')],
        ];
    }

    public function criteria(Geocoder $geocoder): SearchCriteria
    {
        $validated = array_filter($this->validated(), fn ($value) => $value !== null);

        return SearchCriteria::fromArray($this->resolvedCoordinates($geocoder) + $validated);
    }

    private function resolvedCoordinates(Geocoder $geocoder): array
    {
        if ($this->filled(['latitude', 'longitude']) || ! $this->filled('address')) {
            return [];
        }

        $result = $geocoder->geocode($this->string('address')->value());

        if ($result === null) {
            throw new UnprocessableEntityHttpException(__('search.address_not_found'));
        }

        return [
            'latitude' => $result->coordinates->latitude,
            'longitude' => $result->coordinates->longitude,
        ];
    }
}
