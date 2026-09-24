import { planLabel, enumLabel } from '@/i18n/labels'
import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { adminApi } from '@/api/endpoints'
import { queryKeys } from '@/api/queryKeys'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/hooks/useToast'
import type { SubscriptionMembership } from '@/types/api'

const STATES = ['awaiting_approval', 'active', 'inactive'] as const

function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function ActivationForm({ membership }: { membership: SubscriptionMembership }) {
  useLocale()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const initialStart = membership.starts_at?.slice(0, 10) ?? toDateInput(new Date())
  const defaultEnd = new Date(`${initialStart}T12:00:00`)
  defaultEnd.setMonth(defaultEnd.getMonth() + (membership.subscription.duration_months ?? 6))
  const [startsAt, setStartsAt] = useState(initialStart)
  const [endsAt, setEndsAt] = useState(membership.ends_at?.slice(0, 10) ?? toDateInput(defaultEnd))
  const activation = useMutation({
    mutationFn: () => adminApi.activateSubscription(membership.id, startsAt, endsAt),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
      showToast('Subscription activated.', 'success')
    },
    onError: () => showToast('Could not activate this subscription.', 'error'),
  })

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="grid gap-1 text-[10px] font-bold text-ink-500 uppercase">
        {t('Start date')}
        <input
          className="rounded-md border border-ink-200 bg-white px-2 py-1.5 text-xs text-ink-900"
          type="date"
          value={startsAt}
          onChange={(event) => setStartsAt(event.target.value)}
        />
      </label>
      <label className="grid gap-1 text-[10px] font-bold text-ink-500 uppercase">
        {t('End date')}
        <input
          className="rounded-md border border-ink-200 bg-white px-2 py-1.5 text-xs text-ink-900"
          type="date"
          min={startsAt}
          value={endsAt}
          onChange={(event) => setEndsAt(event.target.value)}
        />
      </label>
      <Button
        size="sm"
        onClick={() => activation.mutate()}
        disabled={!startsAt || !endsAt || activation.isPending}
        leadingIcon={<CalendarCheck className="size-4" />}
      >
        {membership.state === 'awaiting_approval' ? t('Activate') : t('Update dates')}
      </Button>
    </div>
  )
}

export default function AdminSubscriptionsPage() {
  useLocale()
  const [searchParams, setSearchParams] = useSearchParams()
  const state = searchParams.get('state') ?? 'awaiting_approval'
  const page = Number(searchParams.get('page') ?? 1)
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.adminSubscriptions(state, page),
    queryFn: () => adminApi.subscriptions({ state, page }),
  })

  return (
    <div className="flex flex-col gap-5">
      <header className="admin-heading">
        <div>
          <h1>{t('Subscriptions')}</h1>
          <p>{t('Verify payments, activate requests and manage subscription dates.')}</p>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label={t('Subscription status')}>
        {STATES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSearchParams({ state: option })}
            className={`rounded-full px-4 py-2 text-xs font-bold ${state === option ? 'bg-ink-900 text-white' : 'border border-ink-200 bg-white text-ink-600'}`}
          >
            {enumLabel(option)}
          </button>
        ))}
      </nav>

      {isLoading ? (
        <Skeleton className="h-80 rounded-xl" />
      ) : isError ? (
        <p className="rounded-xl bg-red-50 p-4 text-danger">{t('Could not load subscriptions.')}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ink-100 bg-white">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="border-b border-ink-100 bg-ink-50 text-ink-500 uppercase">
              <tr>
                <th className="p-4">{t('Customer')}</th>
                <th className="p-4">{t('Plan')}</th>
                <th className="p-4">{t('Amount')}</th>
                <th className="p-4">{t('Status')}</th>
                <th className="p-4">{t('Activation')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {data?.data.map((membership) => (
                <tr key={membership.id}>
                  <td className="p-4">
                    <strong className="block text-sm text-ink-900">{membership.user.name}</strong>
                    <span className="text-ink-500">{membership.user.phone}</span>
                    <small className="block text-ink-400">{enumLabel(membership.user.provider_type)}</small>
                  </td>
                  <td className="p-4">
                    <strong className="block text-ink-900">{planLabel(membership.subscription.name)}</strong>
                    <span className="text-ink-500">
                      {t('Requested')} {new Date(membership.requested_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-ink-900">
                    {membership.subscription.price_rupees
                      ? `Rs ${membership.subscription.price_rupees}`
                      : t('Free')}
                  </td>
                  <td className="p-4">
                    <Badge
                      tone={
                        membership.state === 'active'
                          ? 'success'
                          : membership.state === 'inactive'
                            ? 'neutral'
                            : 'warning'
                      }
                    >
                      {enumLabel(membership.state)}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <ActivationForm membership={membership} />
                  </td>
                </tr>
              ))}
              {data?.data.length === 0 ? (
                <tr>
                  <td className="p-8 text-center text-ink-500" colSpan={5}>
                    {t('No subscriptions in this state.')}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {data && data.meta.last_page > 1 ? (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setSearchParams({ state, page: String(page - 1) })}
            leadingIcon={<ChevronLeft className="size-4" />}
          >
            {t('Previous')}
          </Button>
          <span className="text-xs text-ink-500">
            {t('Page')} {page} {t('of')} {data.meta.last_page}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= data.meta.last_page}
            onClick={() => setSearchParams({ state, page: String(page + 1) })}
            leadingIcon={<ChevronRight className="size-4" />}
          >
            {t('Next')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
