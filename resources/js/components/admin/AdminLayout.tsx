import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { useQuery } from '@tanstack/react-query'
import {
  Bell,
  ChevronDown,
  CreditCard,
  ExternalLink,
  Grid2X2,
  House,
  LogOut,
  Menu,
  Search,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { adminApi } from '@/api/endpoints'
import { queryKeys } from '@/api/queryKeys'
import { useAuth } from '@/hooks/useAuth'
import { initialsOf } from '@/lib/format'
import mark from '../../../images/morihome-house-services-logo.webp'
import '../../../css/admin.css'

export function AdminLayout() {
  useLocale()
  const { user, logout } = useAuth()
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [scope, setScope] = useState('users')
  const [logoutError, setLogoutError] = useState(false)
  const { data } = useQuery({
    queryKey: queryKeys.adminDashboard(),
    queryFn: () => adminApi.dashboard(),
    refetchInterval: 60_000,
  })
  const pending = data?.providers.pending ?? 0
  const current = pathname + search
  const navItems = [
    { to: '/admin/users', label: 'All Users' },
    { to: '/admin/users?type=individual', label: 'Individuals' },
    { to: '/admin/users?type=agency', label: 'Businesses' },
    { to: '/admin/users?status=pending', label: 'Pending Verification' },
  ]

  return (
    <div className="admin-shell">
      {sidebarOpen ? (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label={t('Close navigation')}
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <Link to="/admin" className="admin-brand" aria-label={t('MoriHome admin dashboard')}>
          <span>
            <img src={mark} alt="" />
            Mori<b>Home</b>
          </span>
          <small>{t('Local professionals. A stronger tomorrow.')}</small>
        </Link>
        <button
          className="admin-close-sidebar"
          aria-label={t('Close menu')}
          onClick={() => setSidebarOpen(false)}
        >
          <X size={20} />
        </button>
        <nav aria-label={t('Admin navigation')}>
          <Link
            to="/admin"
            className={pathname === '/admin' ? 'is-active' : ''}
            aria-current={pathname === '/admin' ? 'page' : undefined}
            onClick={() => setSidebarOpen(false)}
          >
            <House size={18} />
            {t('Dashboard')}
          </Link>
          <p className="admin-nav-label">{t('Manage')}</p>
          <div className="admin-nav-group">
            <Users size={18} />
            {t('Users')}
            <ChevronDown size={15} />
          </div>
          <div className="admin-subnav">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={current === item.to ? 'is-active' : ''}
                aria-current={current === item.to ? 'page' : undefined}
                onClick={() => setSidebarOpen(false)}
              >
                {t(item.label)}
                {item.label === 'Pending Verification' && pending > 0 ? <span>{pending}</span> : null}
              </Link>
            ))}
          </div>
          <Link
            to="/admin/categories"
            className={pathname === '/admin/categories' ? 'is-active' : ''}
            aria-current={pathname === '/admin/categories' ? 'page' : undefined}
            onClick={() => setSidebarOpen(false)}
          >
            <Grid2X2 size={18} />
            {t('Service Categories')}
          </Link>
          <Link
            to="/admin/subscriptions"
            className={pathname === '/admin/subscriptions' ? 'is-active' : ''}
            aria-current={pathname === '/admin/subscriptions' ? 'page' : undefined}
            onClick={() => setSidebarOpen(false)}
          >
            <CreditCard size={18} />
            {t('Subscriptions')}
          </Link>
        </nav>
        <Link to="/" className="admin-view-site">
          {t('View Website')}
          <ExternalLink size={15} />
        </Link>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-button"
            aria-label={t('Toggle navigation')}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={21} />
          </button>
          <form
            className="admin-global-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
              navigate(`/admin/${scope}?term=${encodeURIComponent(term.trim())}`)
              setSidebarOpen(false)
            }}
          >
            <Search size={17} aria-hidden />
            <input
              aria-label={t('Search administration')}
              placeholder={t('Search users, services, categories…')}
              maxLength={100}
              value={term}
              onChange={(event) => setTerm(event.target.value)}
            />
            <select
              aria-label={t('Search in')}
              value={scope}
              onChange={(event) => setScope(event.target.value)}
            >
              <option value="users">{t('Users')}</option>
              <option value="categories">{t('Categories')}</option>
            </select>
            <button type="submit" className="sr-only">
              {t('Search')}
            </button>
          </form>
          <div className="admin-topbar-actions">
            <LanguageSwitcher />
            <div className="admin-popover-anchor">
              <button
                type="button"
                className="admin-notifications-button"
                aria-label={t('Notifications: {count} pending reviews', { count: pending })}
                aria-expanded={notificationsOpen}
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen)
                  setAccountOpen(false)
                }}
              >
                <Bell size={20} />
                {pending > 0 ? <span>{pending > 99 ? '99+' : pending}</span> : null}
              </button>
              {notificationsOpen ? (
                <div className="admin-popover">
                  <strong>{t('Pending verification')}</strong>
                  <p>
                    {pending
                      ? t('{count} provider profiles are waiting for review.', { count: pending })
                      : t('You’re all caught up.')}
                  </p>
                  <Link to="/admin/users?status=pending" onClick={() => setNotificationsOpen(false)}>
                    {t('Open review queue →')}
                  </Link>
                </div>
              ) : null}
            </div>
            <div className="admin-popover-anchor">
              <button
                className="admin-account-button"
                type="button"
                aria-expanded={accountOpen}
                onClick={() => {
                  setAccountOpen(!accountOpen)
                  setNotificationsOpen(false)
                }}
              >
                <span className="admin-avatar">{initialsOf(user?.name ?? t('Admin'))}</span>
                <span>
                  <strong>{user?.name}</strong>
                  <small>{t('Administrator')}</small>
                </span>
                <ChevronDown size={15} />
              </button>
              {accountOpen ? (
                <div className="admin-popover">
                  <strong>{user?.name}</strong>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await logout()
                        navigate('/login')
                      } catch {
                        setLogoutError(true)
                      }
                    }}
                  >
                    <LogOut size={16} /> {t('Sign out')}
                  </button>
                  {logoutError ? <p role="alert">{t('Could not sign out. Please try again.')}</p> : null}
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <div className="admin-page">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
