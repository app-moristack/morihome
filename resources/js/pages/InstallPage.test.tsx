import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { renderWithProviders } from '@/test/renderWithProviders'
import InstallPage from './InstallPage'

vi.mock('@/hooks/useInstallPrompt')
const install = vi.fn()
beforeEach(() => {
  install.mockReset().mockResolvedValue(true)
  vi.mocked(useInstallPrompt).mockReturnValue({
    platform: 'desktop',
    isStandalone: false,
    shouldOffer: false,
    canPromptNatively: false,
    install,
    dismiss: vi.fn(),
  })
})

describe('Install page', () => {
  it('shows both installation guides and detected platform without a native prompt', () => {
    renderWithProviders(<InstallPage />)
    expect(screen.getByRole('heading', { name: 'iPhone & iPad' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Android' })).toBeInTheDocument()
    expect(screen.getByText('Keep “Open as Web App” on.')).toBeInTheDocument()
    expect(screen.getByText('desktop')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Install MoriHome' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Need help/ })).toHaveAttribute('href', '/contact')
  })

  it('invokes the available native installation and reports acceptance', async () => {
    vi.mocked(useInstallPrompt).mockReturnValue({
      platform: 'android',
      isStandalone: false,
      shouldOffer: true,
      canPromptNatively: true,
      install,
      dismiss: vi.fn(),
    })
    renderWithProviders(<InstallPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Install MoriHome' }))
    expect(install).toHaveBeenCalledOnce()
    expect(await screen.findByRole('status')).toHaveTextContent('being added to your home screen')
  })

  it('shows the installed state and keeps the native install button hidden', () => {
    vi.mocked(useInstallPrompt).mockReturnValue({
      platform: 'ios',
      isStandalone: true,
      shouldOffer: false,
      canPromptNatively: true,
      install,
      dismiss: vi.fn(),
    })
    renderWithProviders(<InstallPage />)
    expect(screen.getByRole('status')).toHaveTextContent('You’re already installed')
    expect(screen.queryByRole('button', { name: 'Install MoriHome' })).not.toBeInTheDocument()
  })

  it('handles a failed installation with a useful message', async () => {
    install.mockRejectedValue(new Error('Unavailable'))
    vi.mocked(useInstallPrompt).mockReturnValue({
      platform: 'android',
      isStandalone: false,
      shouldOffer: true,
      canPromptNatively: true,
      install,
      dismiss: vi.fn(),
    })
    renderWithProviders(<InstallPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Install MoriHome' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Installation could not start')
    expect(screen.getByRole('button', { name: 'Install MoriHome' })).toBeEnabled()
  })
})
