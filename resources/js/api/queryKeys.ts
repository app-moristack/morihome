import { getLocale } from '@/i18n'
import type { SearchParams } from '@/types/api'

export const queryKeys = {
  featuredProviders: () => ['providers', 'featured', getLocale()] as const,
  featuredProperties: (purpose: 'rental' | 'sales') =>
    ['properties', 'featured', purpose, getLocale()] as const,
  categories: (popularOnly = false) => ['categories', { popularOnly }, getLocale()] as const,
  subscriptions: () => ['subscriptions', getLocale()] as const,
  localities: () => ['localities', getLocale()] as const,
  geocodeSuggestions: (term: string) => ['geocode', 'suggest', term, getLocale()] as const,
  providerSearch: (params: SearchParams) => ['providers', 'search', params, getLocale()] as const,
  provider: (slug: string) => ['providers', slug, getLocale()] as const,
  property: (slug: string) => ['properties', 'detail', slug, getLocale()] as const,
  providerProperties: (slug: string, page: number) =>
    ['providers', slug, 'properties', page, getLocale()] as const,
  propertySearch: (params: Record<string, unknown>) => ['properties', 'search', params, getLocale()] as const,
  // Authentication identity is shared across languages, including login/logout cache writes.
  currentUser: () => ['auth', 'user'] as const,
  providerProfile: () => ['provider', 'profile', getLocale()] as const,
  providerPortfolio: () => ['provider', 'portfolio', getLocale()] as const,
  providerSubscriptions: () => ['provider', 'subscriptions', getLocale()] as const,
  propertyListings: () => ['provider', 'property-listings', getLocale()] as const,
  adminDashboard: (days = 30) => ['admin', 'dashboard', days, getLocale()] as const,
  adminProviders: (status: string, page: number) =>
    ['admin', 'providers', { status, page }, getLocale()] as const,
  adminProvider: (id: number) => ['admin', 'providers', id, getLocale()] as const,
  adminProviderHistory: (id: number) => ['admin', 'providers', id, 'history', getLocale()] as const,
  adminSubscriptions: (state: string, page: number) =>
    ['admin', 'subscriptions', { state, page }, getLocale()] as const,
} as const
