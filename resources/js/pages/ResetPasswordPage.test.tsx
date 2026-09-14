import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import * as client from '@/api/client'
import ResetPasswordPage from './ResetPasswordPage'

beforeEach(() => vi.restoreAllMocks())

it('submits the token and new password and confirms the reset', async () => {
  const request = vi.spyOn(client, 'apiRequest').mockResolvedValue({ message: 'Password reset' })
  renderWithProviders(<ResetPasswordPage />, { route: '/reset-password?token=abc&email=pro%40example.mu' })
  await userEvent.type(screen.getByLabelText(/^New password/), 'New-Password123')
  await userEvent.type(screen.getByLabelText(/^Confirm new password/), 'New-Password123')
  await userEvent.click(screen.getByRole('button', { name: 'Update password' }))
  expect(request).toHaveBeenCalledWith('/reset-password', {
    method: 'POST',
    body: {
      token: 'abc',
      email: 'pro@example.mu',
      password: 'New-Password123',
      password_confirmation: 'New-Password123',
    },
  })
  expect(await screen.findByRole('status')).toHaveTextContent('other sessions were signed out')
})

it('does not submit when the recovery link is incomplete', () => {
  const request = vi.spyOn(client, 'apiRequest')
  renderWithProviders(<ResetPasswordPage />, { route: '/reset-password' })
  expect(screen.getByText(/Open the complete link/)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Update password' })).not.toBeInTheDocument()
  expect(request).not.toHaveBeenCalled()
})
