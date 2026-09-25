import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { BadgeCheck, CircleCheck, CreditCard, MessageCircle, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ApiError } from '@/api/client'
import type { RegistrationPayload } from '@/api/endpoints'
import { AccountStep } from '@/components/register/AccountStep'
import { CredentialsStep } from '@/components/register/CredentialsStep'
import { LocationStep } from '@/components/register/LocationStep'
import { StepIndicator } from '@/components/register/StepIndicator'
import { SubscriptionStep } from '@/components/register/SubscriptionStep'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import type {
  AccountStepValues,
  CredentialsStepValues,
  LocationStepValues,
  SubscriptionStepValues,
} from '@/lib/schemas'
import type { ProviderTypeValue } from '@/types/api'
import individualHero from '../../images/Grow your business with MoriHome.webp'
import businessHero from '../../images/mauritius-business-contractor-hero.webp'

const STEP_LABELS = ['Your details', 'Location', 'Plans', 'Password']

type Draft = Partial<AccountStepValues & LocationStepValues & SubscriptionStepValues>

export default function RegisterPage() {
  useLocale()
  const [searchParams] = useSearchParams()
  const suggestedType = searchParams.get('type')
  const initialProviderType: ProviderTypeValue | undefined =
    suggestedType === 'individual' || suggestedType === 'agency' ? suggestedType : undefined
  const [step, setStep] = useState(0)
  const suggestedPlan = Number(searchParams.get('plan'))
  const [draft, setDraft] = useState<Draft>(
    initialProviderType
      ? {
          provider_type: initialProviderType,
          ...(Number.isSafeInteger(suggestedPlan) && suggestedPlan > 0
            ? { subscription_ids: [suggestedPlan] }
            : {}),
        }
      : {},
  )
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

  const handleSubscriptions = (values: SubscriptionStepValues) => {
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
      showToast('Your profile and subscriptions have been created.', 'success')
      navigate('/dashboard')
    } catch (error) {
      const message =
        error instanceof ApiError
          ? (Object.values(error.errors)[0]?.[0] ?? error.message)
          : t('We could not create your profile. Please try again.')

      setSubmissionError(message)
      showToast(message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const title = providerType
    ? isBusiness
      ? t('Register Your Agency on MoriHome')
      : t('Join MoriHome as an Individual')
    : t('Create your MoriHome account')
  const subtitle = isBusiness
    ? t("Choose the subscriptions your agency needs and grow with Mauritius' trusted home platform.")
    : providerType === 'individual'
      ? t('Choose one, two or all three free subscriptions and get discovered across Mauritius.')
      : t('Start by choosing whether you are registering as an Individual or an Agency.')

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
        <img
          src={isBusiness ? businessHero : individualHero}
          alt={t('Mauritian professional ready to work')}
        />
        <div className="register-hero-wash" aria-hidden />
        <div className="container-page relative">
          <div className="register-hero-copy">
            <p className="pro-eyebrow">{t('One registration page')}</p>
            <h1 id="register-title">{t(title)}</h1>
            <p>{t(subtitle)}</p>
            <div className="register-promises">
              {isBusiness ? (
                <>
                  <span>
                    <BadgeCheck aria-hidden /> {t('Verification eligible')}
                  </span>
                  <span>
                    <ShieldCheck aria-hidden /> {t('Flexible plans')}
                  </span>
                  <span>
                    <MessageCircle aria-hidden /> {t('Direct enquiries')}
                  </span>
                </>
              ) : providerType === 'individual' ? (
                <>
                  <span>
                    <UserRound aria-hidden /> {t('Free categories')}
                  </span>
                  <span>
                    <CreditCard aria-hidden /> {t('No credit card')}
                  </span>
                  <span>
                    <MessageCircle aria-hidden /> {t('Direct enquiries')}
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
                ? t('Agency registration')
                : providerType === 'individual'
                  ? t('Individual registration')
                  : t('Create your account')}
            </p>
            <h2>{isBusiness ? t('Tell customers about your agency') : t('Build your MoriHome profile')}</h2>
            <p>
              {t(
                'Complete the four short steps below. Your account and selected plans are created together.',
              )}
            </p>
          </div>
          <StepIndicator labels={STEP_LABELS} activeIndex={step} />
          <div className="card register-form-card">
            {step === 0 ? <AccountStep defaultValues={draft} onSubmit={handleAccount} /> : null}
            {step === 1 ? (
              <LocationStep defaultValues={draft} onSubmit={handleLocation} onBack={goBack} />
            ) : null}
            {step === 2 ? (
              <SubscriptionStep
                defaultValues={draft}
                providerType={providerType as ProviderTypeValue}
                onSubmit={handleSubscriptions}
                onBack={goBack}
              />
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
              {t('Already registered?')} <Link to="/login">{t('Sign in')}</Link>
            </p>
          ) : null}
        </div>

        <aside className="register-benefits-card">
          <span className="pro-plan-icon">
            <CircleCheck aria-hidden />
          </span>
          <h2>{isBusiness ? t('Flexible agency subscriptions') : t('Free plans for individuals')}</h2>
          <p>
            {isBusiness
              ? t('Choose Plus or Pro independently for Services, Rental and Sales.')
              : t('Select one, two or all three free category plans.')}
          </p>
          <ul>
            {benefits.map((benefit) => (
              <li key={benefit}>
                <CircleCheck aria-hidden /> {t(benefit)}
              </li>
            ))}
          </ul>
          <div className="register-review-note">
            <ShieldCheck aria-hidden />
            <p>
              <strong>{t('Profiles are reviewed')}</strong>
              {t('Your profile becomes public after our team approves it.')}
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}
