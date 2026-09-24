import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { publicApi } from '@/api/endpoints'
import { ApiError } from '@/api/client'
import { renderWithProviders } from '@/test/renderWithProviders'
import type { PropertyListing } from '@/types/api'
import PropertyDetailPage from './PropertyDetailPage'

const listing: PropertyListing = {
  id: 1,
  slug: 'demo-villa',
  purpose: 'rental',
  property_type: 'villa',
  title: 'Villa with pool',
  description: 'Spacious family villa.',
  price_rupees: 65000,
  bedrooms: 3,
  bathrooms: 2,
  area_sqm: 200,
  is_furnished: true,
  amenities: ['pool', 'parking'],
  address: 'Royal Road',
  locality: 'Grand Baie',
  latitude: -20,
  longitude: 57,
  status: 'published',
  expires_at: null,
  photo_limit: 10,
  images: [
    { id: 1, url: '/villa.webp', caption: 'Villa', sort_order: 0, width: 800, height: 600 },
    { id: 2, url: '/pool.webp', caption: 'Pool', sort_order: 1, width: 800, height: 600 },
  ],
  provider: {
    name: 'Demo Agency',
    slug: 'demo-agency',
    phone: '+23057654321',
    whatsapp_phone: '+23057654321',
    is_verified: true,
    profile_available: true,
  },
}

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/properties/:slug" element={<PropertyDetailPage />} />
    </Routes>,
    { route: '/properties/demo-villa' },
  )
}

describe('PropertyDetailPage', () => {
  it('shows the property, photos, amenities, and a link to the lister profile', async () => {
    vi.spyOn(publicApi, 'property').mockResolvedValue(listing)
    renderPage()
    expect(await screen.findByRole('heading', { name: listing.title })).toBeInTheDocument()
    expect(publicApi.property).toHaveBeenCalledWith('demo-villa')
    expect(screen.getByText('Spacious family villa.')).toBeInTheDocument()
    expect(screen.getByText('Swimming pool')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View profile and other listings' })).toHaveAttribute(
      'href',
      '/providers/demo-agency',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Next photo' }))
    expect(screen.getByRole('img')).toHaveAttribute('src', '/pool.webp')
  })

  it('does not offer a link to a non-public lister profile', async () => {
    vi.spyOn(publicApi, 'property').mockResolvedValue({
      ...listing,
      provider: { ...listing.provider!, profile_available: false },
    })
    renderPage()
    await screen.findByRole('heading', { name: listing.title })
    expect(screen.queryByRole('link', { name: 'View profile and other listings' })).not.toBeInTheDocument()
  })

  it('handles unavailable listings without showing private property details', async () => {
    vi.spyOn(publicApi, 'property').mockRejectedValue(new ApiError(404, 'Not found'))
    renderPage()
    expect(await screen.findByText('This property is not available')).toBeInTheDocument()
    expect(screen.queryByText(listing.title)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to properties' })).toHaveAttribute('href', '/properties')
  })
})
