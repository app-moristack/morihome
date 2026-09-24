import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { waitFor } from '@testing-library/dom'
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
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
  vi.spyOn(publicApi, 'categories').mockResolvedValue(categories)
  vi.spyOn(publicApi, 'featuredProviders').mockResolvedValue([provider])
  vi.spyOn(publicApi, 'suggestAddresses').mockResolvedValue([])
  vi.spyOn(publicApi, 'searchProperties').mockResolvedValue({
    data: [],
    links: { first: null, last: null, prev: null, next: null },
    meta: { current_page: 1, from: null, last_page: 1, per_page: 24, to: null, total: 0 },
  })
})

describe('HomePage', () => {
  it('keeps the hero and search usable without WebGL', async () => {
    const { container } = renderWithProviders(<HomePage />)
    const page = container.querySelector('.home-model-page')

    expect(page?.querySelector('img')).toHaveAttribute(
      'src',
      expect.stringContaining('mauritius-home-renovation-living-room.webp'),
    )
    expect(page?.querySelector('canvas')).toBeNull()
    const heroVideo = container.querySelector('.search-page-hero video')
    expect(decodeURI(heroVideo?.getAttribute('src') ?? '')).toContain('homepage video.mp4')
    expect(heroVideo).toHaveAttribute('autoplay')
    expect(heroVideo).toHaveProperty('muted', true)
    expect(heroVideo).toHaveAttribute('loop')
    expect(heroVideo).toHaveAttribute('playsinline')
    expect(heroVideo).toHaveAttribute(
      'poster',
      expect.stringContaining('le-morne-mauritius-home-services.webp'),
    )
    expect(await screen.findByRole('option', { name: 'Plumber' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search' })).toBeEnabled()
  })
  it('shares the model background with exactly the three marked content sections', () => {
    const { container } = renderWithProviders(<HomePage />)

    const sections = container.querySelectorAll('.home-model-section, .home-properties-section')
    expect(Array.from(sections, (section) => section.getAttribute('aria-labelledby'))).toEqual([
      'featured-title',
      'featured-properties-title',
      'why-title',
    ])
    expect(container.querySelectorAll('.home-model-page > [aria-hidden="true"]')).toHaveLength(1)
    expect(screen.getByRole('region', { name: 'How MoriHome works' })).toHaveClass('home-soft-bg')
  })

  it('keeps services light and featured professionals on the model background', () => {
    const { container } = renderWithProviders(<HomePage />)

    expect(screen.getByRole('heading', { name: 'What do you need help with?' })).toBeInTheDocument()
    expect(screen.getByText('Find the right professional for your project.')).toBeInTheDocument()
    expect(container.querySelector('[aria-labelledby="services-title"]')).toHaveClass('home-services-section')
    expect(container.querySelector('[aria-labelledby="featured-title"]')).toHaveClass('home-model-section')
    expect(container.querySelector('[aria-labelledby="featured-title"] > .container-page')).not.toHaveClass(
      'max-w-none',
    )
  })

  it('uses a compact navy trust section with reviewed-profile language', () => {
    const { container } = renderWithProviders(<HomePage />)

    expect(container.querySelector('[aria-labelledby="why-title"]')).toHaveClass(
      'home-model-section',
      'home-why-section',
    )
    expect(screen.getByRole('heading', { name: 'Professionals you can trust.' })).toBeInTheDocument()
    expect(screen.getByText(/Every professional profile is reviewed before publication/)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'How verification works' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Your privacy matters/)).not.toBeInTheDocument()
  })
  it('shows Made for Mauritius in the homepage hero instead of the trust card', async () => {
    renderWithProviders(<HomePage />)

    expect(
      screen.getByRole('heading', { name: 'Services and properties, all in one local place.' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Find trusted local professionals, homes for rent and properties for sale/),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Look for the Verified badge on professional profiles.'),
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText('Made for Mauritius')).toBeInTheDocument()
    expect(screen.getAllByText('Built for Mauritius')).toHaveLength(2)
    expect(screen.getByText('Trusted listings')).toBeInTheDocument()
  })

  it('prioritizes finding and joining over the installation prompt', () => {
    const { container } = renderWithProviders(<HomePage />)
    const sectionIds = Array.from(
      container.querySelectorAll('.home-page > section[aria-labelledby]'),
      (section) => section.getAttribute('aria-labelledby'),
    )

    expect(sectionIds).toEqual([
      'property-title',
      'services-title',
      'featured-title',
      'featured-properties-title',
      'how-title',
      'why-title',
      'join-title',
      'app-title',
    ])
    expect(screen.getByRole('link', { name: 'Create Your Account' })).toHaveAttribute('href', '/register')
    expect(screen.queryByRole('link', { name: 'Report a concern' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Learn about your privacy' })).not.toBeInTheDocument()
    expect(
      screen.getByText(/Reach customers looking for trusted services, rentals and properties for sale/),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add to Home Screen' })).toBeEnabled()
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

  it('uses distinct property type and budget filters for property searches', async () => {
    renderWithProviders(
      <>
        <HomePage />
        <LocationOutput />
      </>,
    )

    await userEvent.click(screen.getByRole('tab', { name: 'Properties' }))
    expect(screen.getByRole('button', { name: 'House for rent' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'House for sale' })).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText('I am looking for'), 'rental')
    await userEvent.selectOptions(screen.getByLabelText('Property type'), 'house')
    await userEvent.type(screen.getByRole('combobox', { name: 'Where in Mauritius?' }), 'Grand Baie')
    await userEvent.selectOptions(screen.getByLabelText('Maximum budget'), '30000')
    await userEvent.click(screen.getByRole('button', { name: 'Search properties' }))

    const route = screen.getByLabelText('Current route').textContent ?? ''
    expect(route).toContain('/properties?')
    expect(route).toContain('purpose=rental')
    expect(route).toContain('property_type=house')
    expect(route).toContain('location=Grand+Baie')
    expect(route).toContain('max_price=30000')
  })

  it('turns property popular searches into relevant property filters', async () => {
    renderWithProviders(
      <>
        <HomePage />
        <LocationOutput />
      </>,
    )

    await userEvent.click(screen.getByRole('tab', { name: 'Properties' }))
    await userEvent.click(screen.getByRole('button', { name: 'House for sale' }))

    expect(screen.getByLabelText('Current route')).toHaveTextContent(
      '/properties?purpose=sales&property_type=house',
    )
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
    expect(screen.getByRole('link', { name: 'View profile' })).toHaveAttribute(
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

  it('switches featured properties between rent and sale', async () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByRole('heading', { name: 'Featured Properties' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'For rent' })).toHaveAttribute('aria-selected', 'true')
    expect(publicApi.searchProperties).toHaveBeenCalledWith({ purpose: 'rental', featured_only: true })

    await userEvent.click(screen.getByRole('tab', { name: 'For sale' }))

    await waitFor(() =>
      expect(publicApi.searchProperties).toHaveBeenCalledWith({ purpose: 'sales', featured_only: true }),
    )
    expect(screen.getByRole('link', { name: 'View all properties for sale' })).toHaveAttribute(
      'href',
      '/properties?purpose=sales',
    )
  })

  it('shows a professional logo when one is available', async () => {
    vi.mocked(publicApi.featuredProviders).mockResolvedValue([
      { ...provider, logo_url: '/storage/logos/local-plumber.webp' },
    ])

    renderWithProviders(<HomePage />)

    expect(await screen.findByAltText('Local Plumber logo')).toHaveAttribute(
      'src',
      '/storage/logos/local-plumber.webp',
    )
  })

  it('makes every featured professional reachable through the carousel', async () => {
    vi.mocked(publicApi.featuredProviders).mockResolvedValue(
      Array.from({ length: 6 }, (_, index) => ({
        ...provider,
        id: index + 1,
        name: `Professional ${index + 1}`,
        slug: `professional-${index + 1}`,
      })),
    )

    const { container } = renderWithProviders(<HomePage />)

    await screen.findByRole('link', { name: 'Professional 1' })
    const rail = container.querySelector('[aria-label="Featured professionals"]')
    expect(rail?.querySelectorAll('.home-provider-card')).toHaveLength(1)
    const carousel = within(screen.getByRole('group', { name: 'Featured professionals' }))
    expect(carousel.getByRole('button', { name: 'Previous' })).toBeDisabled()
    await userEvent.click(carousel.getByRole('button', { name: 'Go to page 6' }))
    expect(carousel.getByRole('link', { name: 'Professional 6' })).toBeInTheDocument()
    expect(carousel.queryByRole('link', { name: 'Professional 1' })).not.toBeInTheDocument()
    expect(carousel.getByRole('button', { name: 'Next' })).toBeDisabled()
    await userEvent.click(carousel.getByRole('button', { name: 'Previous' }))
    expect(carousel.getByRole('link', { name: 'Professional 5' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View all professionals' })).toBeInTheDocument()
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
