export type ProviderTypeValue = 'individual' | 'agency'

export type SubscriptionCategoryValue = 'services' | 'rental' | 'sales'

export type SubscriptionTierValue = 'free' | 'plus' | 'pro'

export type Subscription = {
  id: number
  category: SubscriptionCategoryValue
  category_label: string
  tier: SubscriptionTierValue
  tier_label: string
  slug: string
  name: string
  description: string
  price_rupees: number
  duration_months: number | null
  active_item_limit: number
  photos_per_item_limit: number
  item_duration_months: number | null
  business_verification_eligible: boolean
  priority_in_search: boolean
  featured_items: boolean
  homepage_exposure: boolean
  membership?: {
    id: number
    starts_at: string | null
    ends_at: string | null
    state: 'awaiting_approval' | 'active' | 'inactive'
    approved_at: string | null
  }
}

export type SubscriptionMembership = {
  id: number
  state: 'awaiting_approval' | 'active' | 'inactive'
  starts_at: string | null
  ends_at: string | null
  requested_at: string
  approved_at: string | null
  subscription: Subscription
  user: {
    id: number
    name: string
    phone: string
    email: string | null
    provider_type: ProviderTypeValue
  }
}

export type PropertyListingImage = {
  id: number
  url: string
  caption: string | null
  width: number | null
  height: number | null
  sort_order: number
}

export type PropertyListing = {
  id: number
  slug: string
  purpose: 'rental' | 'sales'
  property_type: 'house' | 'apartment' | 'villa' | 'land' | 'commercial' | 'other'
  title: string
  description: string
  price_rupees: number
  bedrooms: number | null
  bathrooms: number | null
  area_sqm: number | null
  is_furnished: boolean | null
  amenities?: string[]
  address: string
  locality: string
  latitude: number
  longitude: number
  status: 'draft' | 'published' | 'archived' | 'expired'
  expires_at: string | null
  images: PropertyListingImage[]
  photo_limit: number
  provider?: {
    logo_url?: string | null
    profile_available?: boolean
    name: string
    slug: string
    phone: string
    whatsapp_phone: string | null
    is_verified: boolean
  }
}

export type PropertyListingLimit = {
  plan: string
  listing_limit: number
  used: number
  remaining: number
  photos_per_listing: number
}

export type ApprovalStatusValue = 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended'

export type ContactChannel = 'whatsapp' | 'phone' | 'email' | 'website'

export type SortOption = 'recommended' | 'distance'

export type ServiceCategoryTag = {
  id: number
  name: string
  slug: string
  icon: string | null
}

export type ServiceCategory = ServiceCategoryTag & {
  is_active?: boolean
  description: string | null
  is_popular: boolean
  sort_order: number
  parent_id: number | null
  children?: ServiceCategory[]
  specialty?: string | null
  is_primary?: boolean
}

export type Locality = {
  id: number
  name: string
  slug: string
  district: string
  latitude: number
  longitude: number
}

export type GeocodeSuggestion = {
  label: string
  locality: string | null
  district: string | null
  latitude: number
  longitude: number
  source: string
}

export type ProviderSummary = {
  id: number
  slug: string
  name: string
  provider_type: ProviderTypeValue
  provider_type_label: string
  excerpt: string
  locality: string
  approximate_latitude?: number
  approximate_longitude?: number
  logo_url: string | null
  cover_url: string | null
  is_verified: boolean
  is_featured: boolean
  distance_km?: number
  whatsapp_number: string | null
  service_categories: ServiceCategoryTag[]
}

export type PortfolioImage = {
  id: number
  url: string
  caption: string | null
  width: number | null
  height: number | null
  sort_order: number
}

export type OpeningHour = {
  day_of_week: number
  is_closed: boolean
  opens_at: string | null
  closes_at: string | null
}

