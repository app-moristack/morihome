import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { UpdatePrompt } from '@/components/pwa/UpdatePrompt'
import { Footer } from './Footer'
import { Header } from './Header'
import { PageViewTracker } from './PageViewTracker'

export function RootLayout() {
  const { pathname } = useLocation()
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-brand-400 focus:px-4 focus:py-2 focus:font-semibold focus:text-ink-900"
      >
        Skip to content
      </a>

      {!isAdminPage && pathname !== '/login' ? <Header /> : null}
      <PageViewTracker />

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      {!isAdminPage && pathname !== '/login' ? <Footer /> : null}
      {!isAdminPage ? <InstallPrompt /> : null}
      <UpdatePrompt />
    </div>
  )
}
