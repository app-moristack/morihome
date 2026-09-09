import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import ProviderMap from './ProviderMap'
import { renderWithProviders } from '@/test/renderWithProviders'
import type { ProviderSummary } from '@/types/api'

const provider: ProviderSummary = {
  id: 1,
  slug: 'island-plumber',
  name: 'Island Plumber',
  provider_type: 'individual',
  provider_type_label: 'Individual',
  excerpt: '',
  locality: 'Port Louis',
  approximate_latitude: -20.16,
  approximate_longitude: 57.5,
  logo_url: null,
  cover_url: null,
  is_verified: true,
  is_featured: false,
  whatsapp_number: null,
  service_categories: [],
}

describe('ProviderMap', () => {
  it('groups shared locations and safely links every professional in the popup', async () => {
    const second = { ...provider, id: 2, slug: 'second-plumber', name: '<img src=x onerror=alert(1)>' }
    const { container } = renderWithProviders(<ProviderMap providers={[provider, second]} />)
    const marker = screen.getByTitle('Island Plumber, <img src=x onerror=alert(1)>')
    expect(marker).toHaveTextContent('2')
    await userEvent.click(marker)
    const popup = container.querySelector('.provider-map-popup')
    expect(popup?.querySelectorAll('a')).toHaveLength(2)
    expect(popup?.querySelector('img')).toBeNull()
    expect(popup).toHaveTextContent(second.name)
    expect(popup?.querySelector('a')).toHaveAttribute('href', '/providers/island-plumber')
    expect(screen.getByRole('link', { name: 'OpenStreetMap' })).toBeInTheDocument()
  })

  it('replaces old markers when the results change', () => {
    const { rerender } = renderWithProviders(<ProviderMap providers={[provider]} />)
    expect(screen.getByTitle('Island Plumber')).toBeInTheDocument()
    rerender(
      <ProviderMap
        providers={[{ ...provider, id: 3, name: 'South Plumber', approximate_latitude: -20.4 }]}
      />,
    )
    expect(screen.queryByTitle('Island Plumber')).not.toBeInTheDocument()
    expect(screen.getByTitle('South Plumber')).toBeInTheDocument()
  })

  it('keeps a profile accessible when its map location is unavailable', () => {
    renderWithProviders(<ProviderMap providers={[{ ...provider, approximate_latitude: undefined }]} />)
    expect(screen.getByRole('link', { name: 'Island Plumber' })).toHaveAttribute(
      'href',
      '/providers/island-plumber',
    )
    expect(screen.getByText('Map location unavailable')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Show Island Plumber on map' })).not.toBeInTheDocument()
  })

  it('offers retry when map tiles fail to load', async () => {
    const { container } = renderWithProviders(<ProviderMap providers={[provider]} />)
    const tile = container.querySelector('.leaflet-tile')
    expect(tile).not.toBeNull()
    fireEvent.error(tile!)
    expect(screen.getByRole('status')).toHaveTextContent('Some map tiles could not load')
    await userEvent.click(screen.getByRole('button', { name: 'Retry map' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
