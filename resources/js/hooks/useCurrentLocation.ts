import { t } from '@/i18n'
import { useCallback, useState } from 'react'
import { publicApi } from '@/api/endpoints'
import { useToast } from './useToast'

const GEOLOCATION_TIMEOUT_MS = 10_000
const MAX_POSITION_AGE_MS = 60_000

export type ResolvedLocation = {
  label: string
  latitude: number
  longitude: number
}

export function useCurrentLocation(onResolved: (location: ResolvedLocation) => void) {
  const [isLocating, setIsLocating] = useState(false)
  const { showToast } = useToast()

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      showToast(t('Your browser cannot share your location.'), 'error')

      return
    }

    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const place = await publicApi.reverseGeocode(coords.latitude, coords.longitude)

          onResolved({
            label: place?.locality ?? place?.label ?? t('My current location'),
            latitude: coords.latitude,
            longitude: coords.longitude,
          })
          showToast(t('Using your current location.'), 'success')
        } catch {
          showToast(t('We found your position but could not name the area.'), 'error')
        } finally {
          setIsLocating(false)
        }
      },
      () => {
        setIsLocating(false)
        showToast(t('We could not read your location. Type your area instead.'), 'error')
      },
      { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: MAX_POSITION_AGE_MS },
    )
  }, [onResolved, showToast])

  return { isLocating, request }
}
