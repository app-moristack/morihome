import { categoryLabel } from '@/i18n/labels'
import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCategories } from '@/hooks/useSearchQueries'
import { cn } from '@/lib/cn'

type ServiceCategoryPickerProps = {
  selectedIds: number[]
  onChange: (ids: number[]) => void
  max?: number
}

export function ServiceCategoryPicker({ selectedIds, onChange, max = 10 }: ServiceCategoryPickerProps) {
  useLocale()
  const { data: categories = [], isLoading } = useCategories()

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-28 rounded-full" />
        ))}
      </div>
    )
  }

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((entry) => entry !== id))

      return
    }

    if (selectedIds.length < max) {
      onChange([...selectedIds, id])
    }
  }

  return (
    <fieldset>
      <legend className="sr-only">{t('Service categories')}</legend>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedIds.includes(category.id)

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => toggle(category.id)}
              aria-pressed={isSelected}
              className={cn(
                'min-h-11 rounded-pill border px-4 text-sm font-semibold transition-colors',
                isSelected
                  ? 'border-brand-500 bg-brand-400 text-ink-900'
                  : 'border-ink-200 text-ink-700 hover:bg-ink-50',
              )}
            >
              {categoryLabel(category.name)}
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-sm text-ink-500">
        {selectedIds.length} {t('of')} {max} {t('selected. The first stays your main trade.')}
      </p>
    </fieldset>
  )
}
