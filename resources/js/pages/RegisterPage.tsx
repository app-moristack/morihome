import { CircleCheck, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ApiError } from '@/api/client'
import type { RegistrationPayload } from '@/api/endpoints'
import { AccountStep } from '@/components/register/AccountStep'
import { CredentialsStep } from '@/components/register/CredentialsStep'
import { LocationStep } from '@/components/register/LocationStep'
import { ServicesStep } from '@/components/register/ServicesStep'
import { StepIndicator } from '@/components/register/StepIndicator'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import type {
  AccountStepValues,
  CredentialsStepValues,
  LocationStepValues,
  ServicesStepValues,
} from '@/lib/schemas'

const STEP_LABELS = ['Your details', 'Location', 'Services', 'Password']

type Draft = Partial<AccountStepValues & LocationStepValues & ServicesStepValues>

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string>()
  const { register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const goBack = () => setStep((current) => Math.max(0, current - 1))

  const handleAccount = (values: AccountStepValues) => {
    setDraft((current) => ({ ...current, ...values }))
    setStep(1)
  }

  const handleLocation = (values: LocationStepValues) => {
    setDraft((current) => ({ ...current, ...values }))
    setStep(2)
  }

  const handleServices = (values: ServicesStepValues) => {
    setDraft((current) => ({ ...current, ...values }))
    setStep(3)
  }

  const handleSubmit = async (values: CredentialsStepValues) => {
    setIsSubmitting(true)
    setSubmissionError(undefined)

    try {
      const payload = {
        ...draft,
        ...values,
        whatsapp_phone: draft.whatsapp_phone || draft.phone,
        email: draft.email || undefined,
      } as RegistrationPayload

      await register(payload)
      showToast('Your profile has been created and is ready to submit for review.', 'success')
      navigate('/dashboard')
    } catch (error) {
      const message =
        error instanceof ApiError
          ? (Object.values(error.errors)[0]?.[0] ?? error.message)
          : 'We could not create your profile. Please try again.'

      setSubmissionError(message)
      showToast(message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container-page max-w-3xl py-8 sm:py-12">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold tracking-widest text-brand-700 uppercase">For professionals</span>
        <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">Join the MoriHome directory</h1>
        <p className="text-sm leading-relaxed text-ink-500">
          Create your profile in four short steps. It takes about three minutes on a phone.
        </p>
      </div>

      <div className="mt-5 flex gap-3 rounded-xl border border-brand-300 bg-brand-50 p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden />
        <p className="text-sm leading-relaxed text-ink-700">
          Your profile will <strong>not appear in public search</strong> until our team reviews and approves
          it. You can keep editing it while it waits.
        </p>
      </div>

      <div className="mt-6">
        <StepIndicator labels={STEP_LABELS} activeIndex={step} />
      </div>

      <div className="card mt-5 p-5 sm:p-6">
        {step === 0 ? <AccountStep defaultValues={draft} onSubmit={handleAccount} /> : null}
        {step === 1 ? <LocationStep defaultValues={draft} onSubmit={handleLocation} onBack={goBack} /> : null}
        {step === 2 ? <ServicesStep defaultValues={draft} onSubmit={handleServices} onBack={goBack} /> : null}
        {step === 3 ? (
          <CredentialsStep
            onSubmit={handleSubmit}
            onBack={goBack}
            isSubmitting={isSubmitting}
            error={submissionError}
          />
        ) : null}
      </div>

      {step === 0 ? (
        <p className="mt-5 text-sm text-ink-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-ink-900 underline underline-offset-2">
            Sign in
          </Link>
        </p>
      ) : null}

      <ul className="mt-8 grid gap-2 text-sm text-ink-500 sm:grid-cols-3">
        {['Free to join', 'Requests via WhatsApp', 'Edit any time'].map((benefit) => (
          <li key={benefit} className="flex items-center gap-2">
            <CircleCheck className="size-4 shrink-0 text-success" aria-hidden />
            {benefit}
          </li>
        ))}
      </ul>
    </div>
  )
}
