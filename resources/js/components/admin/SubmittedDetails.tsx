import { categoryLabel } from '@/i18n/labels'
import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/format'
import type { OwnedProvider } from '@/types/api'

export function SubmittedDetails({ provider }: { provider: OwnedProvider }) {
  useLocale()
  const rows: [string, string][] = [
    ['Phone', provider.phone],
    ['WhatsApp', provider.whatsapp_phone ?? '—'],
    ['Email', provider.email ?? '—'],
    ['Website', provider.website ?? '—'],
    ['Address', provider.address],
    ['Locality', provider.locality],
    ['Coordinates', `${provider.latitude}, ${provider.longitude}`],
    ['Submitted', formatDate(provider.submitted_at) ?? '—'],
  ]

  return (
    <section className="card p-5">
      <h2 className="text-lg font-bold text-ink-900">{t('Submitted details')}</h2>

      <dl className="mt-3 grid gap-3 text-sm text-ink-700 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-bold tracking-wide text-ink-400 uppercase">{t(label)}</dt>
            <dd className="mt-0.5 break-words">{value}</dd>
          </div>
        ))}
      </dl>

      {provider.description ? (
        <>
          <h3 className="mt-5 text-sm font-bold text-ink-900">{t('Description')}</h3>
          <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-ink-600">
            {provider.description}
          </p>
        </>
      ) : null}

      <h3 className="mt-5 text-sm font-bold text-ink-900">{t('Services')}</h3>
      <ul className="mt-2 flex flex-wrap gap-2">
        {provider.service_categories.map((category) => (
          <li key={category.id}>
            <Badge tone="brand">{categoryLabel(category.name)}</Badge>
          </li>
        ))}
      </ul>
    </section>
  )
}
