import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { Compass } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export function NotFoundPage() {
  useLocale()
  return (
    <div className="container-page max-w-xl py-16">
      <EmptyState
        icon={<Compass className="size-6" aria-hidden />}
        title={t('This page does not exist')}
        description={t('The link may be outdated, or the profile may have been removed from the directory.')}
        action={
          <Link to="/">
            <Button variant="secondary">{t('Back to home')}</Button>
          </Link>
        }
      />
    </div>
  )
}
