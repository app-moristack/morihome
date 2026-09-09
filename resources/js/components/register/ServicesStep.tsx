import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { TextAreaField } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCategories } from '@/hooks/useSearchQueries'
import { cn } from '@/lib/cn'
import { servicesStepSchema, type ServicesStepValues } from '@/lib/schemas'

type ServicesStepProps = {
  defaultValues: Partial<ServicesStepValues>
  onSubmit: (values: ServicesStepValues) => void
  onBack: () => void
}

const MAX_SELECTED = 10

export function ServicesStep({ defaultValues, onSubmit, onBack }: ServicesStepProps) {
  const [selected, setSelected] = useState<number[]>(defaultValues.service_categories ?? [])
  const [description, setDescription] = useState(defaultValues.description ?? '')
  const [error, setError] = useState<string>()
  const { data: categories = [], isLoading } = useCategories()

  const toggle = (id: number) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : current.length >= MAX_SELECTED
          ? current
          : [...current, id],
    )
    setError(undefined)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const parsed = servicesStepSchema.safeParse({
      service_categories: selected,
      description: description.trim(),
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message)

      return
    }

    onSubmit(parsed.data)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <h2 className="text-lg font-bold text-ink-900">What do you do?</h2>
      <p className="-mt-2 text-sm text-ink-500">
        Pick every service you offer. The first one you pick becomes your main trade.
      </p>

      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-28 rounded-full" />
          ))}
        </div>
      ) : (
        <fieldset>
          <legend className="sr-only">Service categories</legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isSelected = selected.includes(category.id)

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
                  {category.name}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      {error ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : (
        <p className="text-sm text-ink-500">
          {selected.length} of {MAX_SELECTED} selected
        </p>
      )}

      <TextAreaField
        label="Describe your work"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Years of experience, the kind of jobs you take on, what makes your work stand out…"
        hint="Optional, but profiles with a description get contacted more often."
        maxLength={2000}
      />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onBack}
          leadingIcon={<ArrowLeft className="size-5" />}
        >
          Back
        </Button>
        <Button type="submit" size="lg" isFullWidth leadingIcon={<ArrowRight className="size-5" />}>
          Continue
        </Button>
      </div>
    </form>
  )
}
