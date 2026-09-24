import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { LayoutDashboard, LogOut, Menu, ShieldCheck, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Brand } from './Brand'
import { LanguageSwitcher } from './LanguageSwitcher'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Services' },
  { to: '/properties', label: 'Properties' },
  { to: '/for-professionals', label: 'Join us' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Header() {
  useLocale()
  const { isAuthenticated, isAdmin, isProvider, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const [menuPathname, setMenuPathname] = useState(location.pathname)
  const navigate = useNavigate()
  const { showToast } = useToast()

  if (menuPathname !== location.pathname) {
    setMenuPathname(location.pathname)
    setIsMenuOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    showToast('You have been signed out.', 'success')
    navigate('/')
  }

  return (
    <header
      className="site-header sticky top-0 z-40 border-b border-ink-100 bg-surface/95 backdrop-blur-md"
      style={{ paddingTop: 'var(--safe-top)' }}
    >
      <div className="container-page flex h-20 items-center justify-between gap-2 lg:gap-4">
        <Brand />

        <nav className="hidden items-center gap-1 xl:flex" aria-label={t('Main')}>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-pill px-2 py-3 text-xs font-medium whitespace-nowrap transition-colors xl:px-3 xl:text-sm',
                  isActive ? 'bg-ink-100 text-ink-900' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
                )
              }
            >
              {t(link.label)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          {isAdmin ? (
            <Button
              size="sm"
              variant="ghost"
              leadingIcon={<ShieldCheck className="size-4" />}
              onClick={() => navigate('/admin')}
            >
              {t('Admin')}
            </Button>
          ) : null}
          {isProvider ? (
            <Button
              size="sm"
              variant="ghost"
              leadingIcon={<LayoutDashboard className="size-4" />}
              onClick={() => navigate('/dashboard')}
            >
              {t('Dashboard')}
            </Button>
          ) : null}
          {isAuthenticated ? (
            <Button
              size="sm"
              variant="secondary"
              leadingIcon={<LogOut className="size-4" />}
              onClick={handleLogout}
            >
              {t('Sign out')}
            </Button>
          ) : (
            <>
              <Link to="/login" className="theme-toggle" aria-label={t('Sign in')}>
                <UserRound className="size-5" aria-hidden />
              </Link>
              <Button
                size="sm"
                onClick={() => navigate('/for-professionals')}
                className="min-h-11 px-5 whitespace-nowrap"
              >
                {t('Start for free')}
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="grid size-11 place-items-center rounded-full text-ink-800 hover:bg-ink-100 xl:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? t('Close menu') : t('Open menu')}
          >
            {isMenuOpen ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <nav
          id="mobile-navigation"
          aria-label={t('Mobile')}
          className="animate-rise border-t border-ink-100 bg-surface xl:hidden"
        >
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-12 items-center rounded-xl px-3 text-base font-semibold',
                    isActive ? 'bg-ink-100 text-ink-900' : 'text-ink-700',
                  )
                }
              >
                {t(link.label)}
              </NavLink>
            ))}

            {isProvider ? (
              <NavLink
                to="/dashboard"
                className="flex min-h-12 items-center rounded-xl px-3 font-semibold text-ink-700"
              >
                {t('My dashboard')}
              </NavLink>
            ) : null}
            {isAdmin ? (
              <NavLink
                to="/admin"
                className="flex min-h-12 items-center rounded-xl px-3 font-semibold text-ink-700"
              >
                {t('Admin')}
              </NavLink>
            ) : null}

            <div className="mt-2">
              {isAuthenticated ? (
                <Button isFullWidth variant="secondary" onClick={handleLogout}>
                  {t('Sign out')}
                </Button>
              ) : (
                <Button isFullWidth onClick={() => navigate('/login')}>
                  {t('Sign in')}
                </Button>
              )}
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  )
}
