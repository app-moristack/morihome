import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ToastContext } from './toastContext'
import { cn } from '@/lib/cn'

type ToastTone = 'success' | 'error' | 'info'

type Toast = {
  id: number
  tone: ToastTone
  message: string
}

const AUTO_DISMISS_MS = 5000

const TONE_CLASSES: Record<ToastTone, string> = {
  success: 'border-success/30 bg-emerald-50 text-success',
  error: 'border-danger/30 bg-red-50 text-danger',
  info: 'border-ink-200 bg-surface text-ink-800',
}

const TONE_ICONS: Record<ToastTone, ReactNode> = {
  success: <CircleCheck className="size-5 shrink-0" aria-hidden />,
  error: <CircleAlert className="size-5 shrink-0" aria-hidden />,
  info: <Info className="size-5 shrink-0" aria-hidden />,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = Date.now() + Math.random()

      setToasts((current) => [...current, { id, tone, message }])
      window.setTimeout(() => dismissToast(id), AUTO_DISMISS_MS)
    },
    [dismissToast],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 z-50 flex flex-col items-center gap-2 px-4"
        style={{ bottom: 'calc(1rem + var(--safe-bottom))' }}
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className={cn(
              'animate-rise pointer-events-auto flex w-full max-w-md items-center gap-3 shadow-lifted',
              'rounded-xl border px-4 py-3 text-sm font-medium',
              TONE_CLASSES[toast.tone],
            )}
          >
            {TONE_ICONS[toast.tone]}
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="-mr-1 grid size-8 shrink-0 place-items-center rounded-full hover:bg-ink-900/10"
              aria-label="Dismiss notification"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  )
}
