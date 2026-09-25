import { apiRequest, buildQueryString } from './client'
import type {
  AdminDashboard,
  AdminUser,
  AuthenticatedUser,
  ContactChannel,
  GeocodeSuggestion,
  Locality,
  ModerationEvent,
  OpeningHour,
  OwnedProvider,
  Paginated,
  PortfolioImage,
  ProfileCompleteness,
  PropertyListing,
  PropertyListingLimit,
  ProviderSummary,
  PublicProvider,
  SearchParams,
  ServiceCategory,
  Subscription,
  SubscriptionMembership,
} from '@/types/api'

type Envelope<T> = { data: T }
type EnvelopeWithMeta<T, M> = { data: T; meta: M }

export const publicApi = {
  recordPageView: (payload: { event_id: string; path: string }) =>
    apiRequest<void>('/page-views', { method: 'POST', body: payload }),
  sendContactMessage: (payload: {
    name: string
    email: string
    phone?: string
    subject: string
    message: string
  }) => apiRequest<{ message: string }>('/contact-message', { method: 'POST', body: payload }),

  featuredProviders: () =>
    apiRequest<Envelope<ProviderSummary[]>>('/providers/featured').then((response) => response.data),

  categories: (popularOnly = false) =>
    apiRequest<Envelope<ServiceCategory[]>>(`/categories${popularOnly ? '?popular_only=1' : ''}`).then(
      (response) => response.data,
    ),

  subscriptions: () =>
    apiRequest<Envelope<Subscription[]>>('/subscriptions').then((response) => response.data),

  localities: () => apiRequest<Envelope<Locality[]>>('/localities').then((response) => response.data),

  suggestAddresses: (term: string, signal?: AbortSignal) =>
    apiRequest<Envelope<GeocodeSuggestion[]>>(`/geocode/suggest?${buildQueryString({ q: term, limit: 6 })}`, {
      signal,
    }).then((response) => response.data),

  reverseGeocode: (latitude: number, longitude: number) =>
    apiRequest<Envelope<GeocodeSuggestion | null>>(
      `/geocode/reverse?${buildQueryString({ latitude, longitude })}`,
    ).then((response) => response.data),

  searchProviders: (params: SearchParams, signal?: AbortSignal) =>
    apiRequest<Paginated<ProviderSummary>>(`/providers/search?${buildQueryString(params)}`, { signal }),

  searchProperties: (params: {
    purpose?: 'rental' | 'sales'
    property_type?: 'house' | 'apartment' | 'villa' | 'land' | 'commercial' | 'other'
    location?: string
    min_price?: number
    max_price?: number
    bedrooms?: number
    bathrooms?: number
    min_area?: number
    is_furnished?: boolean
    amenities?: string[]
    sort?: 'newest' | 'price_asc' | 'price_desc'
    featured_only?: boolean
    page?: number
  }) => apiRequest<Paginated<PropertyListing>>(`/properties/search?${buildQueryString(params)}`),

  property: (slug: string) =>
    apiRequest<Envelope<PropertyListing>>(`/properties/${encodeURIComponent(slug)}`).then(
      (response) => response.data,
    ),

  providerProperties: (slug: string, page = 1) =>
    apiRequest<Paginated<PropertyListing>>(`/providers/${encodeURIComponent(slug)}/properties?page=${page}`),

  provider: (slug: string) =>
    apiRequest<Envelope<PublicProvider>>(`/providers/${slug}`).then((response) => response.data),

  recordContact: (
    slug: string,
    payload: { channel: ContactChannel; service_category_id?: number; source?: string },
  ) => apiRequest<void>(`/providers/${slug}/contact-events`, { method: 'POST', body: payload }),
}

export type RegistrationPayload = {
  provider_type: string
  name: string
  phone: string
  whatsapp_phone?: string
  email?: string
  password: string
  password_confirmation: string
  description?: string
  address: string
  locality: string
  latitude: number
  longitude: number
  service_areas?: string[]
  service_categories?: number[]
  subscription_ids: number[]
  accepts_terms: boolean
}

export const authApi = {
  register: (payload: RegistrationPayload) =>
    apiRequest<Envelope<AuthenticatedUser>>('/register', { method: 'POST', body: payload }).then(
      (response) => response.data,
    ),

  login: (payload: { identifier: string; password: string; remember?: boolean }) =>
    apiRequest<Envelope<AuthenticatedUser>>('/login', { method: 'POST', body: payload }).then(
      (response) => response.data,
    ),

  logout: () => apiRequest<void>('/logout', { method: 'POST' }),

  currentUser: () => apiRequest<Envelope<AuthenticatedUser>>('/user').then((response) => response.data),

  updatePassword: (payload: { current_password: string; password: string; password_confirmation: string }) =>
    apiRequest<void>('/password', { method: 'PUT', body: payload }),

  requestPasswordReset: (email: string) =>
    apiRequest<{ message: string }>('/forgot-password', { method: 'POST', body: { email } }),

  resetPassword: (payload: {
    token: string
    email: string
    password: string
    password_confirmation: string
  }) => apiRequest<{ message: string }>('/reset-password', { method: 'POST', body: payload }),
}

