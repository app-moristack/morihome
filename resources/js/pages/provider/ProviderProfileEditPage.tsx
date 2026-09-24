import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { TriangleAlert } from 'lucide-react'
import { BrandImageUploader } from '@/components/dashboard/BrandImageUploader'
import { ProfileForm } from '@/components/dashboard/ProfileForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { useOwnProfile } from '@/hooks/useProviderQueries'

const SENSITIVE_NOTICE =
  'Changing your name, phone, location or services sends an approved profile back for a quick re-check before it is public again.'

export default function ProviderProfileEditPage() {
  useLocale()
  const { data, isLoading, isError } = useOwnProfile()

  if (isLoading) {
    return <Spinner label={t('Loading your profile')} />
  }

  if (isError || !data) {
    return (
      <div className="container-page py-12">
        <EmptyState
          tone="danger"
          icon={<TriangleAlert className="size-6" aria-hidden />}
          title={t('We could not load your profile')}
          description={t('Please refresh the page or sign in again.')}
        />
      </div>
    )
  }

  const provider = data.data

  return (
    <div className="container-page max-w-3xl py-8 sm:py-10">
      <PageHeader eyebrow={t('Provider dashboard')} title={t('Edit your profile')} />

      <div className="mt-5 flex gap-3 rounded-xl border border-brand-300 bg-brand-50 p-4">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden />
        <p className="text-sm leading-relaxed text-ink-700">{t(SENSITIVE_NOTICE)}</p>
      </div>

      <div className="mt-6">
        <BrandImageUploader provider={provider} />
      </div>

      <div className="mt-6">
        <ProfileForm key={provider.id} provider={provider} />
      </div>
    </div>
  )
}
