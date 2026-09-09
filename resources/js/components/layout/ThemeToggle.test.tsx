import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ThemeToggle } from './ThemeToggle'
import { renderWithProviders } from '@/test/renderWithProviders'

afterEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

describe('ThemeToggle', () => {
  it('switches themes and remembers the selection across remounts', async () => {
    const view = renderWithProviders(<ThemeToggle />)
    await userEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem('morihome-theme')).toBe('dark')
    view.unmount()
    renderWithProviders(<ThemeToggle />)
    await userEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }))
    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem('morihome-theme')).toBe('light')
  })

  it('uses the system preference until a saved choice overrides it', async () => {
    const original = window.matchMedia('(prefers-color-scheme: dark)')
    vi.spyOn(window, 'matchMedia').mockReturnValue({ ...original, matches: true })
    renderWithProviders(<ThemeToggle />)
    expect(document.documentElement).toHaveClass('dark')
    localStorage.setItem('morihome-theme', 'light')
    fireEvent(window, new Event('storage'))
    await waitFor(() => expect(document.documentElement).not.toHaveClass('dark'))
  })

  it('still toggles when browser storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Blocked')
    })
    renderWithProviders(<ThemeToggle />)
    await userEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    expect(document.documentElement).toHaveClass('dark')
  })
})
