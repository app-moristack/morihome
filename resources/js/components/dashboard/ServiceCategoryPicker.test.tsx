import { useState } from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { ServiceCategoryPicker } from './ServiceCategoryPicker'

vi.mock('@/hooks/useSearchQueries', () => ({
  useCategories: () => ({
    data: [
      { id: 1, name: 'Plumber' },
      { id: 2, name: 'Electrician' },
    ],
  }),
}))

function Example() {
  const [ids, setIds] = useState<number[]>([])
  return <ServiceCategoryPicker selectedIds={ids} onChange={setIds} max={1} />
}

it('blocks additions at the plan limit and allows removing a selection', async () => {
  renderWithProviders(<Example />)
  await userEvent.click(screen.getByRole('button', { name: 'Plumber' }))
  expect(screen.getByRole('button', { name: 'Electrician' })).toBeDisabled()
  await userEvent.click(screen.getByRole('button', { name: 'Plumber' }))
  expect(screen.getByRole('button', { name: 'Electrician' })).toBeEnabled()
  await userEvent.click(screen.getByRole('button', { name: 'Electrician' }))
  expect(screen.getByRole('button', { name: 'Electrician' })).toHaveAttribute('aria-pressed', 'true')
})
