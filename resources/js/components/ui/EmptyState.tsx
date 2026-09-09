import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
  tone?: 'neutral' | 'danger'
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  tone = 'neutral',
}: EmptyStateProps) {
  return (
    <div className={cn('card flex flex-col items-center gap-3 px-6 py-12 text-center', className)}>
      {icon ? (
        <div
          className={cn(
            'grid size-14 place-items-center rounded-full',
            tone === 'danger' ? 'bg-red-50 text-danger' : 'bg-brand-100 text-brand-800',
          )}
        >
          {icon}
        </div>
      ) : null}
      <h2 className="text-lg font-bold text-ink-900">{title}</h2>
      {description ? <p className="max-w-sm text-sm leading-relaxed text-ink-500">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
