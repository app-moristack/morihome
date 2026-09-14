import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { publicApi } from '@/api/endpoints'
import { useAuth } from '@/hooks/useAuth'

export function PageViewTracker() {
  const { pathname } = useLocation()
  const { isAdmin, isLoading } = useAuth()
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    if (isLoading || isAdmin) return
    if (lastPath.current === pathname) return
    lastPath.current = pathname
    if (
      !/^\/(?:search|about|contact|for-professionals|terms|privacy|providers\/[a-z0-9]+(?:-[a-z0-9]+)*)?$/.test(
        pathname,
      )
    )
      return

    // Only the public path and a per-view ID are sent; never search terms or account data.
    void publicApi.recordPageView({ path: pathname, event_id: crypto.randomUUID() }).catch(() => {
      // Analytics must never interrupt browsing.
    })
  }, [pathname, isAdmin, isLoading])

  return null
}
