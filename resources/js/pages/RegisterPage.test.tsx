import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import * as client from '@/api/client'
import RegisterPage from './RegisterPage'

const { register } = vi.hoisted(() => ({ register: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ register }) }))
vi.mock('@/components/register/LocationStep', () => ({
  LocationStep: ({ onSubmit }: { onSubmit: (value: object) => void }) => (
    <button
      onClick={() =>
        onSubmit({ address: '10 Royal Road', locality: 'Port Louis', latitude: -20.16, longitude: 57.5 })
      }
    >
      Confirm location
    </button>
  ),
}))
vi.mock('@/hooks/useSearchQueries', () => ({
  useSubscriptions: () => ({
    data: [
      {
        id: 1,
        name: 'Services Free',
        description: 'For individuals',
        category: 'services',
        category_label: 'Services',
        tier: 'free',
        price_rupees: 0,
        duration_months: null,
        active_item_limit: 1,
        photos_per_item_limit: 3,
      },
    ],
  }),
}))

it('registers in four steps with the chosen plan and no service selection', async () => {
  vi.spyOn(client, 'apiRequest').mockResolvedValue(undefined)
  renderWithProviders(<RegisterPage />, { route: '/register?type=individual&plan=1' })
  expect(screen.getByRole('list', { name: 'Step 1 of 4' })).toBeInTheDocument()
  await userEvent.type(screen.getByLabelText(/^Full name/), 'Test Professional')
  await userEvent.type(screen.getByLabelText(/^Mobile number/), '57654321')
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await userEvent.click(await screen.findByRole('button', { name: 'Confirm location' }))
  expect(screen.getByRole('list', { name: 'Step 3 of 4' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Services Free/ })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.queryByText('What do you do?')).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
  expect(screen.getByRole('list', { name: 'Step 4 of 4' })).toBeInTheDocument()
  await userEvent.type(screen.getByLabelText(/^Password/), 'Abcdef12')
  await userEvent.type(screen.getByLabelText(/^Confirm password/), 'Abcdef12')
  await userEvent.click(screen.getByRole('checkbox'))
  await userEvent.click(screen.getByRole('button', { name: 'Create my profile' }))
  expect(register).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'Test Professional', subscription_ids: [1], password: 'Abcdef12' }),
  )
  expect(register.mock.calls[0]?.[0]).not.toHaveProperty('service_categories')
})
