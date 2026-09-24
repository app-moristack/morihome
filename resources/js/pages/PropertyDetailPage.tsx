import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Building2, MapPin, Phone, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { publicApi } from '@/api/endpoints'
import { queryKeys } from '@/api/queryKeys'
import { ApiError } from '@/api/client'
import { PropertyImageCarousel } from '@/components/ui/PropertyImageCarousel'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useLocale } from '@/hooks/useLocale'
import { t, getFormatLocale } from '@/i18n'
import { enumLabel } from '@/i18n/labels'
import { PROPERTY_AMENITIES } from '@/lib/propertyAmenities'
import { buildTelUrl } from '@/lib/whatsapp'

export default function PropertyDetailPage() {
  useLocale()
  const { slug = '' } = useParams()
  const {
    data: listing,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.property(slug),
    queryFn: () => publicApi.property(slug),
    enabled: Boolean(slug),
    retry: (count, failure) => !(failure instanceof ApiError && failure.status === 404) && count < 2,
  })

  useEffect(() => {
    if (listing) document.title = `${listing.title} — MoriHome`
  }, [listing])

  if (isLoading)
    return (
      <div className="container-page space-y-5 py-8">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )

  if (!listing)
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={<Building2 className="size-6" />}
          title={t(
            error instanceof ApiError && error.status === 404
              ? 'This property is not available'
              : 'Could not load properties',
          )}
          action={
            <div className="flex flex-wrap gap-3">
              <Link to="/properties" className="font-semibold underline">
                {t('Back to properties')}
              </Link>
              {!(error instanceof ApiError && error.status === 404) && (
                <Button onClick={() => void refetch()}>{t('Try again')}</Button>
              )}
            </div>
          }
        />
      </div>
    )

  const provider = listing.provider
  const phone = provider ? buildTelUrl(provider.phone) : null
  const whatsapp = provider?.whatsapp_phone?.replace(/\D/g, '')
  const facts = [
    [t('Property type'), enumLabel(listing.property_type)],
    [t('Bedrooms'), listing.bedrooms],
    [t('Bathrooms'), listing.bathrooms],
    [
      t('Area'),
      listing.area_sqm === null ? null : `${listing.area_sqm.toLocaleString(getFormatLocale())} m²`,
    ],
    [
      t('Furnishing'),
      listing.is_furnished === null ? null : t(listing.is_furnished ? 'Furnished' : 'Unfurnished'),
    ],
  ] as const

  return (
    <article className="container-page py-8">
      <Link
        to={`/properties?purpose=${listing.purpose}`}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900"
      >
        <ArrowLeft className="size-4" /> {t('Back to properties')}
      </Link>
      <header className="my-5">
        <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-ink-950">
          {t(listing.purpose === 'rental' ? 'For rent' : 'For sale')}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-ink-900 sm:text-4xl">{listing.title}</h1>
        <p className="mt-3 flex items-center gap-2 text-ink-600">
          <MapPin className="size-4" />
          {listing.locality}
        </p>
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
        <div className="min-w-0 space-y-6">
          <PropertyImageCarousel
            key={listing.id}
            title={listing.title}
            images={listing.images}
            className="h-72 rounded-2xl sm:h-[440px]"
          />
          <section className="card p-5 sm:p-6">
            <h2 className="text-xl font-bold">{t('Property details')}</h2>
            <dl className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3">
              {facts
                .filter(([, value]) => value !== null)
                .map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-sm text-ink-500">{label}</dt>
                    <dd className="mt-1 font-semibold">{value}</dd>
                  </div>
                ))}
            </dl>
          </section>
          <section className="card p-5 sm:p-6">
            <h2 className="text-xl font-bold">{t('Description')}</h2>
            <p className="mt-3 leading-relaxed whitespace-pre-line text-ink-600">{listing.description}</p>
          </section>
          {!!listing.amenities?.length && (
            <section className="card p-5 sm:p-6">
              <h2 className="text-xl font-bold">{t('Amenities')}</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {PROPERTY_AMENITIES.filter((amenity) => listing.amenities?.includes(amenity.value)).map(
                  (amenity) => (
                    <li
                      key={amenity.value}
                      className="rounded-full bg-brand-50 px-3 py-2 text-sm font-medium"
                    >
                      {t(amenity.label)}
                    </li>
                  ),
                )}
              </ul>
            </section>
          )}
          <section className="card p-5 sm:p-6">
            <h2 className="text-xl font-bold">{t('Location')}</h2>
            <p className="mt-3 text-ink-600">{listing.address}</p>
            <p className="text-ink-600">{listing.locality}</p>
          </section>
        </div>
        <aside className="card space-y-6 p-6 lg:sticky lg:top-24">
          <p className="text-3xl font-extrabold">
            Rs {listing.price_rupees.toLocaleString(getFormatLocale())}
            {listing.purpose === 'rental' && (
              <small className="text-sm font-medium text-ink-500"> {t('/ month')}</small>
            )}
          </p>
          {provider && (
            <>
              <div className="border-t border-ink-100 pt-5">
                <h2 className="text-sm font-semibold text-ink-500">{t('Listed by')}</h2>
                <div className="mt-3 flex items-center gap-3">
                  {provider.logo_url ? (
                    <img src={provider.logo_url} alt="" className="size-12 rounded-full object-cover" />
                  ) : (
                    <span className="grid size-12 place-items-center rounded-full bg-brand-100">
                      <UserRound className="size-6" />
                    </span>
                  )}
                  <strong className="text-lg">{provider.name}</strong>
                </div>
                {provider.profile_available !== false ? (
                  <Link
                    to={`/providers/${provider.slug}`}
                    className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold underline underline-offset-4"
                  >
                    {t('View profile and other listings')} <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <p className="mt-3 text-sm text-ink-500">{t('This profile is not available')}</p>
                )}
              </div>
              <div className="grid gap-3">
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(listing.title + ' — ' + window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-400 px-4 font-bold text-ink-950 hover:bg-brand-300"
                  >
                    {t('Contact via WhatsApp')}
                  </a>
                )}
                {phone && (
                  <a
                    href={phone}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink-200 font-semibold"
                  >
                    <Phone className="size-4" />
                    {provider.phone}
                  </a>
                )}
              </div>
            </>
          )}
        </aside>
      </div>
    </article>
  )
}
