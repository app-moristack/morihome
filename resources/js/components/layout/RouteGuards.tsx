import { Navigate, Outlet, useLocation } from 'react-router'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'

function useGuardState() {
  const { isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  return { isLoading, isAuthenticated, redirectTo: `/login?next=${encodeURIComponent(location.pathname)}` }
}

export function RequireProvider() {
  const { isProvider } = useAuth()
  const { isLoading, isAuthenticated, redirectTo } = useGuardState()

  if (isLoading) {
    return <Spinner label="Checking your account" />
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return isProvider ? <Outlet /> : <Navigate to="/" replace />
}

export function RequireAdmin() {
  const { isAdmin } = useAuth()
  const { isLoading, isAuthenticated, redirectTo } = useGuardState()

  if (isLoading) {
    return <Spinner label="Checking your account" />
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />
}
