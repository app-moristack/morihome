import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CircleAlert } from 'lucide-react'
import { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { FilterDrawer } from '@/components/search/FilterDrawer'
import StaticPage from '@/pages/StaticPage'
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
  useLocale()
  const [legalPage, setLegalPage] = useState<'terms' | 'privacy' | null>(null)
  const closeLegalPage = useCallback(() => setLegalPage(null), [])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialsStepValues>({ resolver: zodResolver(credentialsStepSchema) })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <h2 className="text-lg font-bold text-ink-900">{t('Secure your account')}</h2>

      <TextField
        label={t('Password')}
        isRequired
        type="password"
        autoComplete="new-password"
        hint={t('8–128 characters, with uppercase and lowercase letters and a number.')}
        {...(errors.password?.message ? { error: errors.password.message } : {})}
        {...register('password')}
      />

      <TextField
        label={t('Confirm password')}
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
          {t('I accept the')}{' '}
          <button
            type="button"
            onClick={() => setLegalPage('terms')}
            className="font-semibold text-ink-900 underline underline-offset-2"
          >
            {t('terms of use')}
          </button>{' '}
          {t('and the')}{' '}
          <button
            type="button"
            onClick={() => setLegalPage('privacy')}
            className="font-semibold text-ink-900 underline underline-offset-2"
          >
            {t('privacy policy')}
          </button>
          .
        </span>
      </label>

      {legalPage &&
        createPortal(
          <FilterDrawer
            id="registration-legal"
            variant="modal"
            title={t(legalPage === 'terms' ? 'Terms of use' : 'Privacy policy')}
            closeLabel={t('Close')}
            onClose={closeLegalPage}
          >
            <StaticPage slug={legalPage} embedded />
          </FilterDrawer>,
          document.body,
        )}

      {errors.accepts_terms?.message ? (
        <p role="alert" className="-mt-2 text-sm font-medium text-danger">
          {t(errors.accepts_terms.message)}
        </p>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="flex gap-2.5 rounded-xl border border-danger/30 bg-red-50 p-3.5 text-sm text-danger"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {t(error)}
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
          {t('Back')}
        </Button>
        <Button type="submit" size="lg" isFullWidth isLoading={isSubmitting}>
          {t('Create my profile')}
        </Button>
      </div>
    </form>
  )
}
