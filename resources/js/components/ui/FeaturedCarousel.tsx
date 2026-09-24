import { Children, useId, useState, useSyncExternalStore, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'

const breakpoints = ['(min-width: 640px)', '(min-width: 1024px)', '(min-width: 1280px)']

function subscribe(listener: () => void) {
  const queries = breakpoints.map((query) => window.matchMedia(query))
  queries.forEach((query) => query.addEventListener('change', listener))
  return () => queries.forEach((query) => query.removeEventListener('change', listener))
}

function getPageSize() {
  const matches = breakpoints.map((query) => window.matchMedia(query).matches)
  return matches[2] ? 5 : matches[1] ? 3 : matches[0] ? 2 : 1
}

export function FeaturedCarousel({ children, label }: { children: ReactNode; label: string }) {
  useLocale()
  const id = useId()
  const pageSize = useSyncExternalStore(subscribe, getPageSize, () => 1)
  const [firstItem, setFirstItem] = useState(0)
  const items = Children.toArray(children)
  const pageCount = Math.ceil(items.length / pageSize)
  const page = Math.min(Math.floor(firstItem / pageSize), Math.max(0, pageCount - 1))
  const goToPage = (nextPage: number) => setFirstItem(nextPage * pageSize)

  return (
    <div role="group" aria-label={label} aria-roledescription={t('Carousel')}>
      <div id={id} className="home-featured-carousel">
        {items.slice(page * pageSize, (page + 1) * pageSize)}
      </div>
      {pageCount > 1 && (
        <div className="home-carousel-controls">
          <div className="home-carousel-dots" aria-label={t('Choose a page')}>
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                type="button"
                className="home-carousel-dot"
                aria-label={t('Go to page {page}', { page: index + 1 })}
                aria-current={index === page ? 'page' : undefined}
                aria-controls={id}
                onClick={() => goToPage(index)}
              >
                <span />
              </button>
            ))}
          </div>
          <span className="sr-only" role="status">
            {t('Page {page} of {total}', { page: page + 1, total: pageCount })}
          </span>
          <div className="home-carousel-arrows">
            <button
              type="button"
              className="home-carousel-arrow"
              aria-label={t('Previous')}
              aria-controls={id}
              disabled={page === 0}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft size={20} aria-hidden />
            </button>
            <button
              type="button"
              className="home-carousel-arrow"
              aria-label={t('Next')}
              aria-controls={id}
              disabled={page === pageCount - 1}
              onClick={() => goToPage(page + 1)}
            >
              <ChevronRight size={20} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
