import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { LoaderCircle, LocateFixed, MapPin } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { AddressSuggestionList } from './AddressSuggestionList'
import { useAddressSuggestions } from '@/hooks/useSearchQueries'
import { useCurrentLocation, type ResolvedLocation } from '@/hooks/useCurrentLocation'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { cn } from '@/lib/cn'
import type { GeocodeSuggestion } from '@/types/api'

const DEBOUNCE_MS = 250

export type { ResolvedLocation }

type AddressAutocompleteProps = {
  value: string
  onChange: (value: string) => void
  onResolve: (location: ResolvedLocation | null) => void
  error?: string
  label?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  onResolve,
  error,
  label = 'Where do you need help?',
}: AddressAutocompleteProps) {
  useLocale()
  const fieldId = useId()
  const listboxId = `${fieldId}-suggestions`
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedTerm = useDebouncedValue(value, DEBOUNCE_MS)
  const { data: suggestions = [], isFetching } = useAddressSuggestions(debouncedTerm)

  const { isLocating, request: requestCurrentLocation } = useCurrentLocation(
    useCallback(
      (location: ResolvedLocation) => {
        onChange(location.label)
        onResolve(location)
        setIsOpen(false)
      },
      [onChange, onResolve],
    ),
  )

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)

    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  const selectSuggestion = (suggestion: GeocodeSuggestion) => {
    onChange(suggestion.locality ?? suggestion.label)
    onResolve({
      label: suggestion.locality ?? suggestion.label,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    })
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1))

      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))

      return
    }

    if (event.key === 'Enter' && isOpen && activeIndex >= 0) {
      const suggestion = suggestions[activeIndex]

      if (suggestion) {
        event.preventDefault()
        selectSuggestion(suggestion)
      }

      return
    }

    if (event.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-semibold text-ink-800">
        {t(label)}
      </label>

      <div className="relative">
        <MapPin
          className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink-400"
          aria-hidden
        />

        <input
          id={fieldId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
          placeholder={t('Town, village or address')}
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            onResolve(null)
            setIsOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full rounded-xl border border-ink-200 bg-surface py-3 pr-12 pl-11 text-base text-ink-900 placeholder:text-ink-400',
            'focus:border-ink-900 focus:ring-2 focus:ring-brand-300 focus:outline-none',
            error && 'border-danger',
          )}
        />

        <button
          type="button"
          onClick={requestCurrentLocation}
          disabled={isLocating}
          title={t('Use my current location')}
          aria-label={t('Use my current location')}
          className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-ink-500 hover:bg-ink-100 hover:text-ink-900 disabled:opacity-50"
        >
          {isLocating ? (
            <LoaderCircle className="size-5 animate-spin" aria-hidden />
          ) : (
            <LocateFixed className="size-5" aria-hidden />
          )}
        </button>
      </div>

      {error ? (
        <p id={`${fieldId}-error`} role="alert" className="text-sm font-medium text-danger">
          {t(error)}
        </p>
      ) : null}

      {isOpen && (suggestions.length > 0 || isFetching) ? (
        <AddressSuggestionList
          listboxId={listboxId}
          suggestions={suggestions}
          activeIndex={activeIndex}
          isFetching={isFetching}
          onHover={setActiveIndex}
          onSelect={selectSuggestion}
        />
      ) : null}
    </div>
  )
}