export const providerApi = {
  profile: () =>
    apiRequest<EnvelopeWithMeta<OwnedProvider, { completeness: ProfileCompleteness }>>('/provider/profile'),

  updateProfile: (payload: Record<string, unknown>) =>
    apiRequest<Envelope<OwnedProvider>>('/provider/profile', { method: 'PUT', body: payload }).then(
      (response) => response.data,
    ),

  submitForReview: () =>
    apiRequest<Envelope<OwnedProvider>>('/provider/profile/submit', { method: 'POST' }).then(
      (response) => response.data,
    ),

  uploadBrandImage: (kind: 'logo' | 'cover', file: File) => {
    const body = new FormData()
    body.append('image', file)

    return apiRequest<Envelope<OwnedProvider>>(`/provider/profile/images/${kind}`, {
      method: 'POST',
      body,
    }).then((response) => response.data)
  },

  portfolio: () =>
    apiRequest<Envelope<PortfolioImage[]>>('/provider/portfolio').then((response) => response.data),

  uploadPortfolioImage: (file: File, caption?: string) => {
    const body = new FormData()
    body.append('image', file)

    if (caption) {
      body.append('caption', caption)
    }

    return apiRequest<Envelope<PortfolioImage>>('/provider/portfolio', { method: 'POST', body }).then(
      (response) => response.data,
    )
  },

  reorderPortfolio: (imageIds: number[]) =>
    apiRequest<Envelope<PortfolioImage[]>>('/provider/portfolio/order', {
      method: 'PUT',
      body: { image_ids: imageIds },
    }).then((response) => response.data),

  deletePortfolioImage: (imageId: number) =>
    apiRequest<void>(`/provider/portfolio/${imageId}`, { method: 'DELETE' }),

  updateOpeningHours: (hours: OpeningHour[]) =>
    apiRequest<Envelope<OpeningHour[]>>('/provider/opening-hours', { method: 'PUT', body: { hours } }).then(
      (response) => response.data,
    ),

  subscriptions: () =>
    apiRequest<Envelope<Subscription[]>>('/provider/subscriptions').then((response) => response.data),

  requestSubscriptions: (subscriptionIds: number[]) =>
    apiRequest<Envelope<Subscription[]>>('/provider/subscriptions', {
      method: 'POST',
      body: { subscription_ids: subscriptionIds },
    }).then((response) => response.data),

  propertyListings: () =>
    apiRequest<
      EnvelopeWithMeta<PropertyListing[], { limits: Record<'rental' | 'sales', PropertyListingLimit | null> }>
    >('/provider/property-listings'),

  createPropertyListing: (payload: Record<string, unknown>) =>
    apiRequest<Envelope<PropertyListing>>('/provider/property-listings', {
      method: 'POST',
      body: payload,
    }).then((response) => response.data),

  uploadPropertyImage: (slug: string, file: File) => {
    const body = new FormData()
    body.append('image', file)

    return apiRequest(`/provider/property-listings/${slug}/images`, { method: 'POST', body })
  },
}

export const adminApi = {
  dashboard: (days = 30) =>
    apiRequest<Envelope<AdminDashboard>>(`/admin/dashboard?days=${days}`).then((response) => response.data),
  users: (params: { term?: string; type?: string; status?: string; page?: number }) =>
    apiRequest<Paginated<AdminUser>>(`/admin/users?${buildQueryString(params)}`),

  searchProviders: (payload: { status?: string; term?: string; page?: number; limit?: number }) =>
    apiRequest<{
      data: Pick<
        OwnedProvider,
        'id' | 'name' | 'locality' | 'phone' | 'submitted_at' | 'approved_at' | 'approval_status'
      >[]
      total: number
      current_page: number
      last_page: number
    }>('/admin/rest/providers/search', {
      method: 'POST',
      body: {
        search: {
          filters: payload.status ? [{ field: 'approval_status', operator: '=', value: payload.status }] : [],
          ...(payload.term ? { text: { value: payload.term } } : {}),
          sorts: [{ field: 'created_at', direction: 'desc' }],
          page: payload.page ?? 1,
          limit: payload.limit ?? 25,
        },
      },
    }),

  provider: (id: number) =>
    apiRequest<Envelope<OwnedProvider>>(`/admin/providers/${id}`).then((response) => response.data),

  history: (id: number) =>
    apiRequest<Envelope<ModerationEvent[]>>(`/admin/providers/${id}/history`).then(
      (response) => response.data,
    ),

  moderate: (id: number, action: 'approved' | 'rejected' | 'suspended' | 'reactivated', reason?: string) =>
    apiRequest<Envelope<OwnedProvider>>(`/admin/providers/${id}/${action}`, {
      method: 'POST',
      body: { reason },
    }).then((response) => response.data),

  categories: () =>
    apiRequest<{ data: ServiceCategory[] }>('/admin/categories').then((response) => response.data),

  saveCategory: (attributes: Record<string, unknown>, id?: number) =>
    apiRequest<{ data: unknown }>(id ? `/admin/categories/${id}` : '/admin/categories', {
      method: id ? 'PUT' : 'POST',
      body: attributes,
    }),

  subscriptions: (params: { state?: string; term?: string; page?: number }) =>
    apiRequest<Paginated<SubscriptionMembership>>(`/admin/subscriptions?${buildQueryString(params)}`),

  activateSubscription: (membershipId: number, startsAt: string, endsAt: string) =>
    apiRequest<Envelope<SubscriptionMembership>>(`/admin/subscriptions/${membershipId}`, {
      method: 'PUT',
      body: { starts_at: startsAt, ends_at: endsAt },
    }).then((response) => response.data),
}
