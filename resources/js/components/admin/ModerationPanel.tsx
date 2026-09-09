import { CircleCheck, PauseCircle, Play, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'
import type { OwnedProvider } from '@/types/api'

export type ModerationAction = 'approved' | 'rejected' | 'suspended' | 'reactivated'

type ModerationPanelProps = {
  provider: OwnedProvider
  isPending: boolean
  onModerate: (action: ModerationAction, reason?: string) => void
}

export function ModerationPanel({ provider, isPending, onModerate }: ModerationPanelProps) {
  const [confirmingAction, setConfirmingAction] = useState<ModerationAction | null>(null)
  const [reason, setReason] = useState('')
  const { showToast } = useToast()

  const start = (action: ModerationAction) => {
    if (action === 'rejected' || action === 'suspended') {
      setConfirmingAction(action)

      return
    }

    onModerate(action)
  }

  const confirm = () => {
    if (!confirmingAction) {
      return
    }

    if (confirmingAction === 'rejected' && reason.trim() === '') {
      showToast('A reason is required so the provider knows what to fix.', 'error')

      return
    }

    onModerate(confirmingAction, reason.trim())
    setConfirmingAction(null)
    setReason('')
  }

  return (
    <section className="card p-5">
      <h2 className="text-lg font-bold text-ink-900">Decision</h2>

      {confirmingAction ? (
        <div className="mt-3 flex flex-col gap-3">
          <label htmlFor="reason" className="text-sm font-semibold text-ink-800">
            Reason {confirmingAction === 'rejected' ? '(required)' : '(optional)'}
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            className="w-full rounded-xl border border-ink-200 px-3.5 py-3 text-sm focus:border-ink-900 focus:ring-2 focus:ring-brand-300 focus:outline-none"
            placeholder="Explain what needs to change…"
          />
          <div className="flex gap-2">
            <Button variant="danger" isLoading={isPending} onClick={confirm}>
              Confirm {confirmingAction === 'rejected' ? 'rejection' : 'suspension'}
            </Button>
            <Button variant="ghost" onClick={() => setConfirmingAction(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {provider.approval_status === 'pending' ? (
            <>
              <Button
                isFullWidth
                isLoading={isPending}
                onClick={() => start('approved')}
                leadingIcon={<CircleCheck className="size-4" />}
              >
                Approve &amp; publish
              </Button>
              <Button
                isFullWidth
                variant="danger"
                onClick={() => start('rejected')}
                leadingIcon={<X className="size-4" />}
              >
                Reject with reason
              </Button>
            </>
          ) : null}

          {provider.approval_status === 'approved' ? (
            <Button
              isFullWidth
              variant="danger"
              onClick={() => start('suspended')}
              leadingIcon={<PauseCircle className="size-4" />}
            >
              Suspend listing
            </Button>
          ) : null}

          {provider.approval_status === 'suspended' ? (
            <Button
              isFullWidth
              isLoading={isPending}
              onClick={() => start('reactivated')}
              leadingIcon={<Play className="size-4" />}
            >
              Reactivate listing
            </Button>
          ) : null}

          {provider.approval_status === 'draft' || provider.approval_status === 'rejected' ? (
            <p className="text-sm leading-relaxed text-ink-500">
              This profile is with the provider. It will return here once they submit it.
            </p>
          ) : null}

          {provider.is_publicly_visible ? (
            <Link to={`/providers/${provider.slug}`} className="mt-1">
              <Button variant="ghost" isFullWidth>
                View public profile
              </Button>
            </Link>
          ) : null}
        </div>
      )}
    </section>
  )
}
