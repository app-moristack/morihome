import { Building2, Images, KeyRound, TriangleAlert, UserPen } from 'lucide-react'
import { Link } from 'react-router'
import { ApiError } from '@/api/client'
import { ApprovalStatusCard } from '@/components/dashboard/ApprovalStatusCard'
import { SubscriptionManager } from '@/components/dashboard/SubscriptionManager'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useOwnProfile, useSubmitForReview } from '@/hooks/useProviderQueries'
import { useToast } from '@/hooks/useToast'

const QUICK_LINKS = [
  {
    to: '/dashboard/profile',
    icon: UserPen,
    title: 'Edit profile',
    body: 'Contact details, services and location.',
  },
  {
    to: '/dashboard/properties',
    icon: Building2,
    title: 'Properties',
    body: 'Create rental and sale listings within your plan limits.',
  },
  {
    to: '/dashboard/portfolio',
    icon: Images,
    title: 'Portfolio',
    body: 'Show photos of your previous work.',
  },
  { to: '/dashboard/security', icon: KeyRound, title: 'Security', body: 'Change your password.' },
]

export default function ProviderDashboardPage() {
  const { data, isLoading, isError } = useOwnProfile()
  const submitForReview = useSubmitForReview()
  const { showToast } = useToast()

  if (isLoading) {
    return (
      <div className="container-page flex flex-col gap-4 py-8">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-56 rounded-card" />
        <Skeleton className="h-32 rounded-card" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="container-page py-12">
        <EmptyState
          tone="danger"
          icon={<TriangleAlert className="size-6" aria-hidden />}
          title="We could not load your dashboard"
          description="Please refresh the page or sign in again."
        />
      </div>
    )
  }

  const provider = data.data
  const completeness = data.meta.completeness

  const handleSubmit = () => {
    submitForReview.mutate(undefined, {
      onSuccess: () => showToast('Your profile has been sent for review.', 'success'),
      onError: (error) =>
        showToast(error instanceof ApiError ? error.message : 'We could not submit your profile.', 'error'),
    })
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeader
        eyebrow="Provider dashboard"
        title={provider.name}
        description="Keep your details current — customers see this information when they search."
        action={
          <Badge tone={provider.is_publicly_visible ? 'success' : 'warning'}>
            {provider.approval_status_label}
          </Badge>
        }
      />

      <div className="mt-6 flex flex-col gap-6">
        <ApprovalStatusCard
          provider={provider}
          completeness={completeness}
          onSubmit={handleSubmit}
          isSubmitting={submitForReview.isPending}
        />

        <SubscriptionManager providerType={provider.provider_type} />

        <section>
          <h2 className="text-lg font-bold text-ink-900">Manage your listing</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="card flex h-full flex-col gap-2 p-4 transition-all duration-200 hover:border-brand-300 hover:shadow-lifted"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-100 text-brand-800">
                    <link.icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-bold text-ink-900">{link.title}</span>
                  <span className="text-sm leading-relaxed text-ink-500">{link.body}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-bold text-ink-900">Your services</h2>
          {provider.service_categories.length === 0 ? (
            <p className="mt-2 text-sm text-ink-500">
              No services selected yet.{' '}
              <Link
                to="/dashboard/profile"
                className="font-semibold text-ink-900 underline underline-offset-2"
              >
                Add your trades
              </Link>
            </p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {provider.service_categories.map((category) => (
                <li key={category.id}>
                  <Badge tone={category.is_primary ? 'dark' : 'brand'}>{category.name}</Badge>
                </li>
              ))}
            </ul>
          )}

          <dl className="mt-5 grid gap-3 text-sm text-ink-600 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold tracking-wide text-ink-400 uppercase">Base location</dt>
              <dd className="mt-0.5">{provider.locality}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold tracking-wide text-ink-400 uppercase">WhatsApp</dt>
              <dd className="mt-0.5">{provider.whatsapp_phone ?? provider.phone}</dd>
            </div>
          </dl>

          <div className="mt-5">
            <Link to="/dashboard/profile">
              <Button variant="secondary" leadingIcon={<UserPen className="size-4" />}>
                Edit these details
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
