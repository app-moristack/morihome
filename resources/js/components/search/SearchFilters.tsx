import { categoryLabel, enumLabel } from '@/i18n/labels'
import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { Check, MapPin, RotateCcw } from 'lucide-react'
import { AddressAutocomplete, type ResolvedLocation } from './AddressAutocomplete'
import { Button } from '@/components/ui/Button'
import { useCategories } from '@/hooks/useSearchQueries'
import { bootstrap } from '@/lib/bootstrap'
import { cn } from '@/lib/cn'
import { resolveCategoryIcon } from '@/lib/categoryIcons'
import { hasSearchLocation, type SearchFormState } from '@/lib/searchParams'
import type { ProviderTypeValue } from '@/types/api'

type SearchFiltersProps = {
  state: SearchFormState
  onChange: (next: SearchFormState) => void
  onClose?: () => void
}

export function SearchFilters({ state, onChange, onClose }: SearchFiltersProps) {
  useLocale()
  const { data: categories = [] } = useCategories()
  const radiusIndex = Math.max(0, bootstrap.radiusOptionsKm.indexOf(state.radiusKm))

  const toggleProviderType = (type: ProviderTypeValue) => {
    const providerTypes = state.providerTypes.includes(type)
      ? state.providerTypes.filter((entry) => entry !== type)
      : [...state.providerTypes, type]

    onChange({ ...state, providerTypes, page: 1 })
  }

  const clearFilters = () =>
    onChange({
      ...state,
      categoryId: null,
      providerTypes: [],
      verifiedOnly: false,
      hasWhatsapp: false,
      page: 1,
    })

  const resolveLocation = (location: ResolvedLocation | null) => {
    onChange({
      ...state,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      ...(location ? { address: location.label, page: 1 } : {}),
    })
  }

  return (
    <div className="search-filter-card card flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between gap-3 border-b border-ink-100 pb-4">
        <h2 className="text-lg font-extrabold">{t('Filters')}</h2>
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 dark:text-blue-300"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          {t('Clear all')}
        </button>
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-bold">{t('Service category')}</legend>
        <select
          value={state.categoryId ?? ''}
          onChange={(event) =>
            onChange({
              ...state,
              categoryId: event.target.value ? Number(event.target.value) : null,
              page: 1,
            })
          }
          className="min-h-11 w-full rounded-lg border border-ink-200 bg-surface px-3 text-sm"
          aria-label={t('Filter by service category')}
        >
          <option value="">{t('All services')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {categoryLabel(category.name)}
            </option>
          ))}
        </select>
        <div className="mt-2 flex max-h-64 flex-col overflow-y-auto pr-1">
          {categories.map((category) => {
            const Icon = resolveCategoryIcon(category.icon)
            const selected = state.categoryId === category.id
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onChange({ ...state, categoryId: selected ? null : category.id, page: 1 })}
                aria-pressed={selected}
                className={cn(
                  'flex min-h-10 items-center gap-3 rounded-lg px-2 text-left text-xs font-medium transition-colors',
                  selected ? 'bg-brand-100 text-brand-900' : 'hover:bg-ink-50',
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{categoryLabel(category.name)}</span>
                {selected ? <Check className="ml-auto size-4" aria-hidden /> : null}
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-xs font-bold">{t('Location')}</legend>
        <div className="search-filter-location">
          <AddressAutocomplete
            value={state.address}
            onChange={(address) => onChange({ ...state, address, latitude: null, longitude: null })}
            onResolve={resolveLocation}
            label={t('Filter by location')}
          />
        </div>
      </fieldset>

      <fieldset>
        <div className="mb-2 flex items-center justify-between gap-3">
          <legend className="text-xs font-bold">{t('Radius')}</legend>
          <span className="rounded-full bg-ink-50 px-2.5 py-1 text-xs font-bold">
            {state.radiusKm} {'km'}
          </span>
        </div>
        <input
          type="range"
          disabled={!hasSearchLocation(state)}
          min={0}
          max={bootstrap.radiusOptionsKm.length - 1}
          step={1}
          value={radiusIndex}
          onChange={(event) =>
            onChange({
              ...state,
              radiusKm: bootstrap.radiusOptionsKm[Number(event.target.value)] ?? 10,
              page: 1,
            })
          }
          className="w-full accent-brand-400"
          aria-label={t('Search radius')}
        />
        <div className="mt-1 flex justify-between text-[10px] text-ink-500">
          <span>
            {bootstrap.radiusOptionsKm[0]} {'km'}
          </span>
          <span>
            {bootstrap.radiusOptionsKm.at(-1)} {'km'}
          </span>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-xs font-bold">{t('Professional type')}</legend>
        <div className="flex flex-wrap gap-2">
          {bootstrap.providerTypes.map((type) => {
            const selected = state.providerTypes.includes(type.value as ProviderTypeValue)
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => toggleProviderType(type.value as ProviderTypeValue)}
                aria-pressed={selected}
                className={cn(
                  'min-h-9 rounded-full border px-3 text-xs font-semibold',
                  selected ? 'border-ink-900 bg-ink-900 text-white' : 'border-ink-200 hover:bg-ink-50',
                )}
              >
                {enumLabel(type.value)}
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-xs font-bold">{t('Trust & contact')}</legend>
        <label className="flex min-h-10 items-center gap-3 text-xs font-medium">
          <input
            type="checkbox"
            checked={state.verifiedOnly}
            onChange={(event) => onChange({ ...state, verifiedOnly: event.target.checked, page: 1 })}
            className="size-5 rounded accent-brand-500"
          />
          {t('Verified profiles only')}
        </label>
        <label className="flex min-h-10 items-center gap-3 text-xs font-medium">
          <input
            type="checkbox"
            checked={state.hasWhatsapp}
            onChange={(event) => onChange({ ...state, hasWhatsapp: event.target.checked, page: 1 })}
            className="size-5 rounded accent-brand-500"
          />
          {t('Reachable on WhatsApp')}
        </label>
      </fieldset>

      {onClose ? (
        <Button isFullWidth onClick={onClose} leadingIcon={<MapPin className="size-4" />}>
          {t('Show results')}
        </Button>
      ) : null}
    </div>
  )
}
