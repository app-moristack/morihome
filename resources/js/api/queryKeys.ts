import type { SearchParams } from '@/types/api'

export const queryKeys = {
  featuredProviders: () => ['providers', 'featured'] as const,
  categories: (popularOnly = false) => ['categories', { popularOnly }] as const,
  localities: () => ['localities'] as const,
  geocodeSuggestions: (term: string) => ['geocode', 'suggest', term] as const,
  providerSearch: (params: SearchParams) => ['providers', 'search', params] as const,
  provider: (slug: string) => ['providers', slug] as const,
  currentUser: () => ['auth', 'user'] as const,
  providerProfile: () => ['provider', 'profile'] as const,
  providerPortfolio: () => ['provider', 'portfolio'] as const,
  adminDashboard: () => ['admin', 'dashboard'] as const,
  adminProviders: (status: string, page: number) => ['admin', 'providers', { status, page }] as const,
  adminProvider: (id: number) => ['admin', 'providers', id] as const,
  adminProviderHistory: (id: number) => ['admin', 'providers', id, 'history'] as const,
} as const
