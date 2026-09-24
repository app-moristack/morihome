import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Maximize } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import type { ProviderSummary } from '@/types/api'

type ProviderMapProps = {
  providers: ProviderSummary[]
}

export default function ProviderMap({ providers }: ProviderMapProps) {
  useLocale()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const tilesRef = useRef<L.TileLayer | null>(null)
  const markersRef = useRef(new Map<number, L.Marker>())
  const [tileError, setTileError] = useState(false)

  const fitResults = () => {
    const markers = [...markersRef.current.values()]
    if (markers.length > 0) {
      mapRef.current?.fitBounds(L.latLngBounds(markers.map((marker) => marker.getLatLng())), {
        padding: [36, 36],
        maxZoom: 13,
      })
    }
  }

  useEffect(() => {
    if (!containerRef.current) return

    const map = L.map(containerRef.current, { scrollWheelZoom: true }).setView([-20.25, 57.55], 10)
    mapRef.current = map
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)
    tilesRef.current = tiles
    tiles.on('tileerror', () => setTileError(true))

    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => map.invalidateSize()) : null
    observer?.observe(containerRef.current)

    return () => {
      observer?.disconnect()
      tiles.off()
      map.remove()
      mapRef.current = null
      tilesRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const layer = L.layerGroup().addTo(map)
    const markers = new Map<number, L.Marker>()
    const groups = new Map<string, { point: L.LatLngTuple; providers: ProviderSummary[] }>()

    for (const provider of providers) {
      const latitude = provider.approximate_latitude
      const longitude = provider.approximate_longitude
      if (
        typeof latitude !== 'number' ||
        typeof longitude !== 'number' ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        Math.abs(latitude) > 90 ||
        Math.abs(longitude) > 180
      )
        continue

      const key = `${latitude},${longitude}`
      const group = groups.get(key) ?? { point: [latitude, longitude], providers: [] }
      group.providers.push(provider)
      groups.set(key, group)
    }

    for (const group of groups.values()) {
      const badge = document.createElement('span')
      badge.textContent = String(group.providers.length)
      const popup = document.createElement('div')
      popup.className = 'provider-map-popup'
      for (const provider of group.providers) {
        const link = document.createElement('a')
        link.href = `/providers/${encodeURIComponent(provider.slug)}`
        link.textContent = provider.name
        const locality = document.createElement('p')
        locality.textContent = provider.locality
        popup.append(link, locality)
      }
      const marker = L.marker(group.point, {
        icon: L.divIcon({
          html: badge,
          className: 'provider-map-pin',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        }),
        title: group.providers.map((provider) => provider.name).join(', '),
        alt: t('{count} professionals near {locality}', {
          count: group.providers.length,
          locality: group.providers[0]?.locality ?? t('this area'),
        }),
      })
        .addTo(layer)
        .bindPopup(popup, { maxWidth: 300, maxHeight: 240 })
      for (const provider of group.providers) markers.set(provider.id, marker)
    }
    markersRef.current = markers
    fitResults()

    return () => {
      layer.remove()
      markersRef.current.clear()
    }
  }, [providers])

  const showProvider = (provider: ProviderSummary) => {
    const marker = markersRef.current.get(provider.id)
    if (!marker) return
    mapRef.current?.setView(marker.getLatLng(), 13)
    marker.openPopup()
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  return (
    <section className="card overflow-hidden" aria-label={t('Map search results')}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-4 py-3">
        <p className="text-xs text-ink-600">
          {t('Showing')} {providers.length}{' '}
          {t('professionals on this page. Pins show approximate locations.')}
        </p>
        <Button variant="ghost" size="sm" onClick={fitResults} leadingIcon={<Maximize className="size-4" />}>
          {t('Fit results')}
        </Button>
      </div>
      {tileError ? (
        <div
          role="status"
          className="flex flex-wrap items-center gap-2 bg-brand-50 px-4 py-2 text-sm text-ink-900"
        >
          {t('Some map tiles could not load. You can still browse the professionals below.')}
          <button
            type="button"
            className="min-h-9 font-semibold underline"
            onClick={() => {
              setTileError(false)
              tilesRef.current?.redraw()
            }}
          >
            {t('Retry map')}
          </button>
        </div>
      ) : null}
      <div className="grid xl:grid-cols-[minmax(0,1fr)_300px]">
        <div
          ref={containerRef}
          role="region"
          aria-label={t('Professional locations map')}
          className="relative z-0 h-[420px] bg-ink-100 sm:h-[520px]"
        />
        <ul className="max-h-80 divide-y divide-ink-100 overflow-y-auto border-t border-ink-100 xl:max-h-[520px] xl:border-t-0 xl:border-l">
          {providers.map((provider) => (
            <li key={provider.id} className="p-4">
              <Link to={`/providers/${provider.slug}`} className="text-sm font-bold hover:underline">
                {provider.name}
              </Link>
              <p className="mt-1 text-xs text-ink-500">{provider.locality}</p>
              <p className="mt-1 text-xs text-ink-600">
                {provider.service_categories.map((category) => category.name).join(' · ')}
              </p>
              {provider.approximate_latitude != null && provider.approximate_longitude != null ? (
                <button
                  type="button"
                  onClick={() => showProvider(provider)}
                  aria-label={t('Show {name} on map', { name: provider.name })}
                  className="mt-2 inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold hover:underline"
                >
                  <MapPin className="size-4" aria-hidden /> {t('Show on map')}
                </button>
              ) : (
                <p className="mt-2 text-xs text-ink-500">{t('Map location unavailable')}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
