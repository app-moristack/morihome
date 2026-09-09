import { House, MapPin, Navigation } from 'lucide-react'
import { Link } from 'react-router'
import { WhatsappButton } from './WhatsappButton'
import { VerifiedBadge } from './VerifiedBadge'
import { Badge } from '@/components/ui/Badge'
import { formatDistance, initialsOf } from '@/lib/format'
import type { ProviderSummary } from '@/types/api'

type ProviderCardProps = {
  provider: ProviderSummary
  activeCategoryId?: number | null
  variant?: 'list' | 'grid'
}

const MAX_VISIBLE_CATEGORIES = 3

export function ProviderCard({ provider, activeCategoryId, variant = 'list' }: ProviderCardProps) {
  const distance = formatDistance(provider.distance_km)
  const activeCategory = provider.service_categories.find((category) => category.id === activeCategoryId)
  const visibleCategories = provider.service_categories.slice(0, MAX_VISIBLE_CATEGORIES)
  const hiddenCount = provider.service_categories.length - visibleCategories.length

  if (variant === 'grid') {
    return (
      <article className="search-result-card card group flex h-full min-w-0 flex-col overflow-hidden p-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lifted">
        <Link
          to={`/providers/${provider.slug}`}
          className="grid h-44 place-items-center overflow-hidden bg-gradient-to-br from-brand-50 to-ink-100 dark:from-ink-800 dark:to-ink-900"
          aria-label={`View ${provider.name}'s profile`}
        >
          {provider.cover_url ? (
            <img
              src={provider.cover_url}
              alt={`${provider.name}, ${activeCategory?.name ?? visibleCategories[0]?.name ?? 'home professional'} in ${provider.locality}`}
              loading="lazy"
              decoding="async"
              width={420}
              height={240}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <House className="home-illustrated-icon size-16" aria-hidden />
          )}
        </Link>

        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <div className="flex items-start gap-3">
            {provider.logo_url ? (
              <img
                src={provider.logo_url}
                alt=""
                loading="lazy"
                decoding="async"
                width={42}
                height={42}
                className="size-10 shrink-0 rounded-full border-2 border-surface bg-ink-50 object-cover"
              />
            ) : (
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-extrabold text-brand-900">
                {initialsOf(provider.name)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-bold text-ink-900">
                <Link to={`/providers/${provider.slug}`} className="hover:underline">
                  {provider.name}
                </Link>
              </h3>
              <p className="mt-0.5 truncate text-xs font-semibold text-blue-700 dark:text-blue-300">
                {activeCategory?.name ?? visibleCategories[0]?.name ?? provider.provider_type_label}
              </p>
            </div>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-ink-500">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{provider.locality}</span>
            {distance ? (
              <span className="ml-auto shrink-0 font-semibold text-ink-700">{distance}</span>
            ) : null}
          </p>

          <div className="min-h-6">
            <VerifiedBadge isVerified={provider.is_verified} isFeatured={provider.is_featured} />
          </div>

          {visibleCategories.length > 0 ? (
            <ul className="flex flex-wrap gap-1">
              {visibleCategories.map((category) => (
                <li key={category.id}>
                  <Badge
                    className="px-2 py-1 text-[10px]"
                    tone={category.id === activeCategoryId ? 'dark' : 'neutral'}
                  >
                    {category.name}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-auto grid gap-2 pt-2">
            <WhatsappButton
              slug={provider.slug}
              number={provider.whatsapp_number}
              serviceName={activeCategory?.name ?? visibleCategories[0]?.name}
              {...(activeCategory ? { serviceCategoryId: activeCategory.id } : {})}
              source="search"
              size="sm"
              variant="primary"
              isFullWidth
              label="Contact via WhatsApp"
            />
            {!provider.whatsapp_number ? (
              <Link
                to={`/providers/${provider.slug}`}
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-ink-200 text-xs font-semibold hover:bg-ink-50"
              >
                View profile
              </Link>
            ) : null}
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="card p-4 transition-shadow duration-200 ease-[var(--ease-out-soft)] hover:shadow-lifted">
      <div className="flex gap-3.5">
        {provider.logo_url ? (
          <img
            src={provider.logo_url}
            alt=""
            loading="lazy"
            decoding="async"
            width={64}
            height={64}
            className="size-16 shrink-0 rounded-xl bg-ink-50 object-cover"
          />
        ) : (
          <div
            className="grid size-16 shrink-0 place-items-center rounded-xl bg-brand-100 text-lg font-extrabold text-brand-800"
            aria-hidden
          >
            {initialsOf(provider.name)}
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="min-w-0 truncate text-base font-bold text-ink-900">
              <Link to={`/providers/${provider.slug}`} className="hover:underline">
                {provider.name}
              </Link>
            </h3>
            <VerifiedBadge isVerified={provider.is_verified} isFeatured={provider.is_featured} />
          </div>

          <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-ink-500">
            <span>{provider.provider_type_label}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {provider.locality}
            </span>
            {distance ? (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1 font-semibold text-ink-700">
                  <Navigation className="size-3.5" aria-hidden />
                  {distance}
                </span>
              </>
            ) : null}
          </p>

          {provider.excerpt ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-ink-600">{provider.excerpt}</p>
          ) : null}
        </div>
      </div>

      {visibleCategories.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {visibleCategories.map((category) => (
            <li key={category.id}>
              <Badge tone={category.id === activeCategoryId ? 'dark' : 'neutral'}>{category.name}</Badge>
            </li>
          ))}
          {hiddenCount > 0 ? (
            <li>
              <Badge tone="neutral">+{hiddenCount} more</Badge>
            </li>
          ) : null}
        </ul>
      ) : null}

      <div className="mt-4 flex items-center gap-2">
        <WhatsappButton
          slug={provider.slug}
          number={provider.whatsapp_number}
          serviceName={activeCategory?.name ?? provider.service_categories[0]?.name}
          {...(activeCategory ? { serviceCategoryId: activeCategory.id } : {})}
          source="search"
          size="sm"
          label="WhatsApp"
        />
        <Link
          to={`/providers/${provider.slug}`}
          className="inline-flex min-h-9 items-center justify-center rounded-pill border border-ink-200 px-3.5 text-sm font-semibold text-ink-800 hover:bg-ink-50"
        >
          View profile
        </Link>
      </div>
    </article>
  )
}
