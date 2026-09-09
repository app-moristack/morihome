const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

export function formatDistance(distanceKm: number | undefined): string | null {
  if (distanceKm === undefined) {
    return null
  }

  if (distanceKm < 1) {
    return `${Math.max(50, Math.round((distanceKm * 1000) / 50) * 50)} m away`
  }

  return `${distanceKm.toFixed(1).replace(/\.0$/, '')} km away`
}

export function formatDayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek] ?? ''
}

export function formatTimeRange(opensAt: string | null, closesAt: string | null): string {
  if (!opensAt || !closesAt) {
    return 'Closed'
  }

  return `${opensAt.slice(0, 5)} – ${closesAt.slice(0, 5)}`
}

export function formatFieldName(field: string): string {
  return field.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function formatDate(value: string | null): string | null {
  if (!value) {
    return null
  }

  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}
