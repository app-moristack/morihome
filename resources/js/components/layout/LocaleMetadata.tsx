import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useLocale } from '@/hooks/useLocale'
import { t } from '@/i18n'

const PAGE_TITLES: Record<string, string> = {
  '/': 'MoriHome — Find services and property in Mauritius',
  '/search': 'Search professionals near you — MoriHome',
  '/properties': 'Property for rent and sale in Mauritius',
  '/about': 'About MoriHome',
  '/contact': 'Contact MoriHome',
  '/for-professionals': 'Grow your business with MoriHome',
  '/register': 'Create your MoriHome account',
  '/login': 'Sign in',
  '/reset-password': 'Reset your password',
  '/terms': 'Terms of use',
  '/privacy': 'Privacy policy',
  '/install': 'Install MoriHome on your phone',
}

const PAGE_DESCRIPTIONS: Record<string, string> = {
  '/': 'Search trusted home-service professionals and browse property for rent or sale across Mauritius. ',
  '/search': 'Compare nearby professionals by distance, see their work and contact them on WhatsApp.',
  '/properties': 'Search houses, apartments, land and commercial property for rent or sale across Mauritius.',
  '/about':
    'MoriHome connects people in Mauritius with reviewed home-service professionals and properties for rent or sale.',
  '/contact': 'Get in touch with the MoriHome team.',
  '/for-professionals':
    'Compare MoriHome plans for individual professionals, agencies and companies in Mauritius.',
  '/register':
    'Register as an individual or agency and choose subscriptions for services, property rentals or property sales.',
  '/terms': 'The terms that govern the use of MoriHome.',
  '/privacy': 'How MoriHome collects, uses and protects your data.',
  '/install': 'Add MoriHome to your iPhone or Android home screen and use it like an app.',
}

export function LocaleMetadata() {
  const locale = useLocale()
  const { pathname } = useLocation()

  useEffect(() => {
    document.documentElement.lang = locale
    const title =
      PAGE_TITLES[pathname] ??
      (pathname.startsWith('/admin')
        ? 'Administration'
        : pathname.startsWith('/dashboard')
          ? 'Provider dashboard'
          : undefined)
    if (!title) return
    document.title = pathname === '/' || pathname === '/search' ? t(title) : `${t(title)} — MoriHome`
    const description = PAGE_DESCRIPTIONS[pathname]
    const setMeta = (selector: string, content: string) => {
      document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content)
    }
    setMeta('meta[property="og:title"]', document.title)
    setMeta('meta[name="twitter:title"]', document.title)
    setMeta('meta[property="og:locale"]', `${locale}_MU`)
    if (description) {
      const text = t(description).trim()
      setMeta('meta[name="description"]', text)
      setMeta('meta[property="og:description"]', text)
      setMeta('meta[name="twitter:description"]', text)
    }
  }, [locale, pathname])

  return null
}
