import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '@/App'
import { authApi, publicApi } from '@/api/endpoints'
import { AuthProvider } from '@/providers/AuthProvider'
import { renderWithProviders } from '@/test/renderWithProviders'

beforeEach(() => {
  vi.spyOn(authApi, 'currentUser').mockRejectedValue(new Error('Unauthenticated'))
  vi.spyOn(publicApi, 'categories').mockResolvedValue([])
})

describe('About page', () => {
  it('renders the new story and MoriStack brand inside the shared navigation and footer', async () => {
    renderWithProviders(
      <AuthProvider>
        <App />
      </AuthProvider>,
      { route: '/about' },
    )

    expect(
      await screen.findByRole('heading', { level: 1, name: /Building\s*stronger homes\s*together/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /contemporary Mauritian home/ })).toHaveAttribute(
      'src',
      expect.stringContaining('mauritius-luxury-home-about-hero.png'),
    )
    expect(
      screen.getByRole('region', { name: /A platform built for\s*Mauritius, by Mauritians/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /home under construction/ })).toHaveAttribute(
      'src',
      expect.stringContaining('mauritius-home-construction-about-story.png'),
    )
    expect(screen.getByRole('region', { name: 'Our values' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'MoriStack' })).toHaveAttribute(
      'src',
      expect.stringContaining('logo-moristack.png'),
    )
    expect(
      within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'About' }),
    ).toHaveAttribute('aria-current', 'page')
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByRole('link', { name: 'Learn more about MoriStack' })).toHaveAttribute(
      'href',
      'https://moristack.mu',
    )
  })
})
