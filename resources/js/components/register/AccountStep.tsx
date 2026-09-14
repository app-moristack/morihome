import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { SelectField, TextField } from '@/components/ui/Field'
import { bootstrap } from '@/lib/bootstrap'
import { accountStepSchema, type AccountStepValues } from '@/lib/schemas'

type AccountStepProps = {
  defaultValues: Partial<AccountStepValues>
  onSubmit: (values: AccountStepValues) => void
  providerType?: AccountStepValues['provider_type']
}

export function AccountStep({ defaultValues, onSubmit, providerType }: AccountStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountStepValues>({
    resolver: zodResolver(accountStepSchema),
    defaultValues: { provider_type: providerType ?? 'individual', ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <h2 className="text-lg font-bold text-ink-900">Tell us who you are</h2>

      {providerType ? (
        <input type="hidden" value={providerType} {...register('provider_type')} />
      ) : (
        <SelectField
          label="What kind of professional are you?"
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
      )}

      <TextField
        label={providerType === 'individual' ? 'Full name' : 'Agency or company name'}
        isRequired
        autoComplete="organization"
        placeholder="e.g. Ti Marmit Plomberie"
        {...(errors.name?.message ? { error: errors.name.message } : {})}
        {...register('name')}
      />

      <TextField
        label="Mobile number"
        isRequired
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="5765 4321"
        hint="This is how you sign in, and how customers reach you."
        {...(errors.phone?.message ? { error: errors.phone.message } : {})}
        {...register('phone')}
      />

      <TextField
        label="WhatsApp number"
        type="tel"
        inputMode="tel"
        placeholder="Leave blank to use your mobile number"
        {...(errors.whatsapp_phone?.message ? { error: errors.whatsapp_phone.message } : {})}
        {...register('whatsapp_phone')}
      />

      <TextField
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@example.mu"
        hint="Optional, but it lets you reset your password."
        {...(errors.email?.message ? { error: errors.email.message } : {})}
        {...register('email')}
      />

      <Button type="submit" size="lg" isFullWidth leadingIcon={<ArrowRight className="size-5" />}>
        Continue
      </Button>
    </form>
  )
}
