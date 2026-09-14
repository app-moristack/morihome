import type { SearchParams } from '@/types/api'

export const queryKeys = {
  featuredProviders: () => ['providers', 'featured'] as const,
  featuredProperties: (purpose: 'rental' | 'sales') => ['properties', 'featured', purpose] as const,
  categories: (popularOnly = false) => ['categories', { popularOnly }] as const,
  subscriptions: () => ['subscriptions'] as const,
  localities: () => ['localities'] as const,
  geocodeSuggestions: (term: string) => ['geocode', 'suggest', term] as const,
  providerSearch: (params: SearchParams) => ['providers', 'search', params] as const,
  provider: (slug: string) => ['providers', slug] as const,
  propertySearch: (params: Record<string, unknown>) => ['properties', 'search', params] as const,
  currentUser: () => ['auth', 'user'] as const,
  providerProfile: () => ['provider', 'profile'] as const,
  providerPortfolio: () => ['provider', 'portfolio'] as const,
  providerSubscriptions: () => ['provider', 'subscriptions'] as const,
  propertyListings: () => ['provider', 'property-listings'] as const,
  adminDashboard: (days = 30) => ['admin', 'dashboard', days] as const,
  adminProviders: (status: string, page: number) => ['admin', 'providers', { status, page }] as const,
  adminProvider: (id: number) => ['admin', 'providers', id] as const,
  adminProviderHistory: (id: number) => ['admin', 'providers', id, 'history'] as const,
  adminSubscriptions: (state: string, page: number) => ['admin', 'subscriptions', { state, page }] as const,
} as const
