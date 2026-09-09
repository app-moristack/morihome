import { RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { registerServiceWorker } from '@/lib/serviceWorker'

export function UpdatePrompt() {
  const [applyUpdate, setApplyUpdate] = useState<(() => void) | null>(null)

  useEffect(() => {
    registerServiceWorker({
      onUpdateReady: (update) => setApplyUpdate(() => update),
    })
  }, [])

  if (!applyUpdate) {
    return null
  }

  return (
    <div
      className="fixed inset-x-0 z-40 px-4"
      style={{ bottom: 'calc(1rem + var(--safe-bottom))' }}
      role="status"
    >
      <div className="card animate-rise mx-auto flex max-w-md items-center gap-3 p-3.5 shadow-lifted">
        <RefreshCw className="size-5 shrink-0 text-brand-600" aria-hidden />
        <p className="flex-1 text-sm font-semibold text-ink-800">A new version of MoriHome is ready.</p>
        <Button size="sm" onClick={applyUpdate}>
          Reload
        </Button>
      </div>
    </div>
  )
}
