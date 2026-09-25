import { enumLabel } from '@/i18n/labels'
import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { SelectField, TextField } from '@/components/ui/Field'
import { bootstrap } from '@/lib/bootstrap'
import { accountStepSchema, type AccountStepValues } from '@/lib/schemas'
import { apiRequest, ApiError } from '@/api/client'

type AccountStepProps = {
  defaultValues: Partial<AccountStepValues>
  onSubmit: (values: AccountStepValues) => void
}

export function AccountStep({ defaultValues, onSubmit }: AccountStepProps) {
  useLocale()
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AccountStepValues>({
    resolver: zodResolver(accountStepSchema),
    defaultValues: { ...defaultValues },
  })
  const selectedProviderType = useWatch({ control, name: 'provider_type' })

  const validateAccount = async (values: AccountStepValues) => {
    try {
      await apiRequest('/register/validate-account', { method: 'POST', body: values })
      onSubmit(values)
    } catch (error) {
      if (error instanceof ApiError && error.isValidationError) {
        const fields = ['provider_type', 'name', 'phone', 'whatsapp_phone', 'email'] as const
        for (const field of fields) {
          const message = error.firstErrorFor(field)
          if (message) setError(field, { type: 'server', message }, { shouldFocus: true })
        }
      } else {
        setError('root', {
          message: error instanceof ApiError ? error.message : t('Something went wrong. Please try again.'),
        })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(validateAccount)} className="flex flex-col gap-4" noValidate>
      <h2 className="text-lg font-bold text-ink-900">{t('Tell us who you are')}</h2>

      <SelectField
        label={t('First, choose your account type')}
        isRequired
        {...(errors.provider_type?.message ? { error: errors.provider_type.message } : {})}
        {...register('provider_type')}
      >
        <option value="">{t('Choose Individual or Agency')}</option>
        {bootstrap.providerTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {enumLabel(type.value)}
          </option>
        ))}
      </SelectField>

      <TextField
        label={selectedProviderType === 'agency' ? t('Agency or company name') : t('Full name')}
        isRequired
        autoComplete="organization"
        placeholder={t('e.g. Ti Marmit Plomberie')}
        {...(errors.name?.message ? { error: errors.name.message } : {})}
        {...register('name')}
      />

      <TextField
        label={t('Mobile number')}
        isRequired
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder={'5765 4321'}
        hint={t('This is how you sign in, and how customers reach you.')}
        {...(errors.phone?.message ? { error: errors.phone.message } : {})}
        {...register('phone')}
      />

      <TextField
        label={t('WhatsApp number')}
        type="tel"
        inputMode="tel"
        placeholder={t('Leave blank to use your mobile number')}
        {...(errors.whatsapp_phone?.message ? { error: errors.whatsapp_phone.message } : {})}
        {...register('whatsapp_phone')}
      />

      <TextField
        label={t('Email address')}
        type="email"
        autoComplete="email"
        placeholder={'you@example.mu'}
        hint={t('Optional, but it lets you reset your password.')}
        {...(errors.email?.message ? { error: errors.email.message } : {})}
        {...register('email')}
      />

      {errors.root?.message && (
        <p role="alert" className="text-sm text-danger">
          {t(errors.root.message)}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        isFullWidth
        isLoading={isSubmitting}
        leadingIcon={<ArrowRight className="size-5" />}
      >
        {t('Continue')}
      </Button>
    </form>
  )
}
