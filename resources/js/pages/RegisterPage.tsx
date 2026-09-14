import { BadgeCheck, CircleCheck, CreditCard, MessageCircle, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ApiError } from '@/api/client'
import type { RegistrationPayload } from '@/api/endpoints'
import { AccountStep } from '@/components/register/AccountStep'
import { CredentialsStep } from '@/components/register/CredentialsStep'
import { LocationStep } from '@/components/register/LocationStep'
import { ServicesStep } from '@/components/register/ServicesStep'
import { StepIndicator } from '@/components/register/StepIndicator'
import { SubscriptionStep } from '@/components/register/SubscriptionStep'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import type {
  AccountStepValues,
  CredentialsStepValues,
  LocationStepValues,
  ServicesStepValues,
  SubscriptionStepValues,
} from '@/lib/schemas'
import type { ProviderTypeValue } from '@/types/api'
import individualHero from '../../images/Grow your business with MoriHome.png'
import businessHero from '../../images/mauritius-business-contractor-hero.webp'

const STEP_LABELS = ['Your details', 'Location', 'Services', 'Plans', 'Password']

type Draft = Partial<AccountStepValues & LocationStepValues & ServicesStepValues & SubscriptionStepValues>

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const suggestedType = searchParams.get('type')
  const initialProviderType: ProviderTypeValue | undefined =
    suggestedType === 'individual' || suggestedType === 'agency' ? suggestedType : undefined
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>(initialProviderType ? { provider_type: initialProviderType } : {})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string>()
  const { register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const providerType = draft.provider_type
  const isBusiness = providerType === 'agency'

  const goBack = () => setStep((current) => Math.max(0, current - 1))

  const handleAccount = (values: AccountStepValues) => {
    setDraft((current) => ({
      ...current,
      ...values,
      subscription_ids:
        current.provider_type && current.provider_type !== values.provider_type
          ? undefined
          : current.subscription_ids,
    }))
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

  const handleSubscriptions = (values: SubscriptionStepValues) => {
    setDraft((current) => ({ ...current, ...values }))
    setStep(4)
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
      showToast('Your profile and subscriptions have been created.', 'success')
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

  const title = providerType
    ? isBusiness
      ? 'Register Your Agency on MoriHome'
      : 'Join MoriHome as an Individual'
    : 'Create your MoriHome account'
  const subtitle = isBusiness
    ? "Choose the subscriptions your agency needs and grow with Mauritius' trusted home platform."
    : providerType === 'individual'
      ? 'Choose one, two or all three free subscriptions and get discovered across Mauritius.'
      : 'Start by choosing whether you are registering as an Individual or an Agency.'

  const benefits = isBusiness
    ? [
        'One plan per category',
        'Services Plus or Pro',
        'Rental Plus or Pro',
        'Sales Plus or Pro',
        'Six-month subscriptions',
        'No free agency plans',
      ]
    : [
        'Services Free',
        'Rental Free',
        'Sales Free',
        'Choose any combination',
        'One plan per category',
        'No paid plan required',
      ]

  return (
    <div className={`professional-register-page ${isBusiness ? 'business-register' : ''}`}>
      <section className="register-hero" aria-labelledby="register-title">
        <img src={isBusiness ? businessHero : individualHero} alt="Mauritian professional ready to work" />
        <div className="register-hero-wash" aria-hidden />
        <div className="container-page relative">
          <div className="register-hero-copy">
            <p className="pro-eyebrow">One registration page</p>
            <h1 id="register-title">{title}</h1>
            <p>{subtitle}</p>
            <div className="register-promises">
              {isBusiness ? (
                <>
                  <span>
                    <BadgeCheck aria-hidden /> Verification eligible
                  </span>
                  <span>
                    <ShieldCheck aria-hidden /> Flexible plans
                  </span>
                  <span>
                    <MessageCircle aria-hidden /> Direct enquiries
                  </span>
                </>
              ) : providerType === 'individual' ? (
                <>
                  <span>
                    <UserRound aria-hidden /> Free categories
                  </span>
                  <span>
                    <CreditCard aria-hidden /> No credit card
                  </span>
                  <span>
                    <MessageCircle aria-hidden /> Direct enquiries
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page register-content">
        <div className="register-form-column">
          <div className="register-section-heading">
            <p className="pro-eyebrow">
              {isBusiness
                ? 'Agency registration'
                : providerType === 'individual'
                  ? 'Individual registration'
                  : 'Create your account'}
            </p>
            <h2>{isBusiness ? 'Tell customers about your agency' : 'Build your MoriHome profile'}</h2>
            <p>Complete the five short steps below. Your account and selected plans are created together.</p>
          </div>
          <StepIndicator labels={STEP_LABELS} activeIndex={step} />
          <div className="card register-form-card">
            {step === 0 ? <AccountStep defaultValues={draft} onSubmit={handleAccount} /> : null}
            {step === 1 ? (
              <LocationStep defaultValues={draft} onSubmit={handleLocation} onBack={goBack} />
            ) : null}
            {step === 2 ? (
              <ServicesStep defaultValues={draft} onSubmit={handleServices} onBack={goBack} />
            ) : null}
            {step === 3 ? (
              <SubscriptionStep
                defaultValues={draft}
                providerType={providerType as ProviderTypeValue}
                onSubmit={handleSubscriptions}
                onBack={goBack}
              />
            ) : null}
            {step === 4 ? (
              <CredentialsStep
                onSubmit={handleSubmit}
                onBack={goBack}
                isSubmitting={isSubmitting}
                error={submissionError}
              />
            ) : null}
          </div>
          {step === 0 ? (
            <p className="register-login">
              Already registered? <Link to="/login">Sign in</Link>
            </p>
          ) : null}
        </div>

        <aside className="register-benefits-card">
          <span className="pro-plan-icon">
            <CircleCheck aria-hidden />
          </span>
          <h2>{isBusiness ? 'Flexible agency subscriptions' : 'Free plans for individuals'}</h2>
          <p>
            {isBusiness
              ? 'Choose Plus or Pro independently for Services, Rental and Sales.'
              : 'Select one, two or all three free category plans.'}
          </p>
          <ul>
            {benefits.map((benefit) => (
              <li key={benefit}>
                <CircleCheck aria-hidden /> {benefit}
              </li>
            ))}
          </ul>
          <div className="register-review-note">
            <ShieldCheck aria-hidden />
            <p>
              <strong>Profiles are reviewed</strong>Your profile becomes public after our team approves it.
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}
