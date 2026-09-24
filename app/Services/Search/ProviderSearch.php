<?php

namespace App\Services\Search;

use App\Enums\ApprovalStatus;
use App\Models\Provider;
use App\Support\Coordinates;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ProviderSearch
{
    public function paginate(SearchCriteria $criteria): LengthAwarePaginator
    {
        return $this->query($criteria)
            ->paginate($criteria->perPage)
            ->withQueryString();
    }

    public function query(SearchCriteria $criteria): Builder
    {
        $query = Provider::query()
            ->select('providers.*')
            ->with(['serviceCategories:id,name,slug,icon'])
            ->where('approval_status', ApprovalStatus::Approved->value)
            ->where('is_active', true);

        if ($criteria->coordinates !== null) {
            $this->constrainToBoundingBox($query, $criteria->coordinates, $criteria->radiusKm);
            $this->selectDistance($query, $criteria->coordinates);
            $query->having('distance_km', '<=', $criteria->radiusKm);
        }

        $this->applyFilters($query, $criteria);
        $this->applySort($query, $criteria);

        return $query;
    }

    private function constrainToBoundingBox(Builder $query, Coordinates $coordinates, float $radiusKm): void
    {
        $box = $coordinates->boundingBox($radiusKm);

        $query->whereBetween('latitude', [$box['min_latitude'], $box['max_latitude']])
            ->whereBetween('longitude', [$box['min_longitude'], $box['max_longitude']]);
    }

    private function selectDistance(Builder $query, Coordinates $coordinates): void
    {
        $query->selectRaw(
            '(? * 2 * ASIN(SQRT('
            .'POWER(SIN(RADIANS(? - providers.latitude) / 2), 2)'
            .' + COS(RADIANS(providers.latitude)) * COS(RADIANS(?))'
            .' * POWER(SIN(RADIANS(? - providers.longitude) / 2), 2)'
            .'))) as distance_km',
            [
                Coordinates::EARTH_RADIUS_KM,
                $coordinates->latitude,
                $coordinates->latitude,
                $coordinates->longitude,
            ],
        );
    }

    private function applyFilters(Builder $query, SearchCriteria $criteria): void
    {
        $query->when($criteria->serviceCategoryId, fn (Builder $builder, int $categoryId) => $builder
            ->whereHas('serviceCategories', fn (Builder $categories) => $categories
                ->where('service_categories.id', $categoryId)));

        $query->when($criteria->providerTypes, fn (Builder $builder, array $types) => $builder
            ->whereIn('provider_type', array_column($types, 'value')));

        $query->when($criteria->locality, fn (Builder $builder, string $locality) => $builder
            ->where('locality', $locality));

        $query->when($criteria->requiresWhatsapp, fn (Builder $builder) => $builder
            ->whereNotNull('whatsapp_phone'));

        $query->when($criteria->verifiedOnly, fn (Builder $builder) => $builder
            ->where('is_verified', true));

        $query->when($criteria->term, fn (Builder $builder, string $term) => $builder
            ->where(fn (Builder $group) => $group
                ->where('name', 'like', '%'.$term.'%')
                ->orWhere('description', 'like', '%'.$term.'%')));
    }

    private function applySort(Builder $query, SearchCriteria $criteria): void
    {
        $query->orderByDesc('is_featured');

        if ($criteria->sort === SearchCriteria::SORT_RECOMMENDED) {
            $query->orderByDesc('is_verified');
        }

        if ($criteria->coordinates !== null) {
            $query->orderBy('distance_km');
        }

        $query->orderBy('providers.id');
    }
}
