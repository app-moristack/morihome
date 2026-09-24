import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

type StepIndicatorProps = {
  labels: string[]
  activeIndex: number
}

export function StepIndicator({ labels, activeIndex }: StepIndicatorProps) {
  useLocale()
  return (
    <ol
      className="flex items-center gap-1.5"
      aria-label={t('Step {current} of {total}', { current: activeIndex + 1, total: labels.length })}
    >
      {labels.map((label, index) => {
        const isComplete = index < activeIndex
        const isActive = index === activeIndex

        return (
          <li key={label} className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span
              className={cn(
                'h-1.5 rounded-full transition-colors duration-300',
                isComplete || isActive ? 'bg-brand-400' : 'bg-ink-200',
              )}
              aria-hidden
            />
            <span
              className={cn(
                'flex items-center gap-1 truncate text-xs font-semibold',
                isActive ? 'text-ink-900' : isComplete ? 'text-brand-700' : 'text-ink-400',
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              {isComplete ? <Check className="size-3 shrink-0" aria-hidden /> : null}
              {t(label)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
