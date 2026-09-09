<?php

namespace App\Services\Search;

use App\Enums\ProviderType;
use App\Support\Coordinates;

final class SearchCriteria
{
    public const SORT_DISTANCE = 'distance';

    public const SORT_RECOMMENDED = 'recommended';

    /**
     * @param  array<int, ProviderType>  $providerTypes
     */
    public function __construct(
        public readonly ?Coordinates $coordinates,
        public readonly float $radiusKm,
        public readonly ?int $serviceCategoryId = null,
        public readonly array $providerTypes = [],
        public readonly ?string $locality = null,
        public readonly bool $requiresWhatsapp = false,
        public readonly bool $verifiedOnly = false,
        public readonly ?string $term = null,
        public readonly string $sort = self::SORT_RECOMMENDED,
        public readonly int $perPage = 12,
    ) {}

    public static function fromArray(array $input): self
    {
        $search = config('morihome.search');

        return new self(
            coordinates: isset($input['latitude'], $input['longitude'])
                ? new Coordinates((float) $input['latitude'], (float) $input['longitude'])
                : null,
            radiusKm: (float) min($input['radius_km'] ?? $search['default_radius_km'], $search['max_radius_km']),
            serviceCategoryId: isset($input['service_category_id']) ? (int) $input['service_category_id'] : null,
            providerTypes: array_map(
                fn (string $type) => ProviderType::from($type),
                $input['provider_types'] ?? [],
            ),
            locality: $input['locality'] ?? null,
            requiresWhatsapp: (bool) ($input['has_whatsapp'] ?? false),
            verifiedOnly: (bool) ($input['verified_only'] ?? false),
            term: $input['term'] ?? null,
            sort: isset($input['latitude'], $input['longitude'])
                ? ($input['sort'] ?? self::SORT_RECOMMENDED)
                : self::SORT_RECOMMENDED,
            perPage: (int) min($input['per_page'] ?? $search['per_page'], $search['max_per_page']),
        );
    }
}
