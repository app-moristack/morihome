import { Check, Clock3, Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { ApiError } from '@/api/client'
import { PaymentInstructions } from '@/components/subscriptions/PaymentInstructions'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useProviderSubscriptions, useRequestSubscriptions } from '@/hooks/useProviderQueries'
import { useSubscriptions } from '@/hooks/useSearchQueries'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'
import type { ProviderTypeValue, Subscription, SubscriptionCategoryValue } from '@/types/api'

const CATEGORIES: SubscriptionCategoryValue[] = ['services', 'rental', 'sales']

type SubscriptionManagerProps = {
  providerType: ProviderTypeValue
}

export function SubscriptionManager({ providerType }: SubscriptionManagerProps) {
  const { data: memberships = [], isLoading: membershipsLoading } = useProviderSubscriptions()
  const { data: catalog = [], isLoading: catalogLoading } = useSubscriptions()
  const requestSubscriptions = useRequestSubscriptions()
  const { showToast } = useToast()
  const [selected, setSelected] = useState<number[]>([])
  const currentMemberships = memberships.filter(
    (subscription) => subscription.membership?.state !== 'inactive',
  )
  const unavailableCategories = new Set(currentMemberships.map((subscription) => subscription.category))
  const eligiblePlans = catalog.filter(
    (subscription) =>
      !unavailableCategories.has(subscription.category) &&
      (providerType === 'individual' ? subscription.tier === 'free' : subscription.tier !== 'free'),
  )
  const pendingPaidPlans = memberships.filter(
    (subscription) => subscription.membership?.state === 'awaiting_approval' && subscription.price_rupees > 0,
  )

  const toggle = (subscription: Subscription) => {
    setSelected((current) => {
      const withoutCategory = current.filter(
        (id) => catalog.find((plan) => plan.id === id)?.category !== subscription.category,
      )

      return current.includes(subscription.id) ? withoutCategory : [...withoutCategory, subscription.id]
    })
  }

  const submit = () => {
    requestSubscriptions.mutate(selected, {
      onSuccess: () => {
        setSelected([])
        showToast('Your subscriptions are awaiting admin approval.', 'success')
      },
      onError: (error) =>
        showToast(error instanceof ApiError ? error.message : 'Could not request subscriptions.', 'error'),
    })
  }

  return (
    <section id="subscriptions" className="card flex flex-col gap-5 p-5">
      <div>
        <h2 className="text-lg font-bold text-ink-900">Your subscriptions</h2>
        <p className="mt-1 text-sm text-ink-500">
          Track approvals, dates and add another category at any time.
        </p>
      </div>

      {membershipsLoading ? (
        <Skeleton className="h-28 rounded-xl" />
      ) : memberships.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {memberships.map((subscription) => {
            const state = subscription.membership?.state ?? 'awaiting_approval'
            const tone = state === 'active' ? 'success' : state === 'inactive' ? 'neutral' : 'warning'

            return (
              <li
                key={subscription.membership?.id ?? subscription.id}
                className="rounded-xl border border-ink-100 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <strong className="text-ink-900">{subscription.name}</strong>
                    <p className="text-xs text-ink-500">{subscription.category_label}</p>
                  </div>
                  <Badge tone={tone}>{state.replace('_', ' ')}</Badge>
                </div>
                {subscription.membership?.starts_at && subscription.membership.ends_at ? (
                  <p className="mt-3 text-xs text-ink-600">
                    {new Date(subscription.membership.starts_at).toLocaleDateString()} -{' '}
                    {new Date(subscription.membership.ends_at).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-600">
                    <Clock3 className="size-3.5" aria-hidden /> Waiting for admin approval
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm text-ink-500">You have not requested a subscription yet.</p>
      )}

      <PaymentInstructions subscriptions={pendingPaidPlans} isAfterRequest />

      {catalogLoading ? (
        <Skeleton className="h-32 rounded-xl" />
      ) : eligiblePlans.length ? (
        <div className="flex flex-col gap-4 border-t border-ink-100 pt-5">
          <div>
            <h3 className="font-bold text-ink-900">Add a subscription</h3>
            <p className="text-sm text-ink-500">
              Select one plan from any category you do not currently have.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {CATEGORIES.map((category) => {
              const plans = eligiblePlans.filter((subscription) => subscription.category === category)
              if (!plans.length) return null

              return (
                <fieldset key={category} className="grid gap-2">
                  <legend className="mb-2 text-sm font-bold text-ink-800">{plans[0]?.category_label}</legend>
                  {plans.map((subscription) => {
                    const isSelected = selected.includes(subscription.id)
                    return (
                      <button
                        key={subscription.id}
                        type="button"
                        onClick={() => toggle(subscription)}
                        aria-pressed={isSelected}
                        className={cn(
                          'flex items-center justify-between gap-2 rounded-xl border p-3 text-left text-sm',
                          isSelected ? 'border-brand-500 bg-brand-50' : 'border-ink-200',
                        )}
                      >
                        <span>
                          <strong className="block">{subscription.tier_label}</strong>
                          {subscription.price_rupees ? `Rs ${subscription.price_rupees} / 6 months` : 'Free'}
                        </span>
                        {isSelected ? (
                          <Check className="size-5 text-success" aria-hidden />
                        ) : (
                          <Plus className="size-5 text-ink-400" aria-hidden />
                        )}
                      </button>
                    )
                  })}
                </fieldset>
              )
            })}
          </div>
          <PaymentInstructions subscriptions={catalog.filter((plan) => selected.includes(plan.id))} />
          <Button
            onClick={submit}
            disabled={selected.length === 0 || requestSubscriptions.isPending}
            leadingIcon={
              requestSubscriptions.isPending ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )
            }
          >
            Request selected subscriptions
          </Button>
        </div>
      ) : (
        <p className="border-t border-ink-100 pt-4 text-sm text-ink-500">
          All available categories are already active or awaiting approval.
        </p>
      )}
    </section>
  )
}
