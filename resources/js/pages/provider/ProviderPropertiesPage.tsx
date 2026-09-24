import { planLabel, enumLabel } from '@/i18n/labels'
import { t, getFormatLocale } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { Building2, Camera, CircleAlert, Home, Plus } from 'lucide-react'
import { useState } from 'react'
import { ApiError } from '@/api/client'
import { AddressAutocomplete, type ResolvedLocation } from '@/components/search/AddressAutocomplete'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  useCreatePropertyListing,
  usePropertyListings,
  useUploadPropertyImage,
} from '@/hooks/useProviderQueries'
import { useToast } from '@/hooks/useToast'
import { PROPERTY_AMENITIES } from '@/lib/propertyAmenities'
import type { PropertyListing } from '@/types/api'

type FormState = {
  amenities: string[]
  is_furnished: boolean
  purpose: 'rental' | 'sales'
  property_type: string
  title: string
  description: string
  price_rupees: string
  bedrooms: string
  bathrooms: string
  area_sqm: string
  address: string
  locality: string
  latitude: number | null
  longitude: number | null
}

const INITIAL_FORM: FormState = {
  amenities: [],
  is_furnished: false,
  purpose: 'rental',
  property_type: 'house',
  title: '',
  description: '',
  price_rupees: '',
  bedrooms: '',
  bathrooms: '',
  area_sqm: '',
  address: '',
  locality: '',
  latitude: null,
  longitude: null,
}

function ListingPhotos({ listing }: { listing: PropertyListing }) {
  useLocale()
  const upload = useUploadPropertyImage()
  const { showToast } = useToast()
  const atLimit = listing.images.length >= listing.photo_limit

  return (
    <div className="mt-4 border-t border-ink-100 pt-4">
      <div className="flex items-center justify-between gap-3 text-sm">
        <strong>{t('Photos')}</strong>
        <span className={atLimit ? 'font-bold text-danger' : 'text-ink-500'}>
          {listing.images.length} / {listing.photo_limit}
        </span>
      </div>
      {listing.images.length ? (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {listing.images.map((image) => (
            <img
              key={image.id}
              src={image.url}
              alt={image.caption ?? listing.title}
              className="size-20 shrink-0 rounded-lg object-cover"
            />
          ))}
        </div>
      ) : null}
      <label
        className={`mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${atLimit ? 'cursor-not-allowed border-ink-100 text-ink-400' : 'cursor-pointer border-ink-200 text-ink-800 hover:border-brand-400'}`}
      >
        <Camera className="size-4" aria-hidden />
        {atLimit ? t('Photo limit reached') : upload.isPending ? t('Uploading...') : t('Add photo')}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={atLimit || upload.isPending}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            upload.mutate(
              { slug: listing.slug, file },
              {
                onSuccess: () => showToast('Property photo added.', 'success'),
                onError: (error) =>
                  showToast(error instanceof ApiError ? error.message : 'Could not upload photo.', 'error'),
              },
            )
            event.target.value = ''
          }}
        />
      </label>
    </div>
  )
}

