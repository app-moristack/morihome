import { Download, Share, SquarePlus, X } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { useToast } from '@/hooks/useToast'

export function InstallPrompt() {
  const { shouldOffer, canPromptNatively, platform, install, dismiss } = useInstallPrompt()
  const { showToast } = useToast()

  if (!shouldOffer) {
    return null
  }

  const handleInstall = async () => {
    const accepted = await install()

    if (accepted) {
      showToast('MoriHome is being added to your home screen.', 'success')
    }
  }

  return (
    <div
      className="fixed inset-x-0 z-40 px-4"
      style={{ bottom: 'calc(1rem + var(--safe-bottom))' }}
      role="complementary"
      aria-label="Install MoriHome"
    >
      <div className="card animate-rise mx-auto flex max-w-md items-start gap-3 p-4 shadow-lifted">
        <img src="/icons/icon-96.png" alt="" className="size-11 shrink-0 rounded-xl" width={44} height={44} />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink-900">Add MoriHome to your home screen</p>

          {canPromptNatively ? (
            <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
              Open it like an app, full screen and one tap away.
            </p>
          ) : (
            <p className="mt-0.5 flex flex-wrap items-center gap-1 text-xs leading-relaxed text-ink-500">
              Tap
              <Share className="inline size-3.5 text-ink-700" aria-label="the Share button" />
              then
              <SquarePlus className="inline size-3.5 text-ink-700" aria-hidden />
              <span className="font-semibold">Add to Home Screen</span>.
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            {canPromptNatively ? (
              <Button size="sm" leadingIcon={<Download className="size-4" />} onClick={handleInstall}>
                Install
              </Button>
            ) : (
              <Link
                to="/install"
                className="text-xs font-semibold text-ink-700 underline underline-offset-2 hover:text-ink-900"
              >
                Show me how ({platform === 'ios' ? 'iPhone' : 'my phone'})
              </Link>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="-mt-1 -mr-1 grid size-9 shrink-0 place-items-center rounded-full text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          aria-label="Dismiss install suggestion"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
