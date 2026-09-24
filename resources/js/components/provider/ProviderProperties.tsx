import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { publicApi } from '@/api/endpoints'
import { queryKeys } from '@/api/queryKeys'
import { useLocale } from '@/hooks/useLocale'
import { t, getFormatLocale } from '@/i18n'
import { PropertyImageCarousel } from '@/components/ui/PropertyImageCarousel'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

export function ProviderProperties({ slug }: { slug: string }) {
  useLocale()
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.providerProperties(slug, page),
    queryFn: () => publicApi.providerProperties(slug, page),
  })

  return (
    <section aria-labelledby="provider-properties-title" className="card p-5 sm:p-6">
      <h2 id="provider-properties-title" className="text-lg font-bold">
        {t('Property listings')}
      </h2>
      {isLoading ? (
        <Skeleton className="mt-4 h-64 rounded-xl" />
      ) : isError ? (
        <div className="mt-4">
          <p>{t('Could not load properties')}</p>
          <Button onClick={() => void refetch()}>{t('Try again')}</Button>
        </div>
      ) : !data?.data.length ? (
        <p className="mt-3 text-sm text-ink-500">{t('No properties currently listed.')}</p>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {data.data.map((listing) => (
              <article key={listing.id} className="overflow-hidden rounded-xl border border-ink-100">
                <PropertyImageCarousel images={listing.images} title={listing.title} className="h-44" />
                <div className="space-y-2 p-4">
                  <span className="text-xs font-bold text-ink-500">
                    {t(listing.purpose === 'rental' ? 'For rent' : 'For sale')}
                  </span>
                  <h3 className="font-bold">{listing.title}</h3>
                  <p className="text-sm text-ink-500">{listing.locality}</p>
                  <p className="font-bold">
                    Rs {listing.price_rupees.toLocaleString(getFormatLocale())}
                    {listing.purpose === 'rental' && <small> {t('/ month')}</small>}
                  </p>
                  <Link
                    to={`/properties/${listing.slug}`}
                    className="inline-flex min-h-11 items-center gap-2 font-semibold underline"
                  >
                    {t('View property')}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          {data.meta.last_page > 1 && (
            <div className="mt-5 flex items-center justify-between gap-2">
              <Button variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>
                {t('Previous')}
              </Button>
              <span className="text-sm" role="status">
                {t('Page {page} of {total}', { page, total: data.meta.last_page })}
              </span>
              <Button
                variant="ghost"
                disabled={page >= data.meta.last_page}
                onClick={() => setPage(page + 1)}
              >
                {t('Next')}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
