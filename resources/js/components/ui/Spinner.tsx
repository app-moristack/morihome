import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type SpinnerProps = {
  label?: string
  className?: string
}

export function Spinner({ label = 'Loading', className }: SpinnerProps) {
  useLocale()
  return (
    <div className={cn('flex items-center justify-center gap-2 py-8 text-ink-500', className)} role="status">
      <Loader2 className="size-5 animate-spin" aria-hidden />
      <span className="text-sm font-medium">{t(label)}</span>
    </div>
  )
}
