import { describe, expect, it } from 'vitest'
import { emptySearchState, readSearchState, toApiSearchParams, writeSearchState } from './searchParams'

describe('readSearchState', () => {
  it('reads coordinates, radius and filters from the query string', () => {
    const state = readSearchState(
      new URLSearchParams(
        'address=Curepipe&lat=-20.316&lng=57.5261&radius=20&category_id=3&type=agency&verified=1',
      ),
    )

    expect(state.address).toBe('Curepipe')
    expect(state.latitude).toBe(-20.316)
    expect(state.longitude).toBe(57.5261)
    expect(state.radiusKm).toBe(20)
    expect(state.categoryId).toBe(3)
    expect(state.providerTypes).toEqual(['agency'])
    expect(state.verifiedOnly).toBe(true)
  })

  it('falls back to the default radius when the value is not offered', () => {
    expect(readSearchState(new URLSearchParams('radius=999')).radiusKm).toBe(emptySearchState().radiusKm)
  })

  it('ignores provider types it does not recognise', () => {
    expect(readSearchState(new URLSearchParams('type=agency&type=business')).providerTypes).toEqual(['agency'])
  })

  it('defaults to page one', () => {
    expect(readSearchState(new URLSearchParams('page=-4')).page).toBe(1)
  })
})

describe('writeSearchState', () => {
  it('round-trips through the query string', () => {
    const state = {
      ...emptySearchState(),
      address: 'Grand Baie',
      latitude: -20.0136,
      longitude: 57.5804,
      radiusKm: 30,
      categoryId: 5,
      providerTypes: ['agency' as const],
      verifiedOnly: true,
      hasWhatsapp: true,
      sort: 'distance' as const,
      page: 2,
    }

    const restored = readSearchState(writeSearchState(state))

    expect(restored.address).toBe('Grand Baie')
    expect(restored.radiusKm).toBe(30)
    expect(restored.categoryId).toBe(5)
    expect(restored.providerTypes).toEqual(['agency'])
    expect(restored.verifiedOnly).toBe(true)
    expect(restored.hasWhatsapp).toBe(true)
    expect(restored.sort).toBe('distance')
    expect(restored.page).toBe(2)
  })

  it('leaves defaults out of the URL', () => {
    const query = writeSearchState(emptySearchState()).toString()

    expect(query).not.toContain('sort=')
    expect(query).not.toContain('page=')
    expect(query).not.toContain('verified=')
  })
})

describe('toApiSearchParams', () => {
  it('prefers coordinates over the typed address', () => {
    const params = toApiSearchParams({
      ...emptySearchState(),
      address: 'Curepipe',
      latitude: -20.316,
      longitude: 57.5261,
    })

    expect(params).toMatchObject({ latitude: -20.316, longitude: 57.5261 })
    expect(params).not.toHaveProperty('address')
  })

  it('sends the address when no coordinates were resolved', () => {
    const params = toApiSearchParams({ ...emptySearchState(), address: 'Curepipe' })

    expect(params).toMatchObject({ address: 'Curepipe' })
    expect(params).not.toHaveProperty('latitude')
  })

  it('returns null when there is no location or category', () => {
    expect(toApiSearchParams(emptySearchState())).toBeNull()
  })

  it('searches by category without radius or distance sorting when location is blank', () => {
    expect(
      toApiSearchParams({
        ...emptySearchState(),
        address: '   ',
        categoryId: 7,
        radiusKm: 10,
        sort: 'distance',
        page: 2,
        verifiedOnly: true,
      }),
    ).toEqual({
      service_category_id: 7,
      verified_only: true,
      sort: 'recommended',
      page: 2,
    })
  })

  it('omits filters that are switched off', () => {
    const params = toApiSearchParams({ ...emptySearchState(), address: 'Moka' })

    expect(params).not.toHaveProperty('verified_only')
    expect(params).not.toHaveProperty('has_whatsapp')
    expect(params).not.toHaveProperty('provider_types')
  })
})
