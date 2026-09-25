import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
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
  Zap,
} from 'lucide-react'
import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ProviderCard } from '@/components/provider/ProviderCard'
import { FilterDrawer } from '@/components/search/FilterDrawer'
import { SearchFilters } from '@/components/search/SearchFilters'
import { SearchHero } from '@/components/search/SearchHero'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProviderGridSkeleton, ProviderListSkeleton } from '@/components/ui/Skeleton'
import { useCategories, useProviderSearch } from '@/hooks/useSearchQueries'
import {
  hasSearchLocation,
  readSearchState,
  toApiSearchParams,
  writeSearchState,
  type SearchFormState,
} from '@/lib/searchParams'

const ProviderMap = lazy(() => import('@/components/search/ProviderMap'))

type ResultsView = 'grid' | 'list' | 'map'

export function SearchPage() {
  useLocale()
  const [searchParams, setSearchParams] = useSearchParams()
  const [areFiltersOpen, setAreFiltersOpen] = useState(false)
  const [resultsView, setResultsView] = useState<ResultsView>('grid')

  const state = useMemo(() => readSearchState(searchParams), [searchParams])
  const apiParams = useMemo(() => toApiSearchParams(state), [state])
  const hasLocation = hasSearchLocation(state)
  const { data, isLoading, isFetching, isError, error, refetch } = useProviderSearch(apiParams)
  const { data: categories = [] } = useCategories(true)

  const closeFilters = useCallback(() => setAreFiltersOpen(false), [])

  const updateState = (next: SearchFormState) => {
    setSearchParams(writeSearchState(next), { preventScrollReset: true })
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

      <div className="container-page grid max-w-none gap-5 py-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
        <aside className="sticky top-24 hidden lg:block" aria-label={t('Search filters')}>
          {!areFiltersOpen && <SearchFilters state={state} onChange={updateState} />}
        </aside>

        <main className="min-w-0" aria-label={t('Professional search results')}>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-100 bg-surface px-4 py-3">
            <p aria-live="polite" className="text-sm">
              {apiParams === null ? (
                <span className="text-ink-600">{t('Choose a category or location to start searching')}</span>
              ) : isLoading ? (
                <span className="text-ink-600">{t('Searching…')}</span>
              ) : (
                <>
                  <strong>
                    {t(total === 1 ? '{count} professional found' : '{count} professionals found', {
                      count: total,
                    })}
                  </strong>
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
                {t('Filters')}
              </Button>
              <label htmlFor="search-sort" className="text-xs text-ink-500">
                {t('Sort by')}
              </label>
              <select
                id="search-sort"
                value={hasLocation ? state.sort : 'recommended'}
                onChange={(event) =>
                  updateState({ ...state, sort: event.target.value as SearchFormState['sort'], page: 1 })
                }
                className="min-h-10 rounded-lg border border-ink-200 bg-surface px-3 text-xs font-semibold"
              >
                <option value="recommended">{t('Most relevant')}</option>
                <option value="distance" disabled={!hasLocation}>
                  {t('Nearest first')}
                </option>
              </select>
              <div className="flex rounded-lg bg-ink-50 p-1" aria-label={t('Results view')}>
                <button
                  type="button"
                  onClick={() => setResultsView('grid')}
                  aria-pressed={resultsView === 'grid'}
                  className={`search-view-button ${resultsView === 'grid' ? 'search-view-button-active' : ''}`}
                >
                  <Grid2X2 className="size-4" aria-hidden /> {t('Grid')}
                </button>
                <button
                  type="button"
                  onClick={() => setResultsView('list')}
                  aria-pressed={resultsView === 'list'}
                  className={`search-view-button ${resultsView === 'list' ? 'search-view-button-active' : ''}`}
                >
                  <List className="size-4" aria-hidden /> {t('List')}
                </button>
                <button
                  type="button"
                  onClick={() => setResultsView('map')}
                  aria-pressed={resultsView === 'map'}
                  className={`search-view-button ${resultsView === 'map' ? 'search-view-button-active' : ''}`}
                >
                  <Map className="size-4" aria-hidden /> {t('Map')}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            {apiParams === null ? (
              <EmptyState
                icon={<MapPinOff className="size-6" aria-hidden />}
                title={t('Where should we look?')}
                description={t(
                  'Choose a service category to search across Mauritius, or enter a town, village or address to find nearby professionals.',
                )}
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
                title={t('We could not run that search')}
                description={
                  error instanceof Error ? error.message : t('Please check your connection and try again.')
                }
                action={
                  <Button onClick={() => void refetch()} variant="secondary">
                    {t('Try again')}
                  </Button>
                }
              />
            ) : results.length === 0 ? (
              <EmptyState
                icon={<SearchX className="size-6" aria-hidden />}
                title={
                  hasLocation
                    ? t('No professionals in this radius yet')
                    : t('No professionals match your filters')
                }
                description={
                  hasLocation
                    ? t('Try widening the radius, removing a filter, or searching a nearby town.')
                    : t('Try another service category or remove a filter.')
                }
                action={
                  hasLocation && state.radiusKm < 50 ? (
                    <Button onClick={() => updateState({ ...state, radiusKm: 50, page: 1 })}>
                      {t('Widen to 50 km')}
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
                        {t('Loading map…')}
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
                    aria-label={t('Search results pages')}
                  >
                    <Button
                      variant="ghost"
                      disabled={state.page <= 1}
                      onClick={() => updateState({ ...state, page: state.page - 1 })}
                    >
                      {t('Previous')}
                    </Button>
                    <span className="text-sm font-medium text-ink-600">
                      {t('Page')} {state.page} {t('of')} {lastPage}
                    </span>
                    <Button
                      variant="ghost"
                      disabled={state.page >= lastPage}
                      onClick={() => updateState({ ...state, page: state.page + 1 })}
                    >
                      {t('Next')}
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
                  {t('Are you a professional?')}
                </h2>
                <p className="mt-2 max-w-md text-sm text-white/80">
                  {t('Join MoriHome for free and get discovered by people near you.')}
                </p>
                <Link to="/register" className="home-cta mt-5">
                  {t('Create Your Free Account')} <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
              <ul className="grid grid-cols-3 gap-5 text-center text-[11px] font-semibold">
                <li>
                  <BadgeCheck className="mx-auto mb-2 size-8 text-brand-300" aria-hidden />
                  {t('Reviewed')}
                  <br />
                  {t('profile')}
                </li>
                <li>
                  <Users className="mx-auto mb-2 size-8 text-brand-300" aria-hidden />
                  {t('Reach more')}
                  <br />
                  {t('clients')}
                </li>
                <li>
                  <Zap className="mx-auto mb-2 size-8 text-brand-300" aria-hidden />
                  {t('Grow your')}
                  <br />
                  {t('business')}
                </li>
              </ul>
            </div>
          </section>
        </main>
      </div>

      {areFiltersOpen ? (
        <FilterDrawer id="mobile-search-filters" title={t('Search filters')} onClose={closeFilters}>
          <SearchFilters state={state} onChange={updateState} onClose={closeFilters} />
        </FilterDrawer>
      ) : null}
    </div>
  )
}
