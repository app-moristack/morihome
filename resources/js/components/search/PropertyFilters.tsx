import { t, getFormatLocale } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { useEffect, useRef, useState } from 'react'
import { SelectField, TextField } from '@/components/ui/Field'
import { PROPERTY_AMENITIES } from '@/lib/propertyAmenities'

export function PropertyFilters({
  params,
  onApply,
}: {
  params: URLSearchParams
  onApply: (params: URLSearchParams) => void
}) {
  useLocale()
  const source = params.toString()
  const [sourceKey, setSourceKey] = useState(source)
  const [draft, setDraft] = useState(() => new URLSearchParams(params))
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  if (sourceKey !== source) {
    setSourceKey(source)
    setDraft(new URLSearchParams(params))
  }

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [source],
  )

  const purpose = draft.get('purpose') === 'sales' ? 'sales' : 'rental'
  const propertyType = draft.get('property_type') ?? ''
  const location = draft.get('location') ?? ''
  const minPrice = draft.get('min_price') ?? ''
  const maxPrice = draft.get('max_price') ?? ''
  const bedrooms = draft.get('bedrooms') ?? ''
  const bathrooms = draft.get('bathrooms') ?? ''
  const minArea = draft.get('min_area') ?? ''
  const furnished = draft.get('is_furnished') ?? ''
  const amenities = draft.getAll('amenities[]')
  const error =
    minPrice && maxPrice && Number(minPrice) > Number(maxPrice)
      ? 'Maximum budget must be at least the minimum budget.'
      : ''
  const budgets =
    purpose === 'rental' ? [15000, 30000, 50000, 100000] : [2000000, 5000000, 10000000, 25000000]

  const update = (values: Record<string, string | string[]>, delay = 0) => {
    if (timer.current) clearTimeout(timer.current)
    const next = new URLSearchParams(draft)
    next.set('purpose', purpose)
    next.delete('page')
    Object.entries(values).forEach(([key, value]) => {
      next.delete(key)
      if (Array.isArray(value)) value.forEach((item) => next.append(key, item))
      else if (value !== '') next.set(key, value)
    })
    setDraft(next)
    const min = next.get('min_price')
    const max = next.get('max_price')
    if (min && max && Number(min) > Number(max)) return
    for (const key of ['min_price', 'max_price', 'min_area']) {
      const value = next.get(key)
      if (value && (!Number.isFinite(Number(value)) || Number(value) < 0)) return
    }
    const apply = () => {
      const query = new URLSearchParams(next)
      if (query.has('location')) {
        const value = query.get('location')!.trim()
        if (value) query.set('location', value)
        else query.delete('location')
      }
      onApply(query)
    }
    if (delay) timer.current = setTimeout(apply, delay)
    else apply()
  }
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="search-filter-card card flex flex-col gap-5 p-4 text-ink-900"
    >
      <div className="flex items-center justify-between border-b border-ink-100 pb-3">
        <h2 className="text-lg font-extrabold">{t('Filters')}</h2>
        <button
          type="button"
          className="min-h-10 text-xs font-semibold text-blue-700 hover:underline"
          onClick={() => {
            if (timer.current) clearTimeout(timer.current)
            const next = new URLSearchParams({ purpose })
            setDraft(next)
            onApply(next)
          }}
        >
          {t('Clear all')}
        </button>
      </div>
      <SelectField
        label={t('I am looking for')}
        value={purpose}
        onChange={(event) => {
          update({ purpose: event.target.value, max_price: '', min_price: '' })
        }}
      >
        <option value="rental">{t('For rent')}</option>
        <option value="sales">{t('For sale')}</option>
      </SelectField>
      <SelectField
        label={t('Property type')}
        value={propertyType}
        onChange={(event) => update({ property_type: event.target.value })}
      >
        <option value="">{t('All types')}</option>
        <option value="house">{t('House')}</option>
        <option value="apartment">{t('Apartment')}</option>
        <option value="villa">{t('Villa')}</option>
        <option value="land">{t('Land')}</option>
        <option value="commercial">{t('Commercial')}</option>
        <option value="other">{t('Other')}</option>
      </SelectField>
      <TextField
        label={t('Location')}
        value={location}
        onChange={(event) => update({ location: event.target.value }, 350)}
        placeholder={t('Town, village or address')}
      />
      <TextField
        label={t('Minimum budget (Rs)')}
        type="number"
        min="0"
        step="1"
        value={minPrice}
        onChange={(event) => update({ min_price: event.target.value }, 350)}
      />
      <SelectField
        label={t('Maximum budget')}
        value={maxPrice}
        onChange={(event) => update({ max_price: event.target.value })}
      >
        <option value="">{t('Any budget')}</option>
        {maxPrice && !budgets.includes(Number(maxPrice)) && (
          <option value={maxPrice}>
            {t('Up to Rs')} {Number(maxPrice).toLocaleString(getFormatLocale())}
          </option>
        )}
        {purpose === 'rental' ? (
          <>
            <option value="15000">{t('Up to Rs 15,000')}</option>
            <option value="30000">{t('Up to Rs 30,000')}</option>
            <option value="50000">{t('Up to Rs 50,000')}</option>
            <option value="100000">{t('Up to Rs 100,000')}</option>
          </>
        ) : (
          <>
            <option value="2000000">{t('Up to Rs 2,000,000')}</option>
            <option value="5000000">{t('Up to Rs 5,000,000')}</option>
            <option value="10000000">{t('Up to Rs 10,000,000')}</option>
            <option value="25000000">{t('Up to Rs 25,000,000')}</option>
          </>
        )}
      </SelectField>
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label={t('Bedrooms')}
          className="min-h-[50px] pl-2.5 pr-8 text-sm"
          value={bedrooms}
          onChange={(event) => update({ bedrooms: event.target.value })}
        >
          <option value="">{t('Any')}</option>
          {[1, 2, 3, 4, 5].map((count) => (
            <option key={count} value={count}>
              {count}+
            </option>
          ))}
        </SelectField>
        <SelectField
          label={t('Bathrooms')}
          className="min-h-[50px] pl-2.5 pr-8 text-sm"
          value={bathrooms}
          onChange={(event) => update({ bathrooms: event.target.value })}
        >
          <option value="">{t('Any')}</option>
          {[1, 2, 3, 4, 5].map((count) => (
            <option key={count} value={count}>
              {count}+
            </option>
          ))}
        </SelectField>
      </div>
      <TextField
        label={t('Minimum area (m²)')}
        type="number"
        min="0"
        max="99999999"
        step="any"
        value={minArea}
        onChange={(event) => update({ min_area: event.target.value }, 350)}
      />
      <SelectField
        label={t('Furnishing')}
        value={furnished}
        onChange={(event) => update({ is_furnished: event.target.value })}
      >
        <option value="">{t('Any')}</option>
        <option value="1">{t('Furnished')}</option>
        <option value="0">{t('Unfurnished')}</option>
      </SelectField>
      <fieldset>
        <legend className="mb-2 text-sm font-bold">{t('Amenities')}</legend>
        <p className="mb-2 text-xs text-ink-500">{t('Listings must include all selected amenities.')}</p>
        {PROPERTY_AMENITIES.map(({ value, label }) => (
          <label key={value} className="flex min-h-10 items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="size-5 accent-brand-400"
              checked={amenities.includes(value)}
              onChange={(event) =>
                update({
                  'amenities[]': event.target.checked
                    ? [...amenities, value]
                    : amenities.filter((item) => item !== value),
                })
              }
            />
            {t(label)}
          </label>
        ))}
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {t(error)}
        </p>
      )}
    </form>
  )
}
