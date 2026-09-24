import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { publicApi } from '@/api/endpoints'
import { queryKeys } from '@/api/queryKeys'
import { createFeaturedOrder } from '@/lib/featuredOrder'
import type { SearchParams } from '@/types/api'

const CATEGORY_STALE_MS = 30 * 60_000
const SUGGESTION_MIN_LENGTH = 2
const orderFeaturedProviders = createFeaturedOrder()
const orderFeaturedProperties = createFeaturedOrder()

export function useFeaturedProviders() {
  return useQuery({
    queryKey: queryKeys.featuredProviders(),
    queryFn: async () => orderFeaturedProviders(await publicApi.featuredProviders()),
    staleTime: 60_000,
  })
}

export function useFeaturedProperties(purpose: 'rental' | 'sales') {
  return useQuery({
    queryKey: queryKeys.featuredProperties(purpose),
    queryFn: async () => {
      const firstPage = await publicApi.searchProperties({ purpose, featured_only: true })
      const data = [...firstPage.data]
      for (let page = 2; page <= firstPage.meta.last_page; page++) {
        const nextPage = await publicApi.searchProperties({ purpose, featured_only: true, page })
        data.push(...nextPage.data)
      }
      return { ...firstPage, data: orderFeaturedProperties(data) }
    },
    staleTime: 60_000,
  })
}

export function useCategories(popularOnly = false) {
  return useQuery({
    queryKey: queryKeys.categories(popularOnly),
    queryFn: () => publicApi.categories(popularOnly),
    staleTime: CATEGORY_STALE_MS,
  })
}

export function useSubscriptions() {
  return useQuery({
    queryKey: queryKeys.subscriptions(),
    queryFn: publicApi.subscriptions,
    staleTime: CATEGORY_STALE_MS,
  })
}

export function useLocalities() {
  return useQuery({
    queryKey: queryKeys.localities(),
    queryFn: publicApi.localities,
    staleTime: CATEGORY_STALE_MS,
  })
}

export function useAddressSuggestions(term: string) {
  return useQuery({
    queryKey: queryKeys.geocodeSuggestions(term),
    queryFn: ({ signal }) => publicApi.suggestAddresses(term, signal),
    enabled: term.trim().length >= SUGGESTION_MIN_LENGTH,
    staleTime: CATEGORY_STALE_MS,
    placeholderData: keepPreviousData,
  })
}

export function useProviderSearch(params: SearchParams | null) {
  return useQuery({
    queryKey: queryKeys.providerSearch(params ?? ({} as SearchParams)),
    queryFn: ({ signal }) => publicApi.searchProviders(params as SearchParams, signal),
    enabled: params !== null,
    placeholderData: keepPreviousData,
  })
}

export function useProviderProfile(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.provider(slug ?? ''),
    queryFn: () => publicApi.provider(slug as string),
    enabled: Boolean(slug),
  })
}
