import {
  ArrowRight,
  BadgeCheck,
  Grid2X2,
  List,
  Map,
  MapPinOff,
  SearchX,
  SlidersHorizontal,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ProviderCard } from '@/components/provider/ProviderCard'
import { SearchFilters } from '@/components/search/SearchFilters'
import { SearchHero } from '@/components/search/SearchHero'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProviderGridSkeleton, ProviderListSkeleton } from '@/components/ui/Skeleton'
import { useCategories, useLocalities, useProviderSearch } from '@/hooks/useSearchQueries'
import {
  hasSearchLocation,
  readSearchState,
  toApiSearchParams,
  writeSearchState,
  type SearchFormState,
} from '@/lib/searchParams'
import hero from '../../images/le-morne-mauritius-home-services.webp'

const ProviderMap = lazy(() => import('@/components/search/ProviderMap'))

type ResultsView = 'grid' | 'list' | 'map'

const AREA_IMAGE_POSITIONS = ['35%', '45%', '52%', '59%', '67%', '73%', '80%', '88%']

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [areFiltersOpen, setAreFiltersOpen] = useState(false)
  const [resultsView, setResultsView] = useState<ResultsView>('grid')

  const state = useMemo(() => readSearchState(searchParams), [searchParams])
  const apiParams = useMemo(() => toApiSearchParams(state), [state])
  const hasLocation = hasSearchLocation(state)
  const { data, isLoading, isFetching, isError, error, refetch } = useProviderSearch(apiParams)
  const { data: categories = [] } = useCategories(true)
  const { data: localities = [] } = useLocalities()

  useEffect(() => {
    if (!areFiltersOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAreFiltersOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [areFiltersOpen])

  const updateState = (next: SearchFormState) => {
    setSearchParams(writeSearchState(next), { preventScrollReset: true })
  }

  const selectArea = (index: number) => {
    const locality = localities[index]
    if (!locality) return
    updateState({
      ...state,
      address: locality.name,
      latitude: locality.latitude,
      longitude: locality.longitude,
      page: 1,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const results = data?.data ?? []
  const total = data?.meta.total ?? 0
  const lastPage = data?.meta.last_page ?? 1

  return (
    <div className="search-page bg-surface">
      <SearchHero
        state={state}
        onSearch={updateState}
        categories={categories}
        isBusy={isFetching}
        stateKey={searchParams.toString()}
      />

      <div className="container-page grid max-w-none gap-5 py-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start">
        <aside className="sticky top-24 hidden lg:block" aria-label="Search filters">
          <SearchFilters state={state} onChange={updateState} />
        </aside>

        <main className="min-w-0" aria-label="Professional search results">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-100 bg-surface px-4 py-3">
            <p aria-live="polite" className="text-sm">
              {apiParams === null ? (
                <span className="text-ink-600">Choose a category or location to start searching</span>
              ) : isLoading ? (
                <span className="text-ink-600">Searching…</span>
              ) : (
                <>
                  <strong>{total}</strong> {total === 1 ? 'professional' : 'professionals'} found
                </>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAreFiltersOpen(true)}
                leadingIcon={<SlidersHorizontal className="size-4" />}
                aria-expanded={areFiltersOpen}
                aria-controls="mobile-search-filters"
                className="lg:hidden"
              >
                Filters
              </Button>
              <label htmlFor="search-sort" className="text-xs text-ink-500">
                Sort by
              </label>
              <select
                id="search-sort"
                value={hasLocation ? state.sort : 'recommended'}
                onChange={(event) =>
                  updateState({ ...state, sort: event.target.value as SearchFormState['sort'], page: 1 })
                }
                className="min-h-10 rounded-lg border border-ink-200 bg-surface px-3 text-xs font-semibold"
              >
                <option value="recommended">Most relevant</option>
                <option value="distance" disabled={!hasLocation}>
                  Nearest first
                </option>
              </select>
              <div className="flex rounded-lg bg-ink-50 p-1" aria-label="Results view">
                <button
                  type="button"
                  onClick={() => setResultsView('grid')}
                  aria-pressed={resultsView === 'grid'}
                  className={`search-view-button ${resultsView === 'grid' ? 'search-view-button-active' : ''}`}
                >
                  <Grid2X2 className="size-4" aria-hidden /> Grid
                </button>
                <button
                  type="button"
                  onClick={() => setResultsView('list')}
                  aria-pressed={resultsView === 'list'}
                  className={`search-view-button ${resultsView === 'list' ? 'search-view-button-active' : ''}`}
                >
                  <List className="size-4" aria-hidden /> List
                </button>
                <button
                  type="button"
                  onClick={() => setResultsView('map')}
                  aria-pressed={resultsView === 'map'}
                  className={`search-view-button ${resultsView === 'map' ? 'search-view-button-active' : ''}`}
                >
                  <Map className="size-4" aria-hidden /> Map
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            {apiParams === null ? (
              <EmptyState
                icon={<MapPinOff className="size-6" aria-hidden />}
                title="Where should we look?"
                description="Choose a service category to search across Mauritius, or enter a town, village or address to find nearby professionals."
              />
            ) : isLoading ? (
              resultsView === 'grid' ? (
                <ProviderGridSkeleton />
              ) : (
                <ProviderListSkeleton />
              )
            ) : isError ? (
              <EmptyState
                tone="danger"
                icon={<SearchX className="size-6" aria-hidden />}
                title="We could not run that search"
                description={
                  error instanceof Error ? error.message : 'Please check your connection and try again.'
                }
                action={
                  <Button onClick={() => void refetch()} variant="secondary">
                    Try again
                  </Button>
                }
              />
            ) : results.length === 0 ? (
              <EmptyState
                icon={<SearchX className="size-6" aria-hidden />}
                title={
                  hasLocation ? 'No professionals in this radius yet' : 'No professionals match your filters'
                }
                description={
                  hasLocation
                    ? 'Try widening the radius, removing a filter, or searching a nearby town.'
                    : 'Try another service category or remove a filter.'
                }
                action={
                  hasLocation && state.radiusKm < 50 ? (
                    <Button onClick={() => updateState({ ...state, radiusKm: 50, page: 1 })}>
                      Widen to 50 km
                    </Button>
                  ) : null
                }
              />
            ) : (
              <>
                {resultsView === 'map' ? (
                  <Suspense
                    fallback={
                      <div role="status" className="card grid h-96 place-items-center">
                        Loading map…
                      </div>
                    }
                  >
                    <ProviderMap providers={results} />
                  </Suspense>
                ) : (
                  <ul
                    className={
                      resultsView === 'grid'
                        ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'
                        : 'flex flex-col gap-3'
                    }
                  >
                    {results.map((provider) => (
                      <li key={provider.id}>
                        <ProviderCard
                          provider={provider}
                          activeCategoryId={state.categoryId}
                          variant={resultsView}
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {lastPage > 1 ? (
                  <nav
                    className="mt-7 flex items-center justify-center gap-3"
                    aria-label="Search results pages"
                  >
                    <Button
                      variant="ghost"
                      disabled={state.page <= 1}
                      onClick={() => updateState({ ...state, page: state.page - 1 })}
                    >
                      Previous
                    </Button>
                    <span className="text-sm font-medium text-ink-600">
                      Page {state.page} of {lastPage}
                    </span>
                    <Button
                      variant="ghost"
                      disabled={state.page >= lastPage}
                      onClick={() => updateState({ ...state, page: state.page + 1 })}
                    >
                      Next
                    </Button>
                  </nav>
                ) : null}
              </>
            )}
          </div>

          <section
            className="search-pro-cta mt-5 overflow-hidden rounded-xl text-white"
            aria-labelledby="search-pro-title"
          >
            <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center lg:px-8">
              <div>
                <h2 id="search-pro-title" className="text-2xl font-extrabold">
                  Are you a professional?
                </h2>
                <p className="mt-2 max-w-md text-sm text-white/80">
                  Join MoriHome for free and get discovered by people near you.
                </p>
                <Link to="/register" className="home-cta mt-5">
                  Create Your Free Account <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
              <ul className="grid grid-cols-3 gap-5 text-center text-[11px] font-semibold">
                <li>
                  <BadgeCheck className="mx-auto mb-2 size-8 text-brand-300" aria-hidden />
                  Reviewed
                  <br />
                  profile
                </li>
                <li>
                  <Users className="mx-auto mb-2 size-8 text-brand-300" aria-hidden />
                  Reach more
                  <br />
                  clients
                </li>
                <li>
                  <Zap className="mx-auto mb-2 size-8 text-brand-300" aria-hidden />
                  Grow your
                  <br />
                  business
                </li>
              </ul>
            </div>
          </section>

          {localities.length > 0 ? (
            <section className="mt-5" aria-labelledby="areas-title">
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <h2 id="areas-title" className="text-xl font-extrabold">
                    Browse by Area
                  </h2>
                  <p className="text-xs text-ink-500">Find professionals in your area</p>
                </div>
              </div>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
                {localities.slice(0, 8).map((locality, index) => (
                  <li key={locality.id}>
                    <button type="button" onClick={() => selectArea(index)} className="search-area-card">
                      <img
                        src={hero}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{ objectPosition: AREA_IMAGE_POSITIONS[index] }}
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                      <span className="relative mt-auto truncate text-xs font-bold text-white">
                        {locality.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </main>
      </div>

      {areFiltersOpen ? (
        <div
          id="mobile-search-filters"
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Search filters"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/55"
            onClick={() => setAreFiltersOpen(false)}
            aria-label="Close filters"
          />
          <div className="absolute inset-y-0 right-0 w-[min(92vw,360px)] overflow-y-auto bg-canvas p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <strong>Refine results</strong>
              <button
                type="button"
                onClick={() => setAreFiltersOpen(false)}
                className="grid size-11 place-items-center rounded-full hover:bg-ink-100"
                aria-label="Close filters"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <SearchFilters state={state} onChange={updateState} onClose={() => setAreFiltersOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