export type PublicProvider = {
  id: number
  slug: string
  name: string
  provider_type: ProviderTypeValue
  provider_type_label: string
  description: string | null
  locality: string
  service_areas: string[] | null
  approximate_latitude: number
  approximate_longitude: number
  distance_km?: number
  phone: string
  whatsapp_number: string | null
  whatsapp_display: string | null
  email: string | null
  website: string | null
  social_links: Record<string, string> | null
  logo_url: string | null
  cover_url: string | null
  is_verified: boolean
  is_featured: boolean
  approved_at: string | null
  service_categories: ServiceCategory[]
  portfolio_images: PortfolioImage[]
  opening_hours: OpeningHour[]
}

export type OwnedProvider = {
  service_selection_limit: number
  id: number
  slug: string
  name: string
  provider_type: ProviderTypeValue
  description: string | null
  phone: string
  whatsapp_phone: string | null
  email: string | null
  website: string | null
  social_links: Record<string, string> | null
  address: string
  locality: string
  latitude: number
  longitude: number
  service_areas: string[] | null
  logo_url: string | null
  cover_url: string | null
  approval_status: ApprovalStatusValue
  approval_status_label: string
  can_submit_for_review: boolean
  is_publicly_visible: boolean
  is_verified: boolean
  is_featured: boolean
  rejection_reason: string | null
  submitted_at: string | null
  approved_at: string | null
  service_categories: ServiceCategory[]
  portfolio_images: PortfolioImage[]
  opening_hours: OpeningHour[]
}

export type AuthenticatedUser = {
  id: number
  name: string
  phone: string
  email: string | null
  roles: string[]
  subscriptions?: Subscription[]
  provider?: OwnedProvider | null
}

export type ProfileCompleteness = {
  percentage: number
  missing_required: string[]
  missing_recommended: string[]
}

export type ModerationEvent = {
  id: number
  action: string
  from_status: ApprovalStatusValue | null
  to_status: ApprovalStatusValue
  reason: string | null
  changed_fields: string[] | null
  actor: { id: number; name: string } | null
  created_at: string
}

export type AdminDashboard = {
  period: { days: number; start: string; end: string }
  metrics: Record<'users' | 'individuals' | 'businesses' | 'views', AdminMetric>
  user_status: Record<AdminUserStatus, number>
  overview: { start: string; end: string; individuals: number; businesses: number; views: number }[]
  recent_users: AdminUser[]
  categories: Pick<ServiceCategory, 'id' | 'name' | 'slug' | 'icon' | 'is_active' | 'sort_order'>[]
  top_pages: { path: string; views: number }[]
  tracking_started_at: string | null
  providers: Record<ApprovalStatusValue, number>
  service_categories: { total: number; active: number }
  contact_events_last_30_days: number
  recent_registrations: ProviderSummary[]
}

export type AdminMetric = { total: number; current: number; previous: number; change_percent: number | null }
export type AdminUserStatus = 'active' | 'pending' | 'suspended' | 'inactive'
export type AdminUser = {
  id: number
  name: string
  account_name: string
  email: string | null
  phone: string
  type: ProviderTypeValue | 'account'
  roles: string[]
  locality: string | null
  logo_url: string | null
  service: string | null
  status: AdminUserStatus
  joined_at: string
  provider_id: number | null
  provider_slug: string | null
  approval_status: ApprovalStatusValue | null
}

export type PaginationMeta = {
  current_page: number
  from: number | null
  last_page: number
  per_page: number
  to: number | null
  total: number
  search?: {
    latitude: number | null
    longitude: number | null
    radius_km: number | null
    sort: SortOption
  }
}

export type Paginated<T> = {
  data: T[]
  links: { first: string | null; last: string | null; prev: string | null; next: string | null }
  meta: PaginationMeta
}

export type SearchParams = {
  address?: string
  latitude?: number
  longitude?: number
  radius_km?: number
  service_category_id?: number
  provider_types?: ProviderTypeValue[]
  locality?: string
  has_whatsapp?: boolean
  verified_only?: boolean
  term?: string
  sort?: SortOption
  per_page?: number
  page?: number
}
