import { useCallback, useEffect, useState } from 'react'

const DISMISSED_KEY = 'morihome:install-dismissed'
const DISMISS_DURATION_MS = 1000 * 60 * 60 * 24 * 14

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallPlatform = 'android' | 'ios' | 'desktop'

function detectPlatform(): InstallPlatform {
  const agent = window.navigator.userAgent

  if (/iPad|iPhone|iPod/.test(agent) || (agent.includes('Macintosh') && 'ontouchend' in document)) {
    return 'ios'
  }

  return /Android/.test(agent) ? 'android' : 'desktop'
}

function isRunningStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && Boolean((window.navigator as { standalone?: boolean }).standalone))
  )
}

function wasRecentlyDismissed(): boolean {
  try {
    const dismissedAt = window.localStorage.getItem(DISMISSED_KEY)

    return dismissedAt !== null && Date.now() - Number(dismissedAt) < DISMISS_DURATION_MS
  } catch {
    return false
  }
}

export function useInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(isRunningStandalone)
  const [isDismissed, setIsDismissed] = useState(wasRecentlyDismissed)
  const platform = detectPlatform()

  useEffect(() => {
    const capturePrompt = (event: Event) => {
      event.preventDefault()
      setDeferredEvent(event as BeforeInstallPromptEvent)
    }

    const markInstalled = () => {
      setIsStandalone(true)
      setDeferredEvent(null)
    }

    window.addEventListener('beforeinstallprompt', capturePrompt)
    window.addEventListener('appinstalled', markInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', capturePrompt)
      window.removeEventListener('appinstalled', markInstalled)
    }
  }, [])

  const dismiss = useCallback(() => {
    setIsDismissed(true)

    try {
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    } catch {
      // A blocked storage API only costs us the memory of the dismissal.
    }
  }, [])

  const install = useCallback(async () => {
    if (!deferredEvent) {
      return false
    }

    await deferredEvent.prompt()
    const choice = await deferredEvent.userChoice
    setDeferredEvent(null)

    if (choice.outcome === 'dismissed') {
      dismiss()
    }

    return choice.outcome === 'accepted'
  }, [deferredEvent, dismiss])

  // iOS Safari never fires beforeinstallprompt, so it needs the manual instructions instead.
  const canPromptNatively = deferredEvent !== null
  const shouldOffer = !isStandalone && !isDismissed && (canPromptNatively || platform === 'ios')

  return { platform, isStandalone, shouldOffer, canPromptNatively, install, dismiss }
}
