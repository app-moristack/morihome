import { Clock, Globe, Mail, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatDayName, formatTimeRange } from '@/lib/format'
import { buildTelUrl } from '@/lib/whatsapp'
import type { PublicProvider } from '@/types/api'

export function ProviderContactPanel({ provider }: { provider: PublicProvider }) {
  const telHref = buildTelUrl(provider.phone)
  const hasOpenDay = provider.opening_hours.some((hour) => !hour.is_closed)

  return (
    <aside className="flex flex-col gap-6">
      <section className="card p-5">
        <h2 className="text-lg font-bold text-ink-900">Contact</h2>
        <ul className="mt-3 flex flex-col gap-3 text-sm">
          {telHref ? (
            <li>
              <a href={telHref} className="inline-flex items-center gap-2.5 text-ink-700 hover:text-ink-900">
                <Phone className="size-4 text-ink-400" aria-hidden />
                {provider.whatsapp_display ?? provider.phone}
              </a>
            </li>
          ) : null}
          {provider.email ? (
            <li>
              <a
                href={`mailto:${provider.email}`}
                className="inline-flex items-center gap-2.5 break-all text-ink-700 hover:text-ink-900"
              >
                <Mail className="size-4 shrink-0 text-ink-400" aria-hidden />
                {provider.email}
              </a>
            </li>
          ) : null}
          {provider.website ? (
            <li>
              <a
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-2.5 break-all text-ink-700 hover:text-ink-900"
              >
                <Globe className="size-4 shrink-0 text-ink-400" aria-hidden />
                {provider.website.replace(/^https?:\/\//, '')}
              </a>
            </li>
          ) : null}
        </ul>
      </section>

      {provider.service_areas && provider.service_areas.length > 0 ? (
        <section className="card p-5">
          <h2 className="text-lg font-bold text-ink-900">Areas served</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {provider.service_areas.map((area) => (
              <li key={area}>
                <Badge>{area}</Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasOpenDay ? (
        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
            <Clock className="size-4 text-ink-400" aria-hidden />
            Opening hours
          </h2>
          <dl className="mt-3 flex flex-col gap-1.5 text-sm">
            {provider.opening_hours.map((hour) => (
              <div key={hour.day_of_week} className="flex justify-between gap-4">
                <dt className="text-ink-600">{formatDayName(hour.day_of_week)}</dt>
                <dd className={hour.is_closed ? 'text-ink-400' : 'font-semibold text-ink-900'}>
                  {hour.is_closed ? 'Closed' : formatTimeRange(hour.opens_at, hour.closes_at)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </aside>
  )
}
