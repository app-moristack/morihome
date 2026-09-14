import { bootstrap } from './bootstrap'
import type { ProviderTypeValue, SearchParams, SortOption } from '@/types/api'

const PROVIDER_TYPES: ProviderTypeValue[] = ['individual', 'agency']
const SORTS: SortOption[] = ['recommended', 'distance']

export type SearchFormState = {
  address: string
  latitude: number | null
  longitude: number | null
  radiusKm: number
  categoryId: number | null
  providerTypes: ProviderTypeValue[]
  verifiedOnly: boolean
  hasWhatsapp: boolean
  sort: SortOption
  page: number
}

export function emptySearchState(): SearchFormState {
  return {
    address: '',
    latitude: null,
    longitude: null,
    radiusKm: bootstrap.defaultRadiusKm,
    categoryId: null,
    providerTypes: [],
    verifiedOnly: false,
    hasWhatsapp: false,
    sort: 'recommended',
    page: 1,
  }
}

export function readSearchState(params: URLSearchParams): SearchFormState {
  const latitude = Number(params.get('lat'))
  const longitude = Number(params.get('lng'))
  const radius = Number(params.get('radius'))
  const categoryId = Number(params.get('category_id'))
  const page = Number(params.get('page'))
  const sort = params.get('sort')

  return {
    address: params.get('address') ?? '',
    latitude: Number.isFinite(latitude) && params.has('lat') ? latitude : null,
    longitude: Number.isFinite(longitude) && params.has('lng') ? longitude : null,
    radiusKm: bootstrap.radiusOptionsKm.includes(radius) ? radius : bootstrap.defaultRadiusKm,
    categoryId: Number.isFinite(categoryId) && categoryId > 0 ? categoryId : null,
    providerTypes: params
      .getAll('type')
      .filter((type): type is ProviderTypeValue => PROVIDER_TYPES.includes(type as ProviderTypeValue)),
    verifiedOnly: params.get('verified') === '1',
    hasWhatsapp: params.get('whatsapp') === '1',
    sort: SORTS.includes(sort as SortOption) ? (sort as SortOption) : 'recommended',
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

export function writeSearchState(state: SearchFormState): URLSearchParams {
  const params = new URLSearchParams()

  if (state.address) {
    params.set('address', state.address)
  }

  if (state.latitude !== null && state.longitude !== null) {
    params.set('lat', state.latitude.toFixed(6))
    params.set('lng', state.longitude.toFixed(6))
  }

  params.set('radius', String(state.radiusKm))

  if (state.categoryId) {
    params.set('category_id', String(state.categoryId))
  }

  state.providerTypes.forEach((type) => params.append('type', type))

  if (state.verifiedOnly) {
    params.set('verified', '1')
  }

  if (state.hasWhatsapp) {
    params.set('whatsapp', '1')
  }

  if (state.sort !== 'recommended') {
    params.set('sort', state.sort)
  }

  if (state.page > 1) {
    params.set('page', String(state.page))
  }

  return params
}

export function hasSearchLocation(state: SearchFormState): boolean {
  return (state.latitude !== null && state.longitude !== null) || state.address.trim() !== ''
}

export function toApiSearchParams(state: SearchFormState): SearchParams | null {
  const hasCoordinates = state.latitude !== null && state.longitude !== null
  const hasLocation = hasSearchLocation(state)

  if (!hasLocation && !state.categoryId) {
    return null
  }

  return {
    ...(hasCoordinates
      ? { latitude: state.latitude as number, longitude: state.longitude as number }
      : hasLocation
        ? { address: state.address.trim() }
        : {}),
    ...(hasLocation ? { radius_km: state.radiusKm } : {}),
    ...(state.categoryId ? { service_category_id: state.categoryId } : {}),
    ...(state.providerTypes.length > 0 ? { provider_types: state.providerTypes } : {}),
    ...(state.verifiedOnly ? { verified_only: true } : {}),
    ...(state.hasWhatsapp ? { has_whatsapp: true } : {}),
    sort: hasLocation ? state.sort : 'recommended',
    page: state.page,
  }
}
