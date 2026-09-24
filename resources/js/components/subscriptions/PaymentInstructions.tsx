import { t, getFormatLocale } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { CircleCheck, MessageCircle, Smartphone } from 'lucide-react'
import type { Subscription } from '@/types/api'

const PAYMENT_NUMBER = '+23057079335'

type PaymentInstructionsProps = {
  subscriptions: Subscription[]
  isAfterRequest?: boolean
}

export function PaymentInstructions({ subscriptions, isAfterRequest = false }: PaymentInstructionsProps) {
  useLocale()
  const total = subscriptions.reduce((sum, subscription) => sum + subscription.price_rupees, 0)

  if (subscriptions.length === 0) return null

  if (total === 0) {
    return (
      <div className="rounded-xl border border-success/30 bg-green-50 p-4 text-sm text-ink-700">
        <strong className="flex items-center gap-2 text-ink-900">
          <CircleCheck className="size-5 text-success" aria-hidden /> {t('No payment required')}
        </strong>
        <p className="mt-1">{t('Your free subscription request will await admin approval.')}</p>
      </div>
    )
  }

  return (
    <section
      className="rounded-xl border border-brand-300 bg-brand-50 p-4"
      aria-label={t('Payment procedure')}
    >
      <h3 className="font-bold text-ink-900">
        {isAfterRequest
          ? t('Complete payment to activate your request')
          : t('Payment after account creation')}
      </h3>
      <p className="mt-1 text-sm text-ink-600">
        {t('Total:')} <strong className="text-ink-900">Rs {total.toLocaleString(getFormatLocale())}</strong>
      </p>
      <ol className="mt-3 grid gap-3 text-sm text-ink-700">
        <li className="flex gap-3">
          <Smartphone className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden />
          <span>
            {t('Send the full amount by')} <strong>Juice</strong> {t('to')}{' '}
            <a className="font-bold underline" href={`tel:${PAYMENT_NUMBER}`}>
              {PAYMENT_NUMBER}
            </a>
            .
          </span>
        </li>
        <li className="flex gap-3">
          <MessageCircle className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
          <span>
            {t('Send your proof of payment on WhatsApp to')}{' '}
            <a
              className="font-bold underline"
              href={`https://wa.me/${PAYMENT_NUMBER.replace('+', '')}`}
              target="_blank"
              rel="noreferrer"
            >
              {PAYMENT_NUMBER}
            </a>
            .
          </span>
        </li>
      </ol>
      <p className="mt-3 text-xs font-medium text-ink-500">
        {t('An admin will verify the payment, set the start and end dates, and activate the subscription.')}
      </p>
    </section>
  )
}
