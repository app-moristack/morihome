import messages from './messages.json'
import extraMessages from './extra-messages.json'
import publicMessages from './public-messages.json'

export const LANGUAGES = [
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'fr', name: 'Français', short: 'FR' },
  { code: 'mfe', name: 'Kreol Morisien', short: 'KM' },
] as const
export type Locale = (typeof LANGUAGES)[number]['code']
// Keep Kreol translations available for re-enabling later.
export const VISIBLE_LANGUAGES = LANGUAGES.filter((language) => language.code !== 'mfe')
const STORAGE_KEY = 'morihome_locale'
const listeners = new Set<() => void>()
const catalog: Record<string, string[]> = { ...publicMessages, ...messages, ...extraMessages }

export function normalizeLocale(value: string | null | undefined): Locale {
  const code = value?.toLowerCase().split('-')[0]
  return VISIBLE_LANGUAGES.find((language) => language.code === code)?.code ?? 'en'
}

function initialLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return normalizeLocale(saved)
  } catch {
    /* Storage may be unavailable in private browsing. */
  }
  const cookie = document.cookie.split('; ').find((value) => value.startsWith(`${STORAGE_KEY}=`))
  return normalizeLocale(cookie?.split('=')[1] ?? document.documentElement.lang)
}

let locale = initialLocale()
export const getLocale = () => locale
export const getFormatLocale = () => (locale === 'en' ? 'en-MU' : 'fr-MU')
export function subscribeLocale(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setLocale(next: Locale) {
  locale = normalizeLocale(next)
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale
    document.cookie = `${STORAGE_KEY}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      /* Keep the selection for this session. */
    }
  }
  listeners.forEach((listener) => listener())
}

/** Translate interface copy only; never pass user-authored content to this function. */
export function t(source: string, values: Record<string, string | number> = {}): string {
  const translated = locale === 'en' ? source : (catalog[source]?.[locale === 'fr' ? 0 : 1] ?? source)
  return translated.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match))
}
