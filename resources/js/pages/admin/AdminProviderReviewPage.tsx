import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { ApiError } from '@/api/client'
import { adminApi } from '@/api/endpoints'
import { queryKeys } from '@/api/queryKeys'
import { AuditTrail } from '@/components/admin/AuditTrail'
import { ModerationPanel, type ModerationAction } from '@/components/admin/ModerationPanel'
import { SubmittedDetails } from '@/components/admin/SubmittedDetails'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/hooks/useToast'

export default function AdminProviderReviewPage() {
  const { id } = useParams<{ id: string }>()
  const providerId = Number(id)
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const { data: provider, isLoading } = useQuery({
    queryKey: queryKeys.adminProvider(providerId),
    queryFn: () => adminApi.provider(providerId),
    enabled: Number.isFinite(providerId),
  })

  const { data: history = [] } = useQuery({
    queryKey: queryKeys.adminProviderHistory(providerId),
    queryFn: () => adminApi.history(providerId),
    enabled: Number.isFinite(providerId),
  })

  const moderate = useMutation({
    mutationFn: ({ action, reason }: { action: ModerationAction; reason?: string }) =>
      adminApi.moderate(providerId, action, reason),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] })
      showToast(`Provider ${variables.action}.`, 'success')
    },
    onError: (error) => showToast(error instanceof ApiError ? error.message : 'The action failed.', 'error'),
  })

  if (isLoading) {
    return <Spinner label="Loading provider" />
  }

  if (!provider) {
    return (
      <div className="container-page py-12">
        <EmptyState title="Provider not found" description="It may have been deleted." />
      </div>
    )
  }

  return (
    <div className="container-page max-w-4xl py-8 sm:py-10">
      <Link
        to="/admin/providers"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to queue
      </Link>

      <div className="mt-4">
        <PageHeader
          eyebrow="Review"
          title={provider.name}
          description={`${provider.provider_type} · ${provider.locality}`}
          action={
            <Badge tone={provider.is_publicly_visible ? 'success' : 'warning'}>
              {provider.approval_status_label}
            </Badge>
          }
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-5">
          <SubmittedDetails provider={provider} />

          {provider.portfolio_images.length > 0 ? (
            <section className="card p-5">
              <h2 className="text-lg font-bold text-ink-900">Portfolio</h2>
              <ul className="mt-3 grid grid-cols-3 gap-2">
                {provider.portfolio_images.map((image) => (
                  <li key={image.id}>
                    <img
                      src={image.url}
                      alt={image.caption ?? ''}
                      loading="lazy"
                      className="aspect-4/3 w-full rounded-lg bg-ink-50 object-cover"
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="flex flex-col gap-5">
          <ModerationPanel
            provider={provider}
            isPending={moderate.isPending}
            onModerate={(action, reason) => moderate.mutate({ action, reason })}
          />
          <AuditTrail events={history} />
        </aside>
      </div>
    </div>
  )
}
