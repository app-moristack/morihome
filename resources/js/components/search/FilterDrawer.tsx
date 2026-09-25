import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { t } from '@/i18n'

export function FilterDrawer({
  id,
  title,
  onClose,
  children,
  variant = 'drawer',
  closeLabel = t('Close filters'),
}: {
  id: string
  title: string
  onClose: () => void
  children: ReactNode
  variant?: 'drawer' | 'modal'
  closeLabel?: string
}) {
  const panel = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return
      const controls = Array.from(
        panel.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0)
      const first = controls[0]
      const last = controls.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [onClose])

  return (
    <div id={id} className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/55" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        className={
          variant === 'modal'
            ? 'absolute top-1/2 left-1/2 flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-canvas shadow-2xl'
            : 'absolute inset-y-0 right-0 flex w-[min(92vw,380px)] flex-col bg-canvas shadow-2xl'
        }
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-ink-100 bg-surface px-4 pt-[env(safe-area-inset-top)]">
          <strong>{title}</strong>
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            className="my-2 inline-flex min-h-11 items-center gap-2 rounded-full border border-ink-200 px-3 text-sm font-semibold hover:bg-ink-100"
            aria-label={closeLabel}
          >
            <X className="size-5" aria-hidden /> {t('Close')}
          </button>
        </div>
        <div className="filter-drawer-body min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  )
}
