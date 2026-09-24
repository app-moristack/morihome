import { categoryLabel } from '@/i18n/labels'
import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { MessageCircle } from 'lucide-react'
import { publicApi } from '@/api/endpoints'
import { Button } from '@/components/ui/Button'
import { buildWhatsappUrl } from '@/lib/whatsapp'
import { useToast } from '@/hooks/useToast'

type WhatsappButtonProps = {
  slug: string
  number: string | null | undefined
  serviceName?: string | null
  serviceCategoryId?: number
  source: 'search' | 'profile' | 'home'
  variant?: 'whatsapp' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  isFullWidth?: boolean
  label?: string
}

export function WhatsappButton({
  slug,
  number,
  serviceName,
  serviceCategoryId,
  source,
  variant = 'whatsapp',
  size = 'md',
  isFullWidth = false,
  label = 'WhatsApp',
}: WhatsappButtonProps) {
  useLocale()
  const { showToast } = useToast()
  const href = buildWhatsappUrl({ number, serviceName })

  if (!href) {
    return null
  }

  const handleClick = () => {
    // Analytics must never delay the hand-off to WhatsApp, so this is fire-and-forget.
    publicApi
      .recordContact(slug, {
        channel: 'whatsapp',
        ...(serviceCategoryId ? { service_category_id: serviceCategoryId } : {}),
        source,
      })
      .catch(() => undefined)

    showToast('Opening WhatsApp…', 'info')
  }

  return (
    <Button
      variant={variant}
      size={size}
      isFullWidth={isFullWidth}
      leadingIcon={<MessageCircle className="size-4" />}
      onClick={() => {
        handleClick()
        window.open(href, '_blank', 'noopener,noreferrer')
      }}
      aria-label={
        serviceName
          ? t('Contact on WhatsApp about {service}', { service: categoryLabel(serviceName) })
          : t('Contact on WhatsApp')
      }
    >
      {t(label)}
    </Button>
  )
}
