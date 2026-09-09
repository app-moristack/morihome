import { MapPin, Navigation, Phone } from 'lucide-react'
import { ShareButton } from './ShareButton'
import { VerifiedBadge } from './VerifiedBadge'
import { WhatsappButton } from './WhatsappButton'
import { Button } from '@/components/ui/Button'
import { formatDistance, initialsOf } from '@/lib/format'
import { buildTelUrl } from '@/lib/whatsapp'
import type { PublicProvider } from '@/types/api'

type ProviderProfileHeaderProps = {
  provider: PublicProvider
  serviceName?: string | null
}

export function ProviderProfileHeader({ provider, serviceName }: ProviderProfileHeaderProps) {
  const distance = formatDistance(provider.distance_km)
  const telHref = buildTelUrl(provider.phone)
  const primaryService = provider.service_categories[0]

  return (
    <div className="card -mt-12 flex flex-col gap-4 p-5 sm:-mt-16 sm:p-6">
      <div className="flex flex-wrap items-start gap-4">
        {provider.logo_url ? (
          <img
            src={provider.logo_url}
            alt={`${provider.name} logo`}
            width={80}
            height={80}
            className="size-20 shrink-0 rounded-2xl border-4 border-surface bg-surface object-cover shadow-sm"
          />
        ) : (
          <div
            className="grid size-20 shrink-0 place-items-center rounded-2xl border-4 border-surface bg-brand-100 text-2xl font-extrabold text-brand-800"
            aria-hidden
          >
            {initialsOf(provider.name)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">{provider.name}</h1>
            <VerifiedBadge isVerified={provider.is_verified} isFeatured={provider.is_featured} />
          </div>

          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-ink-500">
            <span>{provider.provider_type_label}</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" aria-hidden />
              {provider.locality}
            </span>
            {distance ? (
              <span className="inline-flex items-center gap-1 font-semibold text-ink-800">
                <Navigation className="size-4" aria-hidden />
                {distance}
              </span>
            ) : null}
          </p>
        </div>

        <ShareButton title={provider.name} text={`${provider.name} on MoriHome`} url={window.location.href} />
      </div>

      <div className="hidden gap-2 sm:flex">
        <WhatsappButton
          slug={provider.slug}
          number={provider.whatsapp_number}
          serviceName={serviceName ?? primaryService?.name}
          {...(primaryService ? { serviceCategoryId: primaryService.id } : {})}
          source="profile"
          size="lg"
          label={`Message on WhatsApp${provider.whatsapp_display ? ` · ${provider.whatsapp_display}` : ''}`}
        />
        {telHref ? (
          <a href={telHref}>
            <Button variant="secondary" size="lg" leadingIcon={<Phone className="size-4" />}>
              Call
            </Button>
          </a>
        ) : null}
      </div>
    </div>
  )
}
