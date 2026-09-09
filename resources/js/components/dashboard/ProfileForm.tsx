import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '@/api/client'
import { ServiceCategoryPicker } from './ServiceCategoryPicker'
import { AddressAutocomplete } from '@/components/search/AddressAutocomplete'
import { Button } from '@/components/ui/Button'
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field'
import { useUpdateProfile } from '@/hooks/useProviderQueries'
import { bootstrap } from '@/lib/bootstrap'
import { profileSchema, type ProfileValues } from '@/lib/schemas'
import { useToast } from '@/hooks/useToast'
import type { OwnedProvider } from '@/types/api'

/**
 * Mount this with key={provider.id} so a different provider remounts the form
 * rather than needing an effect to resynchronise every field.
 */
export function ProfileForm({ provider }: { provider: OwnedProvider }) {
  const updateProfile = useUpdateProfile()
  const { showToast } = useToast()

  const [categoryIds, setCategoryIds] = useState(provider.service_categories.map((category) => category.id))
  const [addressInput, setAddressInput] = useState(provider.address)
  const [coordinates, setCoordinates] = useState({
    latitude: provider.latitude,
    longitude: provider.longitude,
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: provider.name,
      provider_type: provider.provider_type,
      description: provider.description ?? '',
      phone: provider.phone,
      whatsapp_phone: provider.whatsapp_phone ?? '',
      email: provider.email ?? '',
      website: provider.website ?? '',
      address: provider.address,
      locality: provider.locality,
      latitude: provider.latitude,
      longitude: provider.longitude,
    },
  })

  const onSubmit = (values: ProfileValues) => {
    updateProfile.mutate(
      {
        ...values,
        email: values.email || null,
        website: values.website || null,
        whatsapp_phone: values.whatsapp_phone || null,
        service_categories: categoryIds,
      },
      {
        onSuccess: (updated) =>
          showToast(
            updated.approval_status === 'pending' && provider.approval_status === 'approved'
              ? 'Saved. Your profile is back in review because you changed key details.'
              : 'Your profile has been saved.',
            'success',
          ),
        onError: (error) =>
          showToast(
            error instanceof ApiError
              ? (Object.values(error.errors)[0]?.[0] ?? error.message)
              : 'We could not save your profile.',
            'error',
          ),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card flex flex-col gap-4 p-5 sm:p-6" noValidate>
      <h2 className="text-lg font-bold text-ink-900">Business details</h2>

      <SelectField
        label="Type of professional"
        isRequired
        {...(errors.provider_type?.message ? { error: errors.provider_type.message } : {})}
        {...register('provider_type')}
      >
        {bootstrap.providerTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </SelectField>

      <TextField
        label="Name or business name"
        isRequired
        {...(errors.name?.message ? { error: errors.name.message } : {})}
        {...register('name')}
      />

      <TextAreaField
        label="About your work"
        maxLength={2000}
        {...(errors.description?.message ? { error: errors.description.message } : {})}
        {...register('description')}
      />

      <h2 className="mt-2 text-lg font-bold text-ink-900">Contact</h2>

      <TextField
        label="Mobile number"
        isRequired
        type="tel"
        {...(errors.phone?.message ? { error: errors.phone.message } : {})}
        {...register('phone')}
      />

      <TextField
        label="WhatsApp number"
        type="tel"
        {...(errors.whatsapp_phone?.message ? { error: errors.whatsapp_phone.message } : {})}
        {...register('whatsapp_phone')}
      />

      <TextField
        label="Email"
        type="email"
        {...(errors.email?.message ? { error: errors.email.message } : {})}
        {...register('email')}
      />

      <TextField
        label="Website"
        type="url"
        placeholder="https://"
        {...(errors.website?.message ? { error: errors.website.message } : {})}
        {...register('website')}
      />

      <h2 className="mt-2 text-lg font-bold text-ink-900">Location</h2>

      <AddressAutocomplete
        label="Search a new address"
        value={addressInput}
        onChange={(value) => {
          setAddressInput(value)
          setValue('address', value, { shouldDirty: true })
        }}
        onResolve={(location) => {
          if (!location) {
            return
          }

          setCoordinates({ latitude: location.latitude, longitude: location.longitude })
          setAddressInput(location.label)
          setValue('latitude', location.latitude, { shouldDirty: true })
          setValue('longitude', location.longitude, { shouldDirty: true })
          setValue('address', location.label, { shouldDirty: true })
          setValue('locality', location.label, { shouldDirty: true })
        }}
      />

      <TextField
        label="Town or village shown publicly"
        isRequired
        {...(errors.locality?.message ? { error: errors.locality.message } : {})}
        {...register('locality')}
      />

      <p className="text-xs text-ink-500">
        Pinned at {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)} — used to measure
        distance only, never shown publicly.
      </p>

      <h2 className="mt-2 text-lg font-bold text-ink-900">Services</h2>
      <ServiceCategoryPicker selectedIds={categoryIds} onChange={setCategoryIds} />

      <Button
        type="submit"
        size="lg"
        isFullWidth
        isLoading={updateProfile.isPending}
        leadingIcon={<Save className="size-5" />}
      >
        Save changes
      </Button>
    </form>
  )
}
