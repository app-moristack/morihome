import { t } from './index'

const CATEGORIES = new Set([
  'Plumber',
  'Mason',
  'Electrician',
  'Painter',
  'Carpenter',
  'Tiler',
  'Gardener',
  'Landscaper',
  'Welder',
  'Aluminium & Glazing',
  'Roofing & Waterproofing',
  'Air Conditioning',
  'Pool Services',
  'Cleaning',
  'Pest Control',
  'General Handyman',
  'Architect & Designer',
  'Contractor',
  'Building Materials Supplier',
  'Equipment & Tool Rental',
])

/** Only translate the built-in taxonomy; custom category names remain as authored. */
export function categoryLabel(name: string): string {
  return CATEGORIES.has(name) ? t(name) : name
}

const PLAN_DESCRIPTIONS = new Set([
  'For individual tradespeople getting started.',
  'More services and photos with business verification eligibility.',
  'Maximum service visibility and capacity.',
  'For individuals listing one rental property.',
  'More rental listings with featured placement.',
  'Maximum rental visibility and capacity.',
  'For individuals listing one property for sale.',
  'More sale listings with featured placement.',
  'Maximum property sale visibility and capacity.',
])

export function planLabel(name: string): string {
  return /^(Services|Rental|Sales) (Free|Plus|Pro)$/.test(name) || PLAN_DESCRIPTIONS.has(name)
    ? t(name)
    : name
}

const ENUM_LABELS: Record<string, string> = {
  individual: 'Individual worker',
  agency: 'Agency/Business',
  house: 'House',
  apartment: 'Apartment',
  villa: 'Villa',
  land: 'Land',
  commercial: 'Commercial',
  other: 'Other',
  rental: 'Rental',
  sales: 'Sales',
  services: 'Services',
  free: 'Free',
  plus: 'Plus',
  pro: 'Pro',
  draft: 'Draft',
  pending: 'Pending validation',
  approved: 'Approved',
  rejected: 'Rejected',
  suspended: 'Suspended',
  active: 'Active',
  inactive: 'Inactive',
  awaiting_approval: 'Awaiting approval',
  published: 'Published',
  expired: 'Expired',
  cancelled: 'Cancelled',
  reactivated: 'Reactivated',
  profile_updated: 'Profile Updated',
  profile_submitted: 'Profile Submitted',
}

export function enumLabel(value: string): string {
  return t(
    ENUM_LABELS[value] ?? value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
  )
}
