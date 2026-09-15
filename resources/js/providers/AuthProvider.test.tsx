import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { authApi } from '@/api/endpoints'
import { ApiError } from '@/api/client'
import { RequireAdmin, RequireProvider } from '@/components/layout/RouteGuards'
import { renderWithProviders } from '@/test/renderWithProviders'
import type { AuthenticatedUser, OwnedProvider } from '@/types/api'
import { AuthProvider } from './AuthProvider'

function renderGuard(route: string) {
  return renderWithProviders(
    <AuthProvider>
      <Routes>
        <Route path="/" element={<h1>Public home</h1>} />
        <Route path="/login" element={<h1>Sign in</h1>} />
        <Route path="/dashboard" element={<RequireProvider />}>
          <Route index element={<h1>Provider account</h1>} />
        </Route>
        <Route path="/admin" element={<RequireAdmin />}>
          <Route index element={<h1>Admin panel</h1>} />
        </Route>
      </Routes>
    </AuthProvider>,
    { route },
  )
}

const account: AuthenticatedUser = {
  id: 1,
  name: 'Test account',
  email: null,
  phone: '+23051000001',
  roles: [],
  provider: null,
}

describe('Account route permissions', () => {
  it.each(['/admin', '/dashboard'])('requires sign-in for %s', async (route) => {
    vi.spyOn(authApi, 'currentUser').mockRejectedValue(new ApiError(401, 'Unauthenticated'))
    renderGuard(route)
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it.each([{ roles: [] }, { roles: ['admin'] }])(
    'keeps accounts with roles $roles and no profile out of the provider area',
    async ({ roles }) => {
      vi.spyOn(authApi, 'currentUser').mockResolvedValue({ ...account, roles })
      renderGuard('/dashboard')
      expect(await screen.findByRole('heading', { name: 'Public home' })).toBeInTheDocument()
    },
  )

  it('allows an admin to open the admin panel', async () => {
    vi.spyOn(authApi, 'currentUser').mockResolvedValue({ ...account, roles: ['admin'] })
    renderGuard('/admin')
    expect(await screen.findByRole('heading', { name: 'Admin panel' })).toBeInTheDocument()
  })

  it.each([
    ['/dashboard', 'Provider account'],
    ['/admin', 'Public home'],
  ])('applies provider access to %s', async (route, heading) => {
    vi.spyOn(authApi, 'currentUser').mockResolvedValue({
      ...account,
      roles: ['provider'],
      provider: { id: 1 } as OwnedProvider,
    })
    renderGuard(route)
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
  })
})
