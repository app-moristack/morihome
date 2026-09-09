import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useLocation } from 'react-router'
import { HomePage } from './HomePage'
import { publicApi } from '@/api/endpoints'
import { renderWithProviders } from '@/test/renderWithProviders'
import type { ProviderSummary, ServiceCategory } from '@/types/api'

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
const provider: ProviderSummary = {
  id: 2,
  name: 'Local Plumber',
  slug: 'local-plumber',
  provider_type: 'individual',
  provider_type_label: 'Individual worker',
  excerpt: '',
  locality: 'Port Louis',
  logo_url: null,
  cover_url: null,
  is_verified: true,
  is_featured: true,
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
  vi.spyOn(publicApi, 'featuredProviders').mockResolvedValue([provider])
  vi.spyOn(publicApi, 'suggestAddresses').mockResolvedValue([])
})

describe('HomePage', () => {
  it('shows Made for Mauritius in the homepage hero instead of the trust card', async () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByRole('heading', { name: 'Your home. The right pro.' })).toBeInTheDocument()
    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName === 'P' &&
          element.textContent ===
            'Find trusted local professionals for construction, renovation, repairs and maintenance across Mauritius.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Made for Mauritius')).toBeInTheDocument()
    expect(screen.queryByText('Local people')).not.toBeInTheDocument()
    expect(screen.queryByText('Faster support')).not.toBeInTheDocument()
  })

  it('keeps the selected service, address and radius when searching', async () => {
    renderWithProviders(
      <>
        <HomePage />
        <LocationOutput />
      </>,
    )
    await screen.findByRole('option', { name: 'Plumber' })
    await userEvent.selectOptions(screen.getByLabelText('What do you need?'), '7')
    await userEvent.type(screen.getByRole('combobox', { name: 'Where do you need help?' }), 'Port Louis')
    await userEvent.selectOptions(screen.getByLabelText('Search radius'), '20')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    const route = screen.getByLabelText('Current route').textContent ?? ''
    expect(route).toContain('/search?')
    expect(route).toContain('category_id=7')
    expect(route).toContain('address=Port+Louis')
    expect(route).toContain('radius=20')
  })

  it('requires a category or location before submitting the search', async () => {
    renderWithProviders(
      <>
        <HomePage />
        <LocationOutput />
      </>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Choose a service category or enter a location')
    expect(screen.getByLabelText('Current route')).toHaveTextContent(/^\/$/)
  })

  it('uses real profile links and WhatsApp contact details', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    vi.spyOn(publicApi, 'recordContact').mockResolvedValue(undefined)
    renderWithProviders(<HomePage />)
    expect(await screen.findByRole('link', { name: 'Local Plumber' })).toHaveAttribute(
      'href',
      '/providers/local-plumber',
    )
    await userEvent.click(screen.getByRole('button', { name: /Contact on WhatsApp/ }))
    expect(open).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/23057654321'),
      '_blank',
      'noopener,noreferrer',
    )
    expect(publicApi.recordContact).toHaveBeenCalledWith(
      'local-plumber',
      expect.objectContaining({ source: 'home' }),
    )
  })

  it('offers directory search when there are no featured profiles', async () => {
    vi.mocked(publicApi.featuredProviders).mockResolvedValue([])
    renderWithProviders(<HomePage />)
    expect(await screen.findByRole('link', { name: 'Find a professional' })).toHaveAttribute(
      'href',
      '/search',
    )
    expect(screen.queryByRole('button', { name: /Contact on WhatsApp/ })).not.toBeInTheDocument()
  })

  it('lets the visitor retry a failed featured-profiles request', async () => {
    vi.mocked(publicApi.featuredProviders)
      .mockRejectedValueOnce(new Error('Unavailable'))
      .mockResolvedValue([provider])
    renderWithProviders(<HomePage />)
    await userEvent.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('link', { name: 'Local Plumber' })).toBeInTheDocument()
  })
})
