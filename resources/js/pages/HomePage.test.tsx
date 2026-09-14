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

    const sections = container.querySelectorAll('.home-model-section')
    expect(Array.from(sections, (section) => section.getAttribute('aria-labelledby'))).toEqual([
      'featured-title',
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
      screen.getByRole('heading', { name: 'Need work done at home? Find the right local pro.' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Find local professionals near you for repairs, renovation/)).toBeInTheDocument()
    expect(screen.queryByText('Look for the Verified badge on professional profiles.')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Made for Mauritius')).toBeInTheDocument()
    expect(screen.getAllByText('Built for Mauritius')).toHaveLength(2)
    expect(screen.getByText('Reviewed profiles')).toBeInTheDocument()
  })

  it('prioritizes finding and joining over the installation prompt', () => {
    const { container } = renderWithProviders(<HomePage />)
    const sectionIds = Array.from(
      container.querySelectorAll('.home-page > section[aria-labelledby]'),
      (section) => section.getAttribute('aria-labelledby'),
    )

    expect(sectionIds).toEqual([
      'services-title',
      'featured-title',
      'how-title',
      'why-title',
      'join-title',
      'app-title',
    ])
    expect(screen.getByRole('link', { name: 'Create Your Free Account' })).toHaveAttribute(
      'href',
      '/register',
    )
    expect(screen.queryByRole('link', { name: 'Report a concern' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Learn about your privacy' })).not.toBeInTheDocument()
    expect(screen.getByText('Get discovered by customers looking for your services near you.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Add to your phone' })).toHaveAttribute('href', '/install')
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

  it('renders no more than five featured professionals in a horizontal rail', async () => {
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
    expect(rail).toHaveClass('home-featured-carousel')
    expect(rail?.querySelectorAll('.home-provider-card')).toHaveLength(5)
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
