import { planFeatures } from '@/lib/planFeatures'
import { planLabel } from '@/i18n/labels'
import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { ArrowLeft, ArrowRight, BadgeCheck, Check, House, KeyRound, Search, Star, Wrench } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { PaymentInstructions } from '@/components/subscriptions/PaymentInstructions'
import { useSubscriptions } from '@/hooks/useSearchQueries'
import { subscriptionStepSchema, type SubscriptionStepValues } from '@/lib/schemas'
import { cn } from '@/lib/cn'
import type { ProviderTypeValue, Subscription, SubscriptionCategoryValue } from '@/types/api'

type SubscriptionStepProps = {
  providerType: ProviderTypeValue
  defaultValues: Partial<SubscriptionStepValues>
  onSubmit: (values: SubscriptionStepValues) => void
  onBack: () => void
}

const CATEGORY_ICONS = {
  services: Wrench,
  rental: KeyRound,
  sales: House,
} satisfies Record<SubscriptionCategoryValue, typeof Wrench>

const CATEGORY_ORDER: SubscriptionCategoryValue[] = ['services', 'rental', 'sales']

export function SubscriptionStep({ providerType, defaultValues, onSubmit, onBack }: SubscriptionStepProps) {
  useLocale()
  const [selected, setSelected] = useState<number[]>(defaultValues.subscription_ids ?? [])
  const [error, setError] = useState<string>()
  const { data: subscriptions = [], isLoading } = useSubscriptions()
  const eligiblePlans = subscriptions.filter((subscription) =>
    providerType === 'individual' ? subscription.tier === 'free' : subscription.tier !== 'free',
  )
  const selectedPlans = subscriptions.filter((subscription) => selected.includes(subscription.id))

  const selectPlan = (subscription: Subscription) => {
    setSelected((current) => {
      const withoutCategory = current.filter(
        (id) => subscriptions.find((plan) => plan.id === id)?.category !== subscription.category,
      )

      return current.includes(subscription.id) ? withoutCategory : [...withoutCategory, subscription.id]
    })
    setError(undefined)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const parsed = subscriptionStepSchema.safeParse({ subscription_ids: selected })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message)
      return
    }

    onSubmit(parsed.data)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-ink-900">{t('Choose your subscriptions')}</h2>
        <p className="text-sm text-ink-500">
          {providerType === 'individual'
            ? t('Free plans are reserved for individuals. Choose the categories you need.')
            : t('Choose Plus or Pro in up to three categories—one plan per category.')}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {CATEGORY_ORDER.map((category) => (
            <Skeleton key={category} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5">
          {CATEGORY_ORDER.map((category) => {
            const plans = eligiblePlans.filter((subscription) => subscription.category === category)
            const Icon = CATEGORY_ICONS[category]

            return (
              <fieldset key={category} className="flex flex-col gap-3">
                <legend className="flex items-center gap-2 text-base font-bold text-ink-900">
                  <Icon className="size-5 text-brand-600" aria-hidden />
                  {plans[0]?.category_label}
                  <span className="text-xs font-medium text-ink-400">{t('Optional')}</span>
                </legend>
                <div className={cn('grid gap-3', plans.length > 1 && 'sm:grid-cols-2')}>
                  {plans.map((subscription) => {
                    const isSelected = selected.includes(subscription.id)

                    return (
                      <button
                        key={subscription.id}
                        type="button"
                        onClick={() => selectPlan(subscription)}
                        aria-pressed={isSelected}
                        className={cn(
                          'flex min-h-44 flex-col gap-3 rounded-xl border p-4 text-left transition-all',
                          isSelected
                            ? 'border-brand-500 bg-brand-50 shadow-card ring-2 ring-brand-200'
                            : 'border-ink-200 bg-surface hover:border-brand-400',
                        )}
                      >
                        <span className="flex w-full items-start justify-between gap-3">
                          <span>
                            <strong className="block text-base text-ink-900">
                              {planLabel(subscription.name)}
                            </strong>
                            <small className="text-ink-500">{planLabel(subscription.description)}</small>
                          </span>
                          <span
                            className={cn(
                              'grid size-6 shrink-0 place-items-center rounded-full border',
                              isSelected ? 'border-brand-500 bg-brand-400' : 'border-ink-300',
                            )}
                          >
                            {isSelected ? <Check className="size-4" aria-hidden /> : null}
                          </span>
                        </span>
                        <strong className="text-xl text-ink-900">
                          {subscription.price_rupees === 0 ? t('Free') : `Rs ${subscription.price_rupees}`}
                          {subscription.duration_months ? (
                            <small className="ml-1 text-xs font-medium text-ink-500">
                              / {subscription.duration_months} {t('months')}
                            </small>
                          ) : null}
                        </strong>
                        <ul className="grid gap-1 text-xs text-ink-600">
                          {planFeatures(subscription).map((feature) => (
                            <li key={feature} className="flex items-center gap-2">
                              {feature === t('Priority in search') ? (
                                <Search className="size-3.5" aria-hidden />
                              ) : feature.startsWith(t('Featured')) ? (
                                <Star className="size-3.5" aria-hidden />
                              ) : feature === t('Business verification eligible') ? (
                                <BadgeCheck className="size-3.5" aria-hidden />
                              ) : (
                                <Check className="size-3.5 text-success" aria-hidden />
                              )}
                              {t(feature)}
                            </li>
                          ))}
                        </ul>
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            )
          })}
        </div>
      )}

      {error ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {t(error)}
        </p>
      ) : (
        <p className="text-sm text-ink-500">
          {t(selected.length === 1 ? t('{count} category selected') : t('{count} categories selected'), {
            count: selected.length,
          })}
        </p>
      )}

      <PaymentInstructions subscriptions={selectedPlans} />

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
