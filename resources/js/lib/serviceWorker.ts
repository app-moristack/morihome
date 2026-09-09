const SERVICE_WORKER_URL = '/sw.js'

type RegisterOptions = {
  onUpdateReady?: (applyUpdate: () => void) => void
}

/**
 * Registration is skipped in dev because the Vite dev server serves modules the
 * cached shell would shadow.
 */
export function registerServiceWorker({ onUpdateReady }: RegisterOptions = {}): void {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) {
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(SERVICE_WORKER_URL, { scope: '/' })
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing

          if (!installing) {
            return
          }

          installing.addEventListener('statechange', () => {
            if (installing.state !== 'installed' || !navigator.serviceWorker.controller) {
              return
            }

            onUpdateReady?.(() => {
              installing.postMessage({ type: 'SKIP_WAITING' })
              window.location.reload()
            })
          })
        })
      })
      .catch(() => {
        // Offline support is a progressive enhancement; the app works without it.
      })
  })
}
