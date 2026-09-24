import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { CircleAlert, CircleCheck, Clock, Eye, PauseCircle, Send } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { formatFieldName } from '@/lib/format'
import type { ApprovalStatusValue, OwnedProvider, ProfileCompleteness } from '@/types/api'

type ApprovalStatusCardProps = {
  provider: OwnedProvider
  completeness: ProfileCompleteness
  onSubmit: () => void
  isSubmitting: boolean
}

type StatusPresentation = {
  icon: ReactNode
  headline: string
  body: string
  className: string
}

const PRESENTATION: Record<ApprovalStatusValue, StatusPresentation> = {
  draft: {
    icon: <Clock className="size-6" aria-hidden />,
    headline: 'Your profile is a draft',
    body: 'Complete the required details, then submit it so our team can review and publish it.',
    className: 'bg-ink-100 text-ink-700',
  },
  pending: {
    icon: <Clock className="size-6" aria-hidden />,
    headline: 'Waiting for validation',
    body: 'Our team is reviewing your profile. You can keep editing it while you wait — it is not yet visible in public search.',
    className: 'bg-amber-50 text-warning',
  },
  approved: {
    icon: <CircleCheck className="size-6" aria-hidden />,
    headline: 'Your profile is live',
    body: 'Customers within your area can find you and message you on WhatsApp.',
    className: 'bg-emerald-50 text-success',
  },
  rejected: {
    icon: <CircleAlert className="size-6" aria-hidden />,
    headline: 'Changes needed before publication',
    body: 'Fix the points below, then submit your profile again.',
    className: 'bg-red-50 text-danger',
  },
  suspended: {
    icon: <PauseCircle className="size-6" aria-hidden />,
    headline: 'Your listing is suspended',
    body: 'Your profile is hidden from public search. Contact support if you believe this is a mistake.',
    className: 'bg-red-50 text-danger',
  },
}

export function ApprovalStatusCard({
  provider,
  completeness,
  onSubmit,
  isSubmitting,
}: ApprovalStatusCardProps) {
  useLocale()
  const presentation = PRESENTATION[provider.approval_status]

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex gap-4">
        <div className={`grid size-12 shrink-0 place-items-center rounded-xl ${presentation.className}`}>
          {presentation.icon}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-ink-900">{t(presentation.headline)}</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-500">{t(presentation.body)}</p>

          {provider.rejection_reason ? (
            <p className="mt-3 rounded-xl border border-danger/30 bg-red-50 p-3 text-sm text-danger">
              <strong className="font-semibold">{t('Reviewer note:')}</strong> {provider.rejection_reason}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-ink-700">{t('Profile completeness')}</span>
          <span className="font-bold text-ink-900">{completeness.percentage}%</span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100"
          role="progressbar"
          aria-valuenow={completeness.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('Profile completeness')}
        >
          <div
            className="h-full rounded-full bg-brand-400 transition-[width] duration-500 ease-[var(--ease-out-soft)]"
            style={{ width: `${completeness.percentage}%` }}
          />
        </div>

        {completeness.missing_required.length > 0 ? (
          <p className="mt-2.5 text-sm text-danger">
            {t('Still required:')} {completeness.missing_required.map(formatFieldName).join(', ')}
          </p>
        ) : completeness.missing_recommended.length > 0 ? (
          <p className="mt-2.5 text-sm text-ink-500">
            {t('Recommended:')} {completeness.missing_recommended.map(formatFieldName).join(', ')}
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {provider.can_submit_for_review ? (
          <Button
            onClick={onSubmit}
            isLoading={isSubmitting}
            disabled={completeness.missing_required.length > 0}
            leadingIcon={<Send className="size-4" />}
          >
            {t('Submit for review')}
          </Button>
        ) : null}

        {provider.is_publicly_visible ? (
          <Link to={`/providers/${provider.slug}`}>
            <Button variant="ghost" leadingIcon={<Eye className="size-4" />}>
              {t('View public profile')}
            </Button>
          </Link>
        ) : null}
      </div>
    </section>
  )
}
