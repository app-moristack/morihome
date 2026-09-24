import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { publicApi } from '@/api/endpoints'
import { renderWithProviders } from '@/test/renderWithProviders'
import { useFeaturedProperties } from './useSearchQueries'
import type { PropertyListing } from '@/types/api'

function FeaturedResults() {
  const { data, isError } = useFeaturedProperties('rental')
  return <output>{isError ? 'Failed' : data?.data.map((item) => item.id).join(',')}</output>
}

describe('useFeaturedProperties', () => {
  it('loads featured properties beyond the first API page', async () => {
    const listing = (id: number) => ({ id }) as PropertyListing
    const response = {
      data: Array.from({ length: 24 }, (_, i) => listing(i + 1)),
      links: { first: null, last: null, prev: null, next: '?page=2' },
      meta: { current_page: 1, from: 1, last_page: 2, per_page: 24, to: 24, total: 25 },
    }
    vi.spyOn(publicApi, 'searchProperties')
      .mockResolvedValueOnce(response)
      .mockResolvedValueOnce({
        ...response,
        data: [listing(25)],
        meta: { ...response.meta, current_page: 2 },
      })
    renderWithProviders(<FeaturedResults />)
    await waitFor(() => {
      const ids = screen
        .getByRole('status')
        .textContent?.split(',')
        .map(Number)
        .sort((a, b) => a - b)
      expect(ids).toEqual(Array.from({ length: 25 }, (_, i) => i + 1))
    })
    expect(publicApi.searchProperties).toHaveBeenLastCalledWith({
      purpose: 'rental',
      featured_only: true,
      page: 2,
    })
  })

  it('reports a failed later page instead of silently dropping listings', async () => {
    vi.spyOn(publicApi, 'searchProperties')
      .mockResolvedValueOnce({
        data: [],
        links: { first: null, last: null, prev: null, next: '?page=2' },
        meta: { current_page: 1, from: null, last_page: 2, per_page: 24, to: null, total: 25 },
      })
      .mockRejectedValueOnce(new Error('Network error'))
    renderWithProviders(<FeaturedResults />)
    expect(await screen.findByText('Failed')).toBeInTheDocument()
  })
})
