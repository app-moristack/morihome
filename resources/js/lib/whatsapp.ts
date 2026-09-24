import { t } from '@/i18n'
import { categoryLabel } from '@/i18n/labels'
import { bootstrap } from './bootstrap'

const WHATSAPP_ENDPOINT = 'https://wa.me/'

export type WhatsappLinkOptions = {
  number: string | null | undefined
  serviceName?: string | null
  appName?: string
  template?: string
}

export function buildWhatsappMessage({
  serviceName,
  appName,
  template,
}: Omit<WhatsappLinkOptions, 'number'>): string {
  const sourceTemplate = template ?? bootstrap.whatsappTemplate
  const resolvedTemplate =
    sourceTemplate === 'Hello, I found your profile on :app. I am looking for help with :service.'
      ? t(sourceTemplate)
      : sourceTemplate
  const resolvedApp = appName ?? bootstrap.appName

  return resolvedTemplate
    .replaceAll(':app', resolvedApp)
    .replaceAll(':service', serviceName ? categoryLabel(serviceName).toLowerCase() : t('a project at home'))
}

export function buildWhatsappUrl(options: WhatsappLinkOptions): string | null {
  const digits = options.number?.replace(/\D/g, '') ?? ''

  if (digits.length < 8) {
    return null
  }

  const message = buildWhatsappMessage(options)

  return `${WHATSAPP_ENDPOINT}${digits}?text=${encodeURIComponent(message)}`
}

export function buildTelUrl(phone: string | null | undefined): string | null {
  const digits = phone?.replace(/[^\d+]/g, '') ?? ''

  return digits.length >= 7 ? `tel:${digits}` : null
}
