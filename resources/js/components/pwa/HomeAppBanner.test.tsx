import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useLocation } from 'react-router'
import { renderWithProviders } from '@/test/renderWithProviders'
import { HomeAppBanner } from './HomeAppBanner'

function RouteOutput() {
  return <output aria-label="Current route">{useLocation().pathname}</output>
}

function renderBanner() {
  return renderWithProviders(
    <>
      <HomeAppBanner />
      <RouteOutput />
    </>,
  )
}

function offerInstall(outcome: 'accepted' | 'dismissed', fails = false) {
  const prompt = fails
    ? vi.fn().mockRejectedValue(new Error('Unavailable'))
    : vi.fn().mockResolvedValue(undefined)
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
    prompt,
    userChoice: Promise.resolve({ outcome }),
  })
  act(() => {
    window.dispatchEvent(event)
  })
  return prompt
}

describe('HomeAppBanner installation', () => {
  it('opens the native prompt directly and hides the banner after acceptance', async () => {
    renderBanner()
    const prompt = offerInstall('accepted')
    await userEvent.click(screen.getByRole('button', { name: 'Add to Home Screen' }))
    expect(prompt).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button', { name: 'Add to Home Screen' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Current route')).toHaveTextContent(/^\/$/)
  })

  it('opens the instructions when native installation is unavailable', async () => {
    renderBanner()
    await userEvent.click(screen.getByRole('button', { name: 'Add to Home Screen' }))
    expect(screen.getByLabelText('Current route')).toHaveTextContent('/install')
  })

  it('stays on the page when the user declines installation', async () => {
    renderBanner()
    offerInstall('dismissed')
    await userEvent.click(screen.getByRole('button', { name: 'Add to Home Screen' }))
    expect(screen.getByRole('button', { name: 'Add to Home Screen' })).toBeEnabled()
    expect(screen.getByLabelText('Current route')).toHaveTextContent(/^\/$/)
  })

  it('opens the instructions if the native prompt fails', async () => {
    renderBanner()
    offerInstall('dismissed', true)
    await userEvent.click(screen.getByRole('button', { name: 'Add to Home Screen' }))
    expect(screen.getByLabelText('Current route')).toHaveTextContent('/install')
  })
})
