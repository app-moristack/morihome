import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { BadgeCheck, Star } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

type VerifiedBadgeProps = {
  isVerified: boolean
  isFeatured?: boolean
}

export function VerifiedBadge({ isVerified, isFeatured = false }: VerifiedBadgeProps) {
  useLocale()
  return (
    <>
      {isFeatured ? (
        <Badge tone="brand" icon={<Star className="size-3.5 fill-current" aria-hidden />}>
          {t('Featured')}
        </Badge>
      ) : null}
      {isVerified ? (
        <Badge tone="success" icon={<BadgeCheck className="size-3.5" aria-hidden />}>
          {t('Verified')}
        </Badge>
      ) : null}
    </>
  )
}
