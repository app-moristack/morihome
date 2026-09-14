import { BadgeCheck, CircleCheck, CreditCard, MessageCircle, ShieldCheck, UserRound } from 'lucide-react'
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
import type { ProviderTypeValue } from '@/types/api'
import individualHero from '../../images/Grow your business with MoriHome.png'
import businessHero from '../../images/mauritius-business-contractor-hero.webp'

const STEP_LABELS = ['Your details', 'Location', 'Services', 'Password']

type Draft = Partial<AccountStepValues & LocationStepValues & ServicesStepValues>

type RegisterPageProps = {
  providerType: ProviderTypeValue
}

export default function RegisterPage({ providerType }: RegisterPageProps) {
  const isBusiness = providerType === 'agency'
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>({ provider_type: providerType })
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

  const title = isBusiness ? 'Register Your Business on MoriHome' : 'Join MoriHome as an Individual'
  const subtitle = isBusiness
    ? "Get more visibility, more clients and grow your business with Mauritius' trusted platform for home services."
    : "It's free, simple and only takes a few minutes. Create your profile and get discovered across Mauritius."

  return (
    <div className={`professional-register-page ${isBusiness ? 'business-register' : ''}`}>
      <section className="register-hero" aria-labelledby="register-title">
        <img src={isBusiness ? businessHero : individualHero} alt="Mauritian professional ready to work" />
        <div className="register-hero-wash" aria-hidden />
        <div className="container-page relative">
          <div className="register-hero-copy">
            <p className="pro-eyebrow">{isBusiness ? 'Business registration' : 'Create your account'}</p>
            <h1 id="register-title">{title}</h1>
            <p>{subtitle}</p>
            <div className="register-promises">
              {isBusiness ? (
                <>
                  <span>
                    <BadgeCheck aria-hidden /> Verified business badge
                  </span>
                  <span>
                    <ShieldCheck aria-hidden /> More visibility
                  </span>
                  <span>
                    <MessageCircle aria-hidden /> Direct enquiries
                  </span>
                </>
              ) : (
                <>
                  <span>
                    <UserRound aria-hidden /> 100% free
                  </span>
                  <span>
                    <CreditCard aria-hidden /> No credit card
                  </span>
                  <span>
                    <MessageCircle aria-hidden /> WhatsApp enquiries
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {isBusiness ? (
        <section className="container-page business-offer">
          <div>
            <strong>MoriHome Business Plan</strong>
            <span>Rs 800 / year</span>
            <small>Join now and enjoy your first 3 months FREE. No commitment.</small>
          </div>
          <b>
            3 MONTHS
            <br />
            FREE
          </b>
        </section>
      ) : null}

      <section className="container-page register-content">
        <div className="register-form-column">
          <div className="register-section-heading">
            <p className="pro-eyebrow">
              {isBusiness ? 'Create your business account' : 'Individual registration'}
            </p>
            <h2>{isBusiness ? 'Tell customers about your business' : 'Create your free account'}</h2>
            <p>
              Complete the four short steps below. Your information is saved when your account is created.
            </p>
          </div>
          <StepIndicator labels={STEP_LABELS} activeIndex={step} />
          <div className="card register-form-card">
            {step === 0 ? (
              <AccountStep defaultValues={draft} onSubmit={handleAccount} providerType={providerType} />
            ) : null}
            {step === 1 ? (
              <LocationStep defaultValues={draft} onSubmit={handleLocation} onBack={goBack} />
            ) : null}
            {step === 2 ? (
              <ServicesStep defaultValues={draft} onSubmit={handleServices} onBack={goBack} />
            ) : null}
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
            <p className="register-login">
              Already registered? <Link to="/login">Sign in</Link>
            </p>
          ) : null}
        </div>

        <aside className="register-benefits-card">
          <span className="pro-plan-icon">
            <CircleCheck aria-hidden />
          </span>
          <h2>{isBusiness ? 'Your business subscription includes' : 'MoriHome is free for individuals'}</h2>
          <p>
            {isBusiness
              ? 'More tools to build trust and reach customers.'
              : 'Create your profile and connect with people in your area.'}
          </p>
          <ul>
            {(isBusiness
              ? [
                  'Featured placement',
                  'Verified Business badge',
                  'Up to 15 photos',
                  'Multiple services',
                  'WhatsApp enquiries',
                  'No automatic renewal',
                ]
              : [
                  'List your services',
                  'Appear in search results',
                  'Direct WhatsApp contact',
                  'Upload up to 5 photos',
                  'No commission',
                  'Always free',
                ]
            ).map((benefit) => (
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
