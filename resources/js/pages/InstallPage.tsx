import { MonitorSmartphone, Share, Smartphone, SquarePlus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

const IOS_STEPS = [
  'Open MoriHome in Safari (not Chrome — iOS only allows Safari to install web apps).',
  'Tap the Share button at the bottom of the screen.',
  'Scroll down and tap "Add to Home Screen".',
  'Tap "Add". MoriHome now opens full screen, like any other app.',
]

const ANDROID_STEPS = [
  'Open MoriHome in Chrome.',
  'Tap the three-dot menu in the top right.',
  'Tap "Install app" or "Add to Home screen".',
  'Confirm. MoriHome now opens full screen from your home screen.',
]

export default function InstallPage() {
  const { canPromptNatively, isStandalone, install, platform } = useInstallPrompt()

  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <PageHeader
        eyebrow="Progressive web app"
        title="Install MoriHome on your phone"
        description="MoriHome works like an app once it is on your home screen: full screen, no browser bar, and one tap away when you need a professional."
      />

      {isStandalone ? (
        <p className="mt-6 rounded-xl border border-success/30 bg-emerald-50 p-4 text-sm font-semibold text-success">
          You are already running MoriHome as an installed app.
        </p>
      ) : canPromptNatively ? (
        <div className="card mt-6 flex flex-col gap-3 p-5">
          <p className="text-sm text-ink-700">Your browser can install MoriHome in one tap.</p>
          <Button size="lg" onClick={install} leadingIcon={<Smartphone className="size-5" />}>
            Install MoriHome
          </Button>
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
            <Share className="size-5 text-ink-400" aria-hidden />
            iPhone &amp; iPad
          </h2>
          <ol className="mt-3 flex flex-col gap-3">
            {IOS_STEPS.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed text-ink-600">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink-900 text-xs font-bold text-white">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-500">
            <SquarePlus className="size-3.5" aria-hidden />
            Look for the "Add to Home Screen" icon in the share sheet.
          </p>
        </section>

        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
            <MonitorSmartphone className="size-5 text-ink-400" aria-hidden />
            Android
          </h2>
          <ol className="mt-3 flex flex-col gap-3">
            {ANDROID_STEPS.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-relaxed text-ink-600">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink-900 text-xs font-bold text-white">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <p className="mt-8 text-sm text-ink-500">
        Detected platform: <strong className="text-ink-800">{platform}</strong>. Profile links you share will
        open correctly whether the recipient uses the browser or the installed app.
      </p>
    </div>
  )
}
