import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import { Link } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { authApi, publicApi } from '@/api/endpoints'
import { AuthProvider } from '@/providers/AuthProvider'
import { renderWithProviders } from '@/test/renderWithProviders'
import { PageViewTracker } from './PageViewTracker'

describe('Page view tracking', () => {
  it('counts public navigation once without sending queries, including under StrictMode', async () => {
    vi.spyOn(authApi, 'currentUser').mockRejectedValue(new Error('Guest'))
    const record = vi.spyOn(publicApi, 'recordPageView').mockResolvedValue(undefined)
    renderWithProviders(
      <StrictMode>
        <AuthProvider>
          <PageViewTracker />
          <Link to="/about">About</Link>
          <Link to="/search?term=other">Search again</Link>
        </AuthProvider>
      </StrictMode>,
      { route: '/search?term=private-search' },
    )
    await waitFor(() => expect(record).toHaveBeenCalledTimes(1))
    expect(record).toHaveBeenLastCalledWith({ path: '/search', event_id: expect.any(String) })
    await userEvent.click(screen.getByRole('link', { name: 'Search again' }))
    expect(record).toHaveBeenCalledTimes(1)
    await userEvent.click(screen.getByRole('link', { name: 'About' }))
    await waitFor(() => expect(record).toHaveBeenCalledTimes(2))
    expect(record).toHaveBeenLastCalledWith({ path: '/about', event_id: expect.any(String) })
  })

  it('does not record administrator navigation', async () => {
    vi.spyOn(authApi, 'currentUser').mockResolvedValue({
      id: 1,
      name: 'Admin',
      email: null,
      phone: '',
      roles: ['admin'],
    })
    const record = vi.spyOn(publicApi, 'recordPageView').mockResolvedValue(undefined)
    const result = renderWithProviders(
      <AuthProvider>
        <PageViewTracker />
        <Link to="/about">About</Link>
      </AuthProvider>,
      { route: '/' },
    )
    await waitFor(() => expect(result.queryClient.getQueryData(['auth', 'user'])).toBeDefined())
    await userEvent.click(screen.getByRole('link', { name: 'About' }))
    expect(record).not.toHaveBeenCalled()
  })
})
