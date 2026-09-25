import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useLocation } from 'react-router'
import { SearchPage } from './SearchPage'
import { publicApi } from '@/api/endpoints'
import { renderWithProviders } from '@/test/renderWithProviders'
import type { Locality, ProviderSummary, ServiceCategory } from '@/types/api'

const categories: ServiceCategory[] = [
  {
    id: 7,
    name: 'Plumber',
    slug: 'plumber',
    icon: 'droplets',
    description: null,
    is_popular: true,
    sort_order: 1,
    parent_id: null,
  },
]

const localities: Locality[] = [
  {
    id: 3,
    name: 'Port Louis',
    slug: 'port-louis',
    district: 'Port Louis',
    latitude: -20.1609,
    longitude: 57.5012,
  },
]

const provider: ProviderSummary = {
  id: 2,
  name: 'Local Plumber',
  slug: 'local-plumber',
  provider_type: 'individual',
  provider_type_label: 'Individual worker',
  excerpt: 'Emergency plumbing and bathroom repairs.',
  locality: 'Port Louis',
  approximate_latitude: -20.16,
  approximate_longitude: 57.5,
  logo_url: null,
  cover_url: null,
  is_verified: true,
  is_featured: true,
  distance_km: 2.4,
  whatsapp_number: '23057654321',
  service_categories: categories,
}

function LocationOutput() {
  const location = useLocation()
  return (
    <output aria-label="Current route">
      {location.pathname}
      {location.search}
    </output>
  )
}

beforeEach(() => {
  vi.spyOn(publicApi, 'categories').mockResolvedValue(categories)
  vi.spyOn(publicApi, 'localities').mockResolvedValue(localities)
  vi.spyOn(publicApi, 'searchProviders').mockResolvedValue({
    data: [provider],
    links: { first: null, last: null, prev: null, next: null },
    meta: { current_page: 1, from: 1, last_page: 1, per_page: 12, to: 1, total: 1 },
  })
  vi.spyOn(publicApi, 'suggestAddresses').mockResolvedValue([])
})

