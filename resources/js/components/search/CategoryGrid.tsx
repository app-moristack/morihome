import { Link } from 'react-router'
import { Skeleton } from '@/components/ui/Skeleton'
import { resolveCategoryIcon } from '@/lib/categoryIcons'
import { useCategories } from '@/hooks/useSearchQueries'
import { bootstrap } from '@/lib/bootstrap'

export function CategoryGrid() {
  const { data: categories = [], isLoading, isError } = useCategories(true)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-card" />
        ))}
      </div>
    )
  }

  if (isError || categories.length === 0) {
    return (
      <p className="text-sm text-ink-500">
        Service categories are unavailable right now.{' '}
        <Link to="/search" className="font-semibold text-ink-900 underline underline-offset-2">
          Search all professionals
        </Link>
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => {
        const Icon = resolveCategoryIcon(category.icon)

        return (
          <li key={category.id}>
            <Link
              to={`/search?category_id=${category.id}&radius=${bootstrap.defaultRadiusKm}`}
              className="card group flex h-full flex-col gap-2.5 p-4 transition-all duration-200 ease-[var(--ease-out-soft)] hover:border-brand-300 hover:shadow-lifted"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-brand-100 text-brand-800 transition-colors group-hover:bg-brand-400 group-hover:text-ink-900">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="text-sm font-bold text-ink-900">{category.name}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
