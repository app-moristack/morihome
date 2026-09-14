import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authApi } from '@/api/endpoints'
import LoginPage from './LoginPage'
import { AuthProvider } from '@/providers/AuthProvider'
import { renderWithProviders } from '@/test/renderWithProviders'

beforeEach(() => {
  vi.spyOn(authApi, 'currentUser').mockRejectedValue(new Error('Unauthenticated'))
})

describe('Login page', () => {
  it('links to registration for the selected account type and toggles password visibility', async () => {
    renderWithProviders(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
      { route: '/login' },
    )
    expect(screen.getByRole('link', { name: 'Create Account' })).toHaveAttribute(
      'href',
      '/register?type=individual',
    )
    await userEvent.click(screen.getByRole('radio', { name: /Business/ }))
    expect(screen.getByRole('link', { name: 'Create Account' })).toHaveAttribute(
      'href',
      '/register?type=agency',
    )
    const password = screen.getByLabelText(/^Password/)
    await userEvent.type(password, 'sample-password')
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(password).toHaveAttribute('type', 'text')
    expect(password).toHaveValue('sample-password')
    await userEvent.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(password).toHaveAttribute('type', 'password')
  })

  it('submits credentials through the existing login flow and displays errors', async () => {
    const login = vi.spyOn(authApi, 'login').mockRejectedValue(new Error('Login failed'))
    renderWithProviders(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
      { route: '/login' },
    )
    await userEvent.type(screen.getByLabelText(/Mobile number or email/), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/^Password/), 'sample-password')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Keep me signed in' }))
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    expect(login).toHaveBeenCalledWith(
      { identifier: 'test@example.com', password: 'sample-password', remember: true },
      expect.anything(),
    )
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeEnabled()
  })
})
