import { apiRequest, buildQueryString } from './client'
import type {
  AdminDashboard,
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
  ProviderSummary,
  PublicProvider,
  SearchParams,
  ServiceCategory,
} from '@/types/api'

type Envelope<T> = { data: T }
type EnvelopeWithMeta<T, M> = { data: T; meta: M }

export const publicApi = {
  featuredProviders: () =>
    apiRequest<Envelope<ProviderSummary[]>>('/providers/featured').then((response) => response.data),

  categories: (popularOnly = false) =>
    apiRequest<Envelope<ServiceCategory[]>>(`/categories${popularOnly ? '?popular_only=1' : ''}`).then(
      (response) => response.data,
    ),

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
  service_categories: number[]
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
}

export const adminApi = {
  dashboard: () => apiRequest<Envelope<AdminDashboard>>('/admin/dashboard').then((response) => response.data),

  searchProviders: (payload: { status?: string; term?: string; page?: number; limit?: number }) =>
    apiRequest<{ data: OwnedProvider[]; meta: { total: number; current_page: number; last_page: number } }>(
      '/admin/rest/providers/search',
      {
        method: 'POST',
        body: {
          search: {
            filters: payload.status
              ? [{ field: 'approval_status', operator: '=', value: payload.status }]
              : [],
            ...(payload.term ? { text: { value: payload.term } } : {}),
            sorts: [{ field: 'created_at', direction: 'desc' }],
            page: payload.page ?? 1,
            limit: payload.limit ?? 25,
          },
        },
      },
    ),

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
    apiRequest<{ data: ServiceCategory[] }>('/admin/rest/service-categories/search', {
      method: 'POST',
      body: { search: { sorts: [{ field: 'sort_order', direction: 'asc' }], limit: 100 } },
    }).then((response) => response.data),

  saveCategory: (attributes: Record<string, unknown>, id?: number) =>
    apiRequest<{ data: unknown }>('/admin/rest/service-categories/mutate', {
      method: 'POST',
      body: {
        mutate: [id ? { operation: 'update', key: id, attributes } : { operation: 'create', attributes }],
      },
    }),
}
