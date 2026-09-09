import { useQuery } from '@tanstack/react-query'
import { Inbox } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { adminApi } from '@/api/endpoints'
import { queryKeys } from '@/api/queryKeys'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'
import type { ApprovalStatusValue } from '@/types/api'

const STATUS_TABS: { value: ApprovalStatusValue | 'all'; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'draft', label: 'Drafts' },
  { value: 'all', label: 'All' },
]

const STATUS_TONES: Record<ApprovalStatusValue, 'neutral' | 'brand' | 'success' | 'warning' | 'danger'> = {
  draft: 'neutral',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  suspended: 'danger',
}

export default function AdminReviewQueuePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('status') ?? 'pending'
  const page = Number(searchParams.get('page') ?? 1)

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.adminProviders(status, page),
    queryFn: () => adminApi.searchProviders({ ...(status === 'all' ? {} : { status }), page }),
  })

  const providers = data?.data ?? []

  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeader
        eyebrow="Administration"
        title="Provider review queue"
        description="Approve, reject or suspend listings. Every decision is written to the audit trail."
      />

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter by status">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={status === tab.value}
            onClick={() => setSearchParams({ status: tab.value })}
            className={cn(
              'min-h-10 shrink-0 rounded-pill border px-4 text-sm font-semibold transition-colors',
              status === tab.value
                ? 'border-ink-900 bg-ink-900 text-white'
                : 'border-ink-200 text-ink-700 hover:bg-ink-50',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-20 rounded-card" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            tone="danger"
            title="Could not load the queue"
            description="Please refresh and try again."
          />
        ) : providers.length === 0 ? (
          <EmptyState
            icon={<Inbox className="size-6" aria-hidden />}
            title="Nothing here"
            description={
              status === 'pending'
                ? 'No registrations are waiting for review. Good work.'
                : 'No providers match this status.'
            }
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {providers.map((provider) => (
              <li key={provider.id}>
                <Link
                  to={`/admin/providers/${provider.id}`}
                  className="card flex flex-wrap items-center gap-3 p-4 transition-all hover:border-brand-300 hover:shadow-lifted"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-ink-900">{provider.name}</span>
                    <span className="block text-xs text-ink-500">
                      {provider.locality} · {provider.phone} · registered{' '}
                      {formatDate(provider.submitted_at ?? provider.approved_at) ?? 'recently'}
                    </span>
                  </span>
                  <Badge tone={STATUS_TONES[provider.approval_status]}>
                    {provider.approval_status_label}
                  </Badge>
                  <Button size="sm" variant="ghost">
                    Review
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
