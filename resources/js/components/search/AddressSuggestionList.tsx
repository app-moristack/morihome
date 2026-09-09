import { MapPin } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { GeocodeSuggestion } from '@/types/api'

type AddressSuggestionListProps = {
  listboxId: string
  suggestions: GeocodeSuggestion[]
  activeIndex: number
  isFetching: boolean
  onHover: (index: number) => void
  onSelect: (suggestion: GeocodeSuggestion) => void
}

export function AddressSuggestionList({
  listboxId,
  suggestions,
  activeIndex,
  isFetching,
  onHover,
  onSelect,
}: AddressSuggestionListProps) {
  return (
    <ul
      id={listboxId}
      role="listbox"
      aria-label="Address suggestions"
      className="card absolute top-full right-0 left-0 z-30 mt-1.5 max-h-72 overflow-y-auto p-1 shadow-lifted"
    >
      {isFetching && suggestions.length === 0 ? (
        <li className="px-3 py-3 text-sm text-ink-500">Searching…</li>
      ) : null}

      {suggestions.map((suggestion, index) => (
        <li
          key={`${suggestion.label}-${index}`}
          id={`${listboxId}-${index}`}
          role="option"
          aria-selected={index === activeIndex}
        >
          <button
            type="button"
            onMouseEnter={() => onHover(index)}
            onClick={() => onSelect(suggestion)}
            className={cn(
              'flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left',
              index === activeIndex ? 'bg-ink-100' : 'hover:bg-ink-50',
            )}
          >
            <MapPin className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-ink-900">
                {suggestion.locality ?? suggestion.label}
              </span>
              {suggestion.district ? (
                <span className="block truncate text-xs text-ink-500">{suggestion.district}</span>
              ) : null}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
