import { categoryLabel } from '@/i18n/labels'
import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { AddressAutocomplete, type ResolvedLocation } from './AddressAutocomplete'
import { Button } from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Field'
import { useCategories } from '@/hooks/useSearchQueries'
import { bootstrap } from '@/lib/bootstrap'
import { cn } from '@/lib/cn'
import { hasSearchLocation, type SearchFormState } from '@/lib/searchParams'

type SearchModuleProps = {
  initialState: SearchFormState
  onSearch: (state: SearchFormState) => void
  variant?: 'hero' | 'inline'
  isBusy?: boolean
}

export function SearchModule({
  initialState,
  onSearch,
  variant = 'hero',
  isBusy = false,
}: SearchModuleProps) {
  useLocale()
  const [state, setState] = useState<SearchFormState>(initialState)
  const [addressError, setAddressError] = useState<string>()
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories()

  const handleResolve = (location: ResolvedLocation | null) => {
    setState((current) => ({
      ...current,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      ...(location ? { address: location.label } : {}),
    }))
    setAddressError(undefined)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (!hasSearchLocation(state) && !state.categoryId) {
      setAddressError(t('Choose a service category or enter a location to search.'))

      return
    }

    onSearch({ ...state, page: 1 })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'card grid gap-4 p-4 sm:p-5',
        variant === 'hero'
          ? 'shadow-lifted sm:grid-cols-2 lg:grid-cols-[1.2fr_1.4fr_0.8fr_auto]'
          : 'sm:grid-cols-2 lg:grid-cols-4',
      )}
      role="search"
      aria-label={t('Find professionals near you')}
    >
      <SelectField
        label={t('What do you need?')}
        value={state.categoryId ?? ''}
        disabled={isLoadingCategories}
        onChange={(event) =>
          setState((current) => ({
            ...current,
            categoryId: event.target.value === '' ? null : Number(event.target.value),
          }))
        }
      >
        <option value="">{t('All services')}</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {categoryLabel(category.name)}
          </option>
        ))}
      </SelectField>

      <AddressAutocomplete
        value={state.address}
        onChange={(address) => setState((current) => ({ ...current, address }))}
        onResolve={handleResolve}
        error={addressError}
      />

      <SelectField
        label={t('Search radius')}
        disabled={!hasSearchLocation(state)}
        value={state.radiusKm}
        onChange={(event) => setState((current) => ({ ...current, radiusKm: Number(event.target.value) }))}
      >
        {bootstrap.radiusOptionsKm.map((radius) => (
          <option key={radius} value={radius}>
            {radius}km
          </option>
        ))}
      </SelectField>

      <div className="flex items-end">
        <Button
          type="submit"
          size="lg"
          isFullWidth
          isLoading={isBusy}
          leadingIcon={<Search className="size-5" />}
          className="lg:min-w-36"
        >
          {t('Search')}
        </Button>
      </div>
    </form>
  )
}
