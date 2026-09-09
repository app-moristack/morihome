import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CircleAlert } from 'lucide-react'
import { Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { credentialsStepSchema, type CredentialsStepValues } from '@/lib/schemas'

type CredentialsStepProps = {
  onSubmit: (values: CredentialsStepValues) => void
  onBack: () => void
  isSubmitting: boolean
  error?: string
}

export function CredentialsStep({ onSubmit, onBack, isSubmitting, error }: CredentialsStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialsStepValues>({ resolver: zodResolver(credentialsStepSchema) })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <h2 className="text-lg font-bold text-ink-900">Secure your account</h2>

      <TextField
        label="Password"
        isRequired
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters, with an uppercase letter and a number."
        {...(errors.password?.message ? { error: errors.password.message } : {})}
        {...register('password')}
      />

      <TextField
        label="Confirm password"
        isRequired
        type="password"
        autoComplete="new-password"
        {...(errors.password_confirmation?.message ? { error: errors.password_confirmation.message } : {})}
        {...register('password_confirmation')}
      />

      <label className="flex items-start gap-3 text-sm leading-relaxed text-ink-700">
        <input
          type="checkbox"
          className="mt-0.5 size-5 shrink-0 rounded accent-brand-500"
          {...register('accepts_terms')}
        />
        <span>
          I accept the{' '}
          <Link to="/terms" className="font-semibold text-ink-900 underline underline-offset-2">
            terms of use
          </Link>{' '}
          and the{' '}
          <Link to="/privacy" className="font-semibold text-ink-900 underline underline-offset-2">
            privacy policy
          </Link>
          .
        </span>
      </label>

      {errors.accepts_terms?.message ? (
        <p role="alert" className="-mt-2 text-sm font-medium text-danger">
          {errors.accepts_terms.message}
        </p>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="flex gap-2.5 rounded-xl border border-danger/30 bg-red-50 p-3.5 text-sm text-danger"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </div>
      ) : null}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onBack}
          disabled={isSubmitting}
          leadingIcon={<ArrowLeft className="size-5" />}
        >
          Back
        </Button>
        <Button type="submit" size="lg" isFullWidth isLoading={isSubmitting}>
          Create my profile
        </Button>
      </div>
    </form>
  )
}
