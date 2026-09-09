import { CircleCheck, Clock, FolderTree, MessageCircle, PauseCircle, Users } from 'lucide-react'
import type { ComponentType } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { adminApi } from '@/api/endpoints'
import { queryKeys } from '@/api/queryKeys'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'

type StatTile = {
  label: string
  value: number
  icon: ComponentType<{ className?: string }>
  tone: string
  to?: string
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.adminDashboard(),
    queryFn: adminApi.dashboard,
  })

  if (isLoading || !data) {
    return (
      <div className="container-page flex flex-col gap-4 py-8">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-card" />
          ))}
        </div>
      </div>
    )
  }

  const tiles: StatTile[] = [
    {
      label: 'Pending review',
      value: data.providers.pending,
      icon: Clock,
      tone: 'bg-amber-50 text-warning',
      to: '/admin/providers?status=pending',
    },
    {
      label: 'Approved',
      value: data.providers.approved,
      icon: CircleCheck,
      tone: 'bg-emerald-50 text-success',
      to: '/admin/providers?status=approved',
    },
    {
      label: 'Suspended',
      value: data.providers.suspended,
      icon: PauseCircle,
      tone: 'bg-red-50 text-danger',
      to: '/admin/providers?status=suspended',
    },
    {
      label: 'Categories',
      value: data.service_categories.active,
      icon: FolderTree,
      tone: 'bg-brand-100 text-brand-800',
      to: '/admin/categories',
    },
  ]

  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeader
        eyebrow="Administration"
        title="Moderation overview"
        description="Review new registrations, keep the directory trustworthy, and manage the service catalogue."
      />

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => {
          const content = (
            <div className="card flex h-full items-center gap-4 p-4 transition-shadow hover:shadow-lifted">
              <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${tile.tone}`}>
                <tile.icon className="size-6" />
              </span>
              <span className="min-w-0">
                <span className="block text-2xl font-extrabold text-ink-900">{tile.value}</span>
                <span className="block text-sm font-medium text-ink-500">{tile.label}</span>
              </span>
            </div>
          )

          return <li key={tile.label}>{tile.to ? <Link to={tile.to}>{content}</Link> : content}</li>
        })}
      </ul>

      <div className="card mt-6 flex items-center gap-4 p-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-700">
          <MessageCircle className="size-6" aria-hidden />
        </span>
        <div>
          <p className="text-2xl font-extrabold text-ink-900">{data.contact_events_last_30_days}</p>
          <p className="text-sm font-medium text-ink-500">WhatsApp contacts in the last 30 days</p>
        </div>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">Recent registrations</h2>
          <Link
            to="/admin/providers"
            className="text-sm font-semibold text-ink-700 underline underline-offset-2 hover:text-ink-900"
          >
            Open review queue
          </Link>
        </div>

        {data.recent_registrations.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">No registrations yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {data.recent_registrations.map((provider) => (
              <li key={provider.id}>
                <Link
                  to={`/admin/providers/${provider.id}`}
                  className="card flex items-center gap-3 p-3.5 transition-colors hover:border-brand-300"
                >
                  <Users className="size-5 shrink-0 text-ink-400" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink-900">{provider.name}</span>
                    <span className="block text-xs text-ink-500">
                      {provider.provider_type_label} · {provider.locality}
                    </span>
                  </span>
                  {provider.is_verified ? <Badge tone="success">Verified</Badge> : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
