import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProviderCard } from './ProviderCard'
import { renderWithProviders } from '@/test/renderWithProviders'
import type { ProviderSummary } from '@/types/api'

function buildProvider(overrides: Partial<ProviderSummary> = {}): ProviderSummary {
  return {
    id: 1,
    slug: 'ti-marmit-plomberie',
    name: 'Ti Marmit Plomberie',
    provider_type: 'individual',
    provider_type_label: 'Individual worker',
    excerpt: 'Emergency plumbing across Port Louis.',
    locality: 'Port Louis',
    logo_url: null,
    cover_url: null,
    is_verified: true,
    is_featured: false,
    distance_km: 1.4,
    whatsapp_number: '23057654321',
    service_categories: [{ id: 3, name: 'Plumber', slug: 'plumber', icon: 'droplets' }],
    ...overrides,
  }
}

describe('ProviderCard', () => {
  it('shows the name, locality and distance', () => {
    renderWithProviders(<ProviderCard provider={buildProvider()} />)

    expect(screen.getByRole('heading', { name: 'Ti Marmit Plomberie' })).toBeInTheDocument()
    expect(screen.getByText('Port Louis')).toBeInTheDocument()
    expect(screen.getByText('1.4 km away')).toBeInTheDocument()
  })

  it('renders sub-kilometre distances in metres', () => {
    renderWithProviders(<ProviderCard provider={buildProvider({ distance_km: 0.4 })} />)

    expect(screen.getByText('400 m away')).toBeInTheDocument()
  })

  it('omits the distance when the search did not provide one', () => {
    const provider = buildProvider()
    delete provider.distance_km

    renderWithProviders(<ProviderCard provider={provider} />)

    expect(screen.queryByText(/away/)).not.toBeInTheDocument()
  })

  it('marks a verified provider', () => {
    renderWithProviders(<ProviderCard provider={buildProvider()} />)

    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('marks a featured provider', () => {
    renderWithProviders(<ProviderCard provider={buildProvider({ is_featured: true })} />)

    expect(screen.getByText('Featured')).toBeInTheDocument()
  })

  it('links to the public profile', () => {
    renderWithProviders(<ProviderCard provider={buildProvider()} />)

    expect(screen.getByRole('link', { name: 'View profile' })).toHaveAttribute(
      'href',
      '/providers/ti-marmit-plomberie',
    )
  })

  it('opens WhatsApp with the service in the message', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }))

    renderWithProviders(<ProviderCard provider={buildProvider()} activeCategoryId={3} />)

    await userEvent.click(screen.getByRole('button', { name: /Contact on WhatsApp/i }))

    expect(open).toHaveBeenCalledOnce()
    const [url] = open.mock.calls[0] ?? []
    expect(url).toContain('https://wa.me/23057654321')
    expect(decodeURIComponent(String(url))).toContain('plumber')
  })

  it('hides the WhatsApp button when there is no number', () => {
    renderWithProviders(<ProviderCard provider={buildProvider({ whatsapp_number: null })} />)

    expect(screen.queryByRole('button', { name: /WhatsApp/i })).not.toBeInTheDocument()
  })
})
