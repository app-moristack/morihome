import { formatDate, formatFieldName } from '@/lib/format'
import type { ModerationEvent } from '@/types/api'

export function AuditTrail({ events }: { events: ModerationEvent[] }) {
  return (
    <section className="card p-5">
      <h2 className="text-lg font-bold text-ink-900">Audit trail</h2>

      {events.length === 0 ? (
        <p className="mt-2 text-sm text-ink-500">No moderation actions yet.</p>
      ) : (
        <ol className="mt-3 flex flex-col gap-3">
          {events.map((event) => (
            <li key={event.id} className="border-l-2 border-ink-100 pl-3">
              <p className="text-sm font-semibold text-ink-900 capitalize">
                {event.action.replaceAll('_', ' ')}
              </p>
              <p className="text-xs text-ink-500">
                {formatDate(event.created_at)} · {event.actor?.name ?? 'System'}
              </p>
              {event.reason ? <p className="mt-1 text-xs text-ink-600">{event.reason}</p> : null}
              {event.changed_fields?.length ? (
                <p className="mt-1 text-xs text-ink-500">
                  Changed: {event.changed_fields.map(formatFieldName).join(', ')}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
