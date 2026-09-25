import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import * as client from '@/api/client'
import { AccountStep } from './AccountStep'

it('shows server WhatsApp validation on the details step and advances only after correction', async () => {
  const request = vi
    .spyOn(client, 'apiRequest')
    .mockRejectedValueOnce(
      new client.ApiError(422, 'Invalid number', { whatsapp_phone: ['Enter a valid WhatsApp number.'] }),
    )
    .mockResolvedValueOnce(undefined)
  const next = vi.fn()
  renderWithProviders(
    <AccountStep
      defaultValues={{
        provider_type: 'individual',
        name: 'Test Professional',
        phone: '57654321',
        whatsapp_phone: '123456789',
        email: '',
      }}
      onSubmit={next}
    />,
  )
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
  expect(await screen.findByText('Enter a valid WhatsApp number.')).toBeInTheDocument()
  expect(screen.getByLabelText('WhatsApp number')).toHaveFocus()
  expect(next).not.toHaveBeenCalled()
  await userEvent.clear(screen.getByLabelText('WhatsApp number'))
  await userEvent.type(screen.getByLabelText('WhatsApp number'), '57654322')
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
  expect(request).toHaveBeenLastCalledWith('/register/validate-account', {
    method: 'POST',
    body: expect.objectContaining({ whatsapp_phone: '57654322' }),
  })
  expect(next).toHaveBeenCalledOnce()
})

it('stays on the details step if validation is unavailable', async () => {
  vi.spyOn(client, 'apiRequest').mockRejectedValue(new Error('Offline'))
  const next = vi.fn()
  renderWithProviders(
    <AccountStep
      defaultValues={{ provider_type: 'individual', name: 'Test Professional', phone: '57654321' }}
      onSubmit={next}
    />,
  )
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong')
  expect(next).not.toHaveBeenCalled()
})
