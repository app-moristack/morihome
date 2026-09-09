import { Phone, UserX } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router'
import { ProviderContactPanel } from '@/components/provider/ProviderContactPanel'
import { ProviderGallery } from '@/components/provider/ProviderGallery'
import { ProviderProfileHeader } from '@/components/provider/ProviderProfileHeader'
import { WhatsappButton } from '@/components/provider/WhatsappButton'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useProviderProfile } from '@/hooks/useSearchQueries'
import { buildTelUrl } from '@/lib/whatsapp'

export default function ProviderProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const { data: provider, isLoading, isError } = useProviderProfile(slug)

  if (isLoading) {
    return (
      <div className="container-page flex flex-col gap-4 py-8">
        <Skeleton className="h-40 rounded-card" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-32 rounded-card" />
      </div>
    )
  }

  if (isError || !provider) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={<UserX className="size-6" aria-hidden />}
          title="This profile is not available"
          description="It may have been removed, suspended, or is still waiting for validation."
          action={
            <Link to="/search">
              <Button variant="secondary">Back to search</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const serviceName = searchParams.get('service')
  const primaryService = provider.service_categories[0]
  const telHref = buildTelUrl(provider.phone)

  return (
    <article className="pb-24 sm:pb-8">
      <div className="relative h-36 w-full overflow-hidden bg-ink-900 sm:h-56">
        {provider.cover_url ? (
          <img
            src={provider.cover_url}
            alt=""
            className="size-full object-cover opacity-90"
            loading="eager"
            decoding="async"
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-ink-900 to-ink-700" aria-hidden />
        )}
      </div>

      <div className="container-page">
        <ProviderProfileHeader provider={provider} serviceName={serviceName} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-6">
            {provider.description ? (
              <section className="card p-5 sm:p-6">
                <h2 className="text-lg font-bold text-ink-900">About</h2>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink-600">
                  {provider.description}
                </p>
              </section>
            ) : null}

            {provider.service_categories.length > 0 ? (
              <section className="card p-5 sm:p-6">
                <h2 className="text-lg font-bold text-ink-900">Services offered</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {provider.service_categories.map((category) => (
                    <li key={category.id}>
                      <Badge tone={category.is_primary ? 'dark' : 'brand'}>
                        {category.name}
                        {category.specialty ? ` · ${category.specialty}` : ''}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <ProviderGallery images={provider.portfolio_images} providerName={provider.name} />
          </div>

          <ProviderContactPanel provider={provider} />
        </div>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-100 bg-surface/95 px-4 pt-3 backdrop-blur-md sm:hidden"
        style={{ paddingBottom: 'calc(0.75rem + var(--safe-bottom))' }}
      >
        <div className="flex gap-2">
          <WhatsappButton
            slug={provider.slug}
            number={provider.whatsapp_number}
            serviceName={serviceName ?? primaryService?.name}
            {...(primaryService ? { serviceCategoryId: primaryService.id } : {})}
            source="profile"
            size="lg"
            isFullWidth
            label="Message on WhatsApp"
          />
          {telHref ? (
            <a href={telHref} aria-label={`Call ${provider.name}`}>
              <Button variant="secondary" size="lg" className="px-4">
                <Phone className="size-5" aria-hidden />
              </Button>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}
