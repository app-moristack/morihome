import { BadgeCheck, Star } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

type VerifiedBadgeProps = {
  isVerified: boolean
  isFeatured?: boolean
}

export function VerifiedBadge({ isVerified, isFeatured = false }: VerifiedBadgeProps) {
  return (
    <>
      {isFeatured ? (
        <Badge tone="brand" icon={<Star className="size-3.5 fill-current" aria-hidden />}>
          Featured
        </Badge>
      ) : null}
      {isVerified ? (
        <Badge tone="success" icon={<BadgeCheck className="size-3.5" aria-hidden />}>
          Verified
        </Badge>
      ) : null}
    </>
  )
}
