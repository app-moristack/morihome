import { useCallback, useState } from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { FilterDrawer } from './FilterDrawer'

function Example() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  return (
    <>
      <button onClick={() => setOpen(true)}>Filters</button>
      {open && (
        <FilterDrawer id="test-filters" title="Search filters" onClose={close}>
          <input aria-label="Location" />
        </FilterDrawer>
      )}
    </>
  )
}

describe('FilterDrawer', () => {
  it('keeps a visible close control, locks background scroll and restores focus on close or Escape', async () => {
    renderWithProviders(<Example />)
    const trigger = screen.getByRole('button', { name: 'Filters' })
    await userEvent.click(trigger)
    expect(screen.getByRole('button', { name: 'Close filters' })).toHaveFocus()
    expect(document.body.style.overflow).toBe('hidden')
    await userEvent.click(screen.getByRole('button', { name: 'Close filters' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(document.body.style.overflow).not.toBe('hidden')
    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
