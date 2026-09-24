import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { Navigate, Outlet, useLocation } from 'react-router'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'

function useGuardState() {
  const { isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  return { isLoading, isAuthenticated, redirectTo: `/login?next=${encodeURIComponent(location.pathname)}` }
}

export function RequireProvider() {
  useLocale()
  const { isProvider } = useAuth()
  const { isLoading, isAuthenticated, redirectTo } = useGuardState()

  if (isLoading) {
    return <Spinner label={t('Checking your account')} />
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return isProvider ? <Outlet /> : <Navigate to="/" replace />
}

export function RequireAdmin() {
  useLocale()
  const { isAdmin } = useAuth()
  const { isLoading, isAuthenticated, redirectTo } = useGuardState()

  if (isLoading) {
    return <Spinner label={t('Checking your account')} />
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />
}
