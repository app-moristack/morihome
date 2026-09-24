import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { AddressAutocomplete, type ResolvedLocation } from '@/components/search/AddressAutocomplete'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { locationStepSchema, type LocationStepValues } from '@/lib/schemas'

type LocationStepProps = {
  defaultValues: Partial<LocationStepValues>
  onSubmit: (values: LocationStepValues) => void
  onBack: () => void
}

export function LocationStep({ defaultValues, onSubmit, onBack }: LocationStepProps) {
  useLocale()
  const [address, setAddress] = useState(defaultValues.address ?? '')
  const [locality, setLocality] = useState(defaultValues.locality ?? '')
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(
    defaultValues.latitude !== undefined && defaultValues.longitude !== undefined
      ? { latitude: defaultValues.latitude, longitude: defaultValues.longitude }
      : null,
  )
  const [serviceAreas, setServiceAreas] = useState((defaultValues.service_areas ?? []).join(', '))
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleResolve = (location: ResolvedLocation | null) => {
    setCoordinates(location ? { latitude: location.latitude, longitude: location.longitude } : null)

    if (location) {
      setLocality((current) => current || location.label)
      setErrors((current) => ({ ...current, latitude: '' }))
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const parsed = locationStepSchema.safeParse({
      address: address.trim(),
      locality: locality.trim(),
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
      service_areas: serviceAreas
        .split(',')
        .map((area) => area.trim())
        .filter(Boolean),
    })

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}

      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0])
        fieldErrors[key] ??= issue.message
      }

      setErrors(fieldErrors)

      return
    }

    setErrors({})
    onSubmit(parsed.data)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <h2 className="text-lg font-bold text-ink-900">{t('Where do you work from?')}</h2>
      <p className="-mt-2 text-sm leading-relaxed text-ink-500">
        {t(
          'We use this to measure the distance to customers. Your exact address is never shown publicly — only your town or village.',
        )}
      </p>

      <AddressAutocomplete
        label={t('Search your town, village or address')}
        value={address}
        onChange={setAddress}
        onResolve={handleResolve}
        {...((errors.latitude ?? errors.address) ? { error: errors.latitude || errors.address } : {})}
      />

      <TextField
        label={t('Town or village shown publicly')}
        isRequired
        value={locality}
        onChange={(event) => setLocality(event.target.value)}
        placeholder={t('e.g. Quatre Bornes')}
        {...(errors.locality ? { error: errors.locality } : {})}
      />

      <TextField
        label={t('Other areas you serve')}
        value={serviceAreas}
        onChange={(event) => setServiceAreas(event.target.value)}
        placeholder={'Rose Hill, Vacoas, Curepipe'}
        hint={t('Separate each area with a comma.')}
      />

      {coordinates ? (
        <p className="text-sm font-medium text-success">
          {t('Location pinned. Customers nearby will find you.')}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onBack}
          leadingIcon={<ArrowLeft className="size-5" />}
        >
          {t('Back')}
        </Button>
        <Button type="submit" size="lg" isFullWidth leadingIcon={<ArrowRight className="size-5" />}>
          {t('Continue')}
        </Button>
      </div>
    </form>
  )
}
