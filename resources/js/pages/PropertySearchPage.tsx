import { enumLabel } from '@/i18n/labels'
import { t, getFormatLocale } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import {
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  MapPin,
  MessageCircle,
  SlidersHorizontal,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { publicApi } from '@/api/endpoints'
import { queryKeys } from '@/api/queryKeys'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PropertyFilters } from '@/components/search/PropertyFilters'
import { PropertyImageCarousel } from '@/components/ui/PropertyImageCarousel'
import { Skeleton } from '@/components/ui/Skeleton'
import { SearchHero, type PropertyHeroSearch } from '@/components/search/SearchHero'
import { emptySearchState, writeSearchState } from '@/lib/searchParams'
import villaImage from '../../images/mauritius-luxury-home-about-hero.png'

export default function PropertySearchPage() {
  useLocale()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const params = useMemo(
    () => ({
      purpose: (searchParams.get('purpose') === 'sales' ? 'sales' : 'rental') as 'rental' | 'sales',
      property_type: (searchParams.get('property_type') || undefined) as
        'house' | 'apartment' | 'villa' | 'land' | 'commercial' | 'other' | undefined,
      location: searchParams.get('location') || undefined,
      max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
      min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
      bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
      bathrooms: searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : undefined,
      min_area: searchParams.get('min_area') ? Number(searchParams.get('min_area')) : undefined,
      is_furnished: searchParams.has('is_furnished') ? searchParams.get('is_furnished') === '1' : undefined,
      amenities: searchParams.getAll('amenities[]'),
      page: Number(searchParams.get('page') ?? 1),
    }),
    [searchParams],
  )
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: queryKeys.propertySearch(params),
    queryFn: () => publicApi.searchProperties(params),
  })

  const searchProperties = (search: PropertyHeroSearch) => {
    const next = new URLSearchParams(searchParams)
    next.set('purpose', search.purpose)
    next.delete('page')
    if (search.purpose !== params.purpose) next.delete('min_price')
    for (const [key, value] of [
      ['property_type', search.propertyType],
      ['location', search.location],
      ['max_price', search.maxPrice?.toString() ?? ''],
    ] as const) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setSearchParams(next, { preventScrollReset: true })
  }

  return (
    <div className="min-h-screen bg-canvas">
      <SearchHero
        key={searchParams.toString()}
        initialSearchMode="property"
        showSearchModeTabs={false}
        aside={<></>}
        backgroundShade={
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-linear-to-r from-[#071e30]/85 via-[#071e30]/65 to-[#071e30]/30"
          />
        }
        initialPropertySearch={{
          purpose: params.purpose,
          propertyType: params.property_type ?? '',
          location: params.location ?? '',
          maxPrice: params.max_price ?? null,
        }}
        state={emptySearchState()}
        categories={[]}
        onSearch={(state) => navigate(`/search?${writeSearchState(state).toString()}`)}
        onPropertySearch={searchProperties}
        isBusy={isFetching}
        title="Find a place to rent or buy."
        highlightedTitle=""
        description="Explore local homes, apartments, land and commercial property listed on MoriHome."
        background={
          <img
            src={villaImage}
            alt=""
            fetchPriority="high"
            className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover object-[center_55%]"
          />
        }
      />

      <main className="container-page py-8">
        <Button
          variant="secondary"
          className="mb-4 lg:hidden"
          aria-expanded={filtersOpen}
          aria-controls="property-filters"
          onClick={() => setFiltersOpen(!filtersOpen)}
          leadingIcon={<SlidersHorizontal className="size-4" />}
        >
          {filtersOpen ? t('Hide filters') : t('Show filters')}
        </Button>
        <div className="grid items-start gap-7 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside
            id="property-filters"
            aria-label={t('Property filters')}
            className={filtersOpen ? 'block' : 'hidden lg:block'}
          >
            <PropertyFilters
              params={searchParams}
              onApply={(next) => {
                setSearchParams(next, { preventScrollReset: true, replace: true })
              }}
            />
          </aside>
          <div className="min-w-0">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold">
                  {params.purpose === 'rental' ? t('Properties for rent') : t('Properties for sale')}
                </h2>
                <p className="text-sm text-ink-500">
                  {data?.meta.total ?? 0} {t('listings found')}
                </p>
              </div>
              <Link to="/register" className="text-sm font-bold underline">
                {t('List your property')}
              </Link>
            </div>
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                <Skeleton className="h-80 rounded-card" />
                <Skeleton className="h-80 rounded-card" />
                <Skeleton className="h-80 rounded-card" />
              </div>
            ) : isError ? (
              <EmptyState
                icon={<Building2 className="size-6" />}
                tone="danger"
                title={t('Could not load properties')}
              />
            ) : data?.data.length ? (
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-2">
                {data.data.map((listing) => {
                  const whatsapp = listing.provider?.whatsapp_phone ?? listing.provider?.phone
                  return (
                    <li key={listing.id} className="card overflow-hidden">
                      <PropertyImageCarousel images={listing.images} title={listing.title} />
                      <div className="flex flex-col gap-3 p-5">
                        <div className="flex items-center justify-between gap-2">
                          <Badge tone="brand">
                            {listing.purpose === 'rental' ? t('For rent') : t('For sale')}
                          </Badge>
                          <span className="text-xs text-ink-500">{enumLabel(listing.property_type)}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{listing.title}</h3>
                          <p className="mt-1 text-xl font-extrabold">
                            Rs {listing.price_rupees.toLocaleString(getFormatLocale())}
                            {listing.purpose === 'rental' ? (
                              <small className="text-xs font-medium text-ink-500"> {t('/ month')}</small>
                            ) : null}
                          </p>
                        </div>
                        <p className="flex items-center gap-1 text-sm text-ink-500">
                          <MapPin className="size-4" />
                          {listing.locality}
                        </p>
                        <div className="flex gap-4 text-sm text-ink-600">
                          {listing.bedrooms !== null ? (
                            <span className="flex items-center gap-1">
                              <BedDouble className="size-4" />
                              {listing.bedrooms}
                            </span>
                          ) : null}
                          {listing.bathrooms !== null ? (
                            <span className="flex items-center gap-1">
                              <Bath className="size-4" />
                              {listing.bathrooms}
                            </span>
                          ) : null}
                        </div>
                        <Link
                          to={`/properties/${listing.slug}`}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-brand-400 px-4 text-sm font-bold text-ink-900 hover:bg-brand-50"
                        >
                          {t('View property')} <ArrowRight className="size-4" aria-hidden />
                        </Link>
                        {whatsapp ? (
                          <a
                            href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button isFullWidth leadingIcon={<MessageCircle className="size-4" />}>
                              {t('Contact on WhatsApp')}
                            </Button>
                          </a>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <EmptyState
                icon={<Building2 className="size-6" />}
                title={t('No properties found')}
                description={t('Try another location or check back as new listings are added.')}
              />
            )}
            {data && data.meta.last_page > 1 ? (
              <nav className="mt-7 flex justify-center gap-3">
                <Button
                  variant="secondary"
                  disabled={params.page <= 1}
                  onClick={() =>
                    setSearchParams((current) => {
                      const next = new URLSearchParams(current)
                      next.set('page', String(params.page - 1))
                      return next
                    })
                  }
                >
                  {t('Previous')}
                </Button>
                <span className="self-center text-sm">
                  {t('Page')} {params.page} {t('of')} {data.meta.last_page}
                </span>
                <Button
                  variant="secondary"
                  disabled={params.page >= data.meta.last_page}
                  onClick={() =>
                    setSearchParams((current) => {
                      const next = new URLSearchParams(current)
                      next.set('page', String(params.page + 1))
                      return next
                    })
                  }
                >
                  {t('Next')}
                </Button>
              </nav>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}
