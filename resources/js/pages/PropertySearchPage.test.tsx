import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PropertySearchPage from './PropertySearchPage'
import { publicApi } from '@/api/endpoints'
import { renderWithProviders } from '@/test/renderWithProviders'

describe('PropertySearchPage filters', () => {
  beforeEach(() => {
    vi.spyOn(publicApi, 'searchProperties').mockResolvedValue({
      data: [],
      meta: { current_page: 1, last_page: 2, per_page: 24, total: 30, from: 1, to: 24 },
      links: { first: null, last: null, prev: null, next: null },
    })
  })

  it('sorts all results through the API, resets the page and preserves filters', async () => {
    renderWithProviders(<PropertySearchPage />, {
      route: '/properties?purpose=sales&amenities[]=pool&page=2',
    })
    await userEvent.selectOptions(screen.getByLabelText('Sort by'), 'price_asc')
    await waitFor(() =>
      expect(publicApi.searchProperties).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort: 'price_asc', page: 1, purpose: 'sales', amenities: ['pool'] }),
      ),
    )
    await userEvent.click(screen.getByRole('button', { name: 'List' }))
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Map' }))
    expect(screen.getByRole('button', { name: 'Map' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Sort by')).toHaveValue('price_asc')
  })

  it('initializes the hero from the URL and submits property searches without dropping amenities', async () => {
    vi.spyOn(publicApi, 'suggestAddresses').mockResolvedValue([])
    renderWithProviders(<PropertySearchPage />, {
      route:
        '/properties?purpose=sales&property_type=villa&location=Albion&max_price=5000000&amenities[]=pool&page=2',
    })
    expect(screen.queryByRole('tablist', { name: 'Search category' })).not.toBeInTheDocument()
    const hero = within(screen.getByRole('search', { name: 'Find property in Mauritius' }))
    expect(hero.getByLabelText('Property type')).toHaveValue('villa')
    expect(hero.getByLabelText('Maximum budget')).toHaveValue('5000000')
    await userEvent.selectOptions(hero.getByLabelText('Property type'), 'house')
    await userEvent.click(hero.getByRole('button', { name: 'Search properties' }))
    await waitFor(() =>
      expect(publicApi.searchProperties).toHaveBeenLastCalledWith(
        expect.objectContaining({
          purpose: 'sales',
          property_type: 'house',
          location: 'Albion',
          max_price: 5000000,
          amenities: ['pool'],
          page: 1,
        }),
      ),
    )
  })

  it('applies the hero shortcuts and synchronizes the selected purpose and property type', async () => {
    renderWithProviders(<PropertySearchPage />, { route: '/properties?purpose=rental&page=2' })
    await userEvent.click(screen.getByRole('button', { name: 'House for sale' }))
    await waitFor(() =>
      expect(publicApi.searchProperties).toHaveBeenLastCalledWith(
        expect.objectContaining({ purpose: 'sales', property_type: 'house', page: 1 }),
      ),
    )
    const hero = within(screen.getByRole('search', { name: 'Find property in Mauritius' }))
    expect(hero.getByLabelText('I am looking for')).toHaveValue('sales')
    expect(hero.getByLabelText('Property type')).toHaveValue('house')
  })

  it('applies attributes and amenities together and resets pagination', async () => {
    renderWithProviders(<PropertySearchPage />, { route: '/properties?purpose=sales&page=2' })
    await userEvent.click(screen.getByRole('button', { name: 'Filters' }))
    await userEvent.selectOptions(screen.getByLabelText('Bedrooms'), '3')
    await userEvent.selectOptions(screen.getByLabelText('Bathrooms'), '2')
    await userEvent.type(screen.getByLabelText('Minimum area (m²)'), '100')
    await userEvent.selectOptions(screen.getByLabelText('Furnishing'), '0')
    await userEvent.click(screen.getByLabelText('Parking'))
    await userEvent.click(screen.getByLabelText('Swimming pool'))
    expect(screen.queryByRole('button', { name: 'Apply filters' })).not.toBeInTheDocument()
    await waitFor(() =>
      expect(publicApi.searchProperties).toHaveBeenLastCalledWith(
        expect.objectContaining({
          purpose: 'sales',
          bedrooms: 3,
          bathrooms: 2,
          min_area: 100,
          is_furnished: false,
          amenities: ['parking', 'pool'],
          page: 1,
        }),
      ),
    )
  })

  it('preserves every selected amenity when moving to the next page and clears filters', async () => {
    renderWithProviders(<PropertySearchPage />, {
      route: '/properties?purpose=sales&bedrooms=2&amenities[]=parking&amenities[]=pool',
    })
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    await waitFor(() =>
      expect(publicApi.searchProperties).toHaveBeenLastCalledWith(
        expect.objectContaining({
          bedrooms: 2,
          amenities: ['parking', 'pool'],
          page: 2,
        }),
      ),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Filters' }))
    expect(screen.getByLabelText('Swimming pool')).toBeChecked()
    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }))
    await waitFor(() =>
      expect(publicApi.searchProperties).toHaveBeenLastCalledWith(
        expect.objectContaining({
          purpose: 'sales',
          bedrooms: undefined,
          amenities: [],
          page: 1,
        }),
      ),
    )
  })
})
