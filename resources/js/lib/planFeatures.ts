import { t } from '@/i18n'
import type { Subscription } from '@/types/api'

export function planFeatures(subscription: Subscription): string[] {
  const services = subscription.category === 'services'
  const count = subscription.active_item_limit
  const features = [
    t(
      services
        ? count === 1
          ? '{count} active service'
          : '{count} active services'
        : count === 1
          ? '{count} active listing'
          : '{count} active listings',
      { count },
    ),
    t(services ? '{count} photos per service' : '{count} photos per property', {
      count: subscription.photos_per_item_limit,
    }),
  ]
  features.push(
    subscription.item_duration_months
      ? t('{count}-month listing duration', { count: subscription.item_duration_months })
      : t('No service expiry while active'),
  )
  if (subscription.business_verification_eligible) features.push(t('Business verification eligible'))
  if (subscription.priority_in_search) features.push(t('Priority in search'))
  if (subscription.featured_items) features.push(t(services ? 'Featured services' : 'Featured properties'))
  if (subscription.homepage_exposure) features.push(t('Homepage exposure'))

  return features
}