export default function ProviderPropertiesPage() {
  useLocale()
  const { data, isLoading, isError } = usePropertyListings()
  const createListing = useCreatePropertyListing()
  const { showToast } = useToast()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [formError, setFormError] = useState<string>()
  const limits = data?.meta.limits ?? { rental: null, sales: null }
  const selectedLimit = limits?.[form.purpose]
  const canCreate = Boolean(selectedLimit && selectedLimit.remaining > 0)

  const resolveLocation = (location: ResolvedLocation | null) => {
    setForm((current) => ({
      ...current,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      locality: location?.label ?? current.locality,
      address: location?.label ?? current.address,
    }))
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(undefined)

    if (!canCreate) {
      setFormError('You need an active subscription with an available listing slot.')
      return
    }

    if (form.latitude === null || form.longitude === null) {
      setFormError('Choose an address suggestion so the property can be located.')
      return
    }

    createListing.mutate(
      {
        ...form,
        price_rupees: Number(form.price_rupees),
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        area_sqm: form.area_sqm ? Number(form.area_sqm) : null,
      },
      {
        onSuccess: () => {
          setForm(INITIAL_FORM)
          showToast('Property listing published.', 'success')
        },
        onError: (error) => {
          const message = error instanceof ApiError ? error.message : t('Could not create the listing.')
          setFormError(message)
          showToast(message, 'error')
        },
      },
    )
  }

  if (isLoading)
    return (
      <div className="container-page py-10">
        <Skeleton className="h-96 rounded-card" />
      </div>
    )
  if (isError || !data)
    return (
      <div className="container-page py-10">
        <EmptyState
          tone="danger"
          icon={<CircleAlert className="size-6" />}
          title={t('Could not load properties')}
        />
      </div>
    )

  return (
    <div className="container-page flex flex-col gap-7 py-8 sm:py-10">
      <header>
        <p className="text-sm font-bold text-brand-700 uppercase">{t('Property dashboard')}</p>
        <h1 className="mt-1 text-3xl font-extrabold">{t('Manage property listings')}</h1>
        <p className="mt-2 text-ink-500">
          {t('Your active Rental or Sales subscription controls listing and photo limits.')}
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        {(['rental', 'sales'] as const).map((purpose) => {
          const limit = limits[purpose]
          return (
            <div key={purpose} className="card p-4">
              <div className="flex items-center justify-between gap-3">
                <strong>{purpose === 'rental' ? t('Rental listings') : t('Sale listings')}</strong>
                <Badge tone={limit ? 'success' : 'warning'}>
                  {(limit?.plan ? planLabel(limit.plan) : null) ?? t('No active plan')}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-ink-500">
                {limit
                  ? t('{used} used · {remaining} of {limit} remaining · {photos} photos/listing', {
                      used: limit.used,
                      remaining: limit.remaining,
                      limit: limit.listing_limit,
                      photos: limit.photos_per_listing,
                    })
                  : t('Activate a subscription from your dashboard to create listings.')}
              </p>
            </div>
          )
        })}
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-xl font-bold">{t('Create a property listing')}</h2>
        <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
          <SelectField
            label={t('Listing category')}
            isRequired
            value={form.purpose}
            onChange={(event) =>
              setForm((current) => ({ ...current, purpose: event.target.value as FormState['purpose'] }))
            }
          >
            <option value="rental" disabled={!limits.rental || limits.rental.remaining === 0}>
              {t('For rent')}{' '}
              {limits.rental
                ? t('({count} remaining)', { count: limits.rental.remaining })
                : t('(subscription required)')}
            </option>
            <option value="sales" disabled={!limits.sales || limits.sales.remaining === 0}>
              {t('For sale')}{' '}
              {limits.sales
                ? t('({count} remaining)', { count: limits.sales.remaining })
                : t('(subscription required)')}
            </option>
          </SelectField>
          <SelectField
            label={t('Property type')}
            isRequired
            value={form.property_type}
            onChange={(event) => setForm((current) => ({ ...current, property_type: event.target.value }))}
          >
            {['house', 'apartment', 'villa', 'land', 'commercial', 'other'].map((type) => (
              <option key={type} value={type}>
                {enumLabel(type)}
              </option>
            ))}
          </SelectField>
          <TextField
            label={t('Listing title')}
            isRequired
            minLength={5}
            maxLength={160}
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder={t('Modern family home in Moka')}
            wrapperClassName="sm:col-span-2"
          />
          <TextAreaField
            label={t('Description')}
            isRequired
            minLength={20}
            maxLength={5000}
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
          <div className="grid gap-4">
            <TextField
              label={t('Price (Rs)')}
              isRequired
              type="number"
              min="1"
              value={form.price_rupees}
              onChange={(event) => setForm((current) => ({ ...current, price_rupees: event.target.value }))}
            />
            <div className="grid grid-cols-3 gap-2">
              <TextField
                label={t('Bedrooms')}
                type="number"
                min="0"
                value={form.bedrooms}
                onChange={(event) => setForm((current) => ({ ...current, bedrooms: event.target.value }))}
              />
              <TextField
                label={t('Bathrooms')}
                type="number"
                min="0"
                value={form.bathrooms}
                onChange={(event) => setForm((current) => ({ ...current, bathrooms: event.target.value }))}
              />
              <TextField
                label={t('Area m²')}
                type="number"
                min="1"
                value={form.area_sqm}
                onChange={(event) => setForm((current) => ({ ...current, area_sqm: event.target.value }))}
              />
            </div>
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="mb-3 text-sm font-bold">{t('Furnishing & amenities')}</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex min-h-10 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-5 accent-brand-400"
                  checked={form.is_furnished}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, is_furnished: event.target.checked }))
                  }
                />
                {t('Furnished')}
              </label>
              {PROPERTY_AMENITIES.map(({ value, label }) => (
                <label key={value} className="flex min-h-10 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-5 accent-brand-400"
                    checked={form.amenities.includes(value)}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        amenities: event.target.checked
                          ? [...current.amenities, value]
                          : current.amenities.filter((item) => item !== value),
                      }))
                    }
                  />
                  {t(label)}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="sm:col-span-2">
            <AddressAutocomplete
              value={form.address}
              onChange={(address) => setForm((current) => ({ ...current, address }))}
              onResolve={resolveLocation}
            />
          </div>
          <TextField
            label={t('Locality')}
            isRequired
            value={form.locality}
            onChange={(event) => setForm((current) => ({ ...current, locality: event.target.value }))}
          />
          <div className="flex items-end">
            <Button
              type="submit"
              isFullWidth
              disabled={!canCreate || createListing.isPending}
              leadingIcon={<Plus className="size-4" />}
            >
              {createListing.isPending ? t('Publishing...') : t('Publish listing')}
            </Button>
          </div>
          {formError ? (
            <p className="text-sm font-semibold text-danger sm:col-span-2" role="alert">
              {t(formError)}
            </p>
          ) : null}
        </form>
      </section>

      <section>
        <h2 className="text-xl font-bold">{t('Your properties')}</h2>
        {data.data.length ? (
          <ul className="mt-4 grid gap-4 lg:grid-cols-2">
            {data.data.map((listing) => (
              <li key={listing.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-100">
                    <Home className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{listing.title}</h3>
                      <Badge>{enumLabel(listing.status)}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink-500">
                      {listing.purpose === 'rental' ? t('For rent') : t('For sale')} {'· Rs'}{' '}
                      {listing.price_rupees.toLocaleString(getFormatLocale())} · {listing.locality}
                    </p>
                  </div>
                </div>
                <ListingPhotos listing={listing} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<Building2 className="size-6" />}
            title={t('No property listings yet')}
            description={t('Create your first listing when a Rental or Sales subscription is active.')}
          />
        )}
      </section>
    </div>
  )
}