describe('SearchPage', () => {
  it('switches to the map and keeps filters while paging through results', async () => {
    vi.mocked(publicApi.searchProviders).mockResolvedValue({
      data: [provider],
      links: { first: null, last: null, prev: null, next: null },
      meta: { current_page: 1, from: 1, last_page: 2, per_page: 1, to: 1, total: 2 },
    })
    renderWithProviders(<SearchPage />, { route: '/search?category_id=7&verified=1' })
    await screen.findAllByRole('link', { name: 'Local Plumber' })
    await userEvent.click(screen.getByRole('button', { name: 'Map' }))
    expect(await screen.findByRole('region', { name: 'Professional locations map' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Map' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTitle('Local Plumber')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(vi.mocked(publicApi.searchProviders).mock.calls.at(-1)?.[0]).toMatchObject({
      service_category_id: 7,
      verified_only: true,
      page: 2,
    })
    await screen.findByRole('region', { name: 'Professional locations map' })
    await userEvent.click(screen.getByRole('button', { name: 'Grid' }))
    expect(screen.queryByRole('region', { name: 'Professional locations map' })).not.toBeInTheDocument()
  })

  it('keeps the trust card in the Find a Pro hero', () => {
    const { container } = renderWithProviders(<SearchPage />, { route: '/search' })

    const heroVideo = container.querySelector('.search-page-hero video')
    expect(decodeURI(heroVideo?.getAttribute('src') ?? '')).toContain('homepage video.mp4')
    expect(heroVideo).toHaveAttribute('autoplay')
    expect(heroVideo).toHaveProperty('muted', true)
    expect(heroVideo).toHaveAttribute('loop')
    expect(heroVideo).toHaveAttribute('playsinline')

    expect(screen.getByRole('heading', { name: 'Find the right professional near you.' })).toBeInTheDocument()
    expect(screen.getByText(/Trusted services and property listings for your home/)).toBeInTheDocument()
    expect(screen.getByText('Local people')).toBeInTheDocument()
    expect(screen.getByText('Verified listings')).toBeInTheDocument()
    expect(screen.getByText('Faster support')).toBeInTheDocument()
    expect(screen.queryByLabelText('Made for Mauritius')).not.toBeInTheDocument()
  })

  it('submits a category search without requiring a location', async () => {
    renderWithProviders(<SearchPage />, { route: '/search' })
    const form = screen.getByRole('search')
    await screen.findByRole('button', { name: 'Plumber' })
    await userEvent.selectOptions(within(form).getByLabelText('What do you need?'), '7')
    await userEvent.click(within(form).getByRole('button', { name: 'Search' }))

    expect((await screen.findAllByRole('link', { name: 'Local Plumber' }))[0]).toBeInTheDocument()
    expect(vi.mocked(publicApi.searchProviders).mock.calls.at(-1)?.[0]).toEqual({
      service_category_id: 7,
      sort: 'recommended',
      page: 1,
    })
    expect(within(screen.getByRole('search')).getByLabelText('Search radius')).toBeDisabled()
    expect(screen.getByRole('option', { name: 'Nearest first' })).toBeDisabled()
  })

  it('shows category-specific guidance when a search without location has no results', async () => {
    vi.mocked(publicApi.searchProviders).mockResolvedValue({
      data: [],
      links: { first: null, last: null, prev: null, next: null },
      meta: { current_page: 1, from: null, last_page: 1, per_page: 12, to: null, total: 0 },
    })
    renderWithProviders(<SearchPage />, { route: '/search?category_id=7' })

    expect(
      await screen.findByRole('heading', { name: 'No professionals match your filters' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Widen to 50 km' })).not.toBeInTheDocument()
  })

  it('keeps searching the category when a previous location is cleared', async () => {
    renderWithProviders(<SearchPage />, {
      route: '/search?category_id=7&address=Port+Louis&lat=-20.1609&lng=57.5012',
    })
    await screen.findAllByRole('link', { name: 'Local Plumber' })
    const form = screen.getByRole('search')
    await userEvent.clear(within(form).getByLabelText('Where do you need help?'))
    await userEvent.click(within(form).getByRole('button', { name: 'Search' }))

    expect(vi.mocked(publicApi.searchProviders).mock.calls.at(-1)?.[0]).toEqual({
      service_category_id: 7,
      sort: 'recommended',
      page: 1,
    })
  })

  it('shows real results in a responsive grid and switches to list view', async () => {
    renderWithProviders(<SearchPage />, { route: '/search?address=Port+Louis&radius=10' })

    expect(
      await screen.findByText(
        (_, element) => element?.tagName === 'P' && element.textContent === '1 professional found',
      ),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Local Plumber' })[0]).toHaveAttribute(
      'href',
      '/providers/local-plumber',
    )
    expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(screen.getByRole('button', { name: 'List' }))

    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Emergency plumbing and bathroom repairs.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Map' })).toBeEnabled()
  })

  it('opens the mobile filters and applies category and trust options to the URL', async () => {
    renderWithProviders(
      <>
        <SearchPage />
        <LocationOutput />
      </>,
      { route: '/search?address=Port+Louis&radius=10' },
    )
    await screen.findByText(
      (_, element) => element?.tagName === 'P' && element.textContent === '1 professional found',
    )

    await userEvent.click(screen.getByRole('button', { name: 'Filters' }))
    const dialog = screen.getByRole('dialog', { name: 'Search filters' })
    await userEvent.selectOptions(within(dialog).getByLabelText('Filter by service category'), '7')
    await userEvent.click(within(dialog).getByLabelText('Verified profiles only'))

    const route = screen.getByLabelText('Current route').textContent ?? ''
    expect(route).toContain('category_id=7')
    expect(route).toContain('verified=1')

    await userEvent.click(within(dialog).getByRole('button', { name: 'Show results' }))
    expect(screen.queryByRole('dialog', { name: 'Search filters' })).not.toBeInTheDocument()
  })

  it('starts a coordinate search from a suggested location', async () => {
    vi.spyOn(publicApi, 'suggestAddresses').mockResolvedValue([
      {
        label: 'Port Louis',
        locality: 'Port Louis',
        district: null,
        latitude: -20.1609,
        longitude: 57.5012,
        source: 'locality',
      },
    ])
    renderWithProviders(
      <>
        <SearchPage />
        <LocationOutput />
      </>,
      { route: '/search' },
    )
    await userEvent.type(screen.getByRole('combobox', { name: 'Where do you need help?' }), 'Port')
    await userEvent.click(await screen.findByRole('button', { name: 'Port Louis' }))
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))

    const route = screen.getByLabelText('Current route').textContent ?? ''
    expect(route).toContain('address=Port+Louis')
    expect(route).toContain('lat=-20.160900')
    expect(route).toContain('lng=57.501200')
  })

  it('keeps the honest empty state before a location is entered', async () => {
    renderWithProviders(<SearchPage />, { route: '/search' })

    expect(screen.getByRole('heading', { name: 'Where should we look?' })).toBeInTheDocument()
    expect(publicApi.searchProviders).not.toHaveBeenCalled()
  })
})
