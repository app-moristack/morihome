import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '@/App'
import { authApi, publicApi } from '@/api/endpoints'
import { AuthProvider } from '@/providers/AuthProvider'
import { renderWithProviders } from '@/test/renderWithProviders'

beforeEach(() => {
  vi.spyOn(authApi, 'currentUser').mockRejectedValue(new Error('Unauthenticated'))
  vi.spyOn(publicApi, 'categories').mockResolvedValue([])
})

describe('Contact page', () => {
  it('renders contact options and FAQs inside the shared navigation and footer', async () => {
    renderWithProviders(
      <AuthProvider>
        <App />
      </AuthProvider>,
      { route: '/contact' },
    )

    expect(await screen.findByRole('heading', { level: 1, name: /We’re here\s*to help/ })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Contact MoriHome' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Contact Information' })).toBeInTheDocument()
    expect(
      within(screen.getByRole('complementary', { name: 'Contact Information' })).getByRole('link', {
        name: 'moristack@gmail.com',
      }),
    ).toHaveAttribute('href', 'mailto:moristack@gmail.com')
    expect(screen.getByRole('link', { name: 'Chat with us directly' })).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/23057079335'),
    )
    expect(screen.getByRole('heading', { name: 'Quick Answers' })).toBeInTheDocument()
    expect(screen.getByText('How do I register as a professional?')).toBeInTheDocument()
    expect(screen.getByText(/Agencies and companies pay a yearly subscription/)).not.toBeVisible()
    expect(
      within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Contact' }),
    ).toHaveAttribute('aria-current', 'page')
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    )
  })

  it('expands and collapses an FAQ answer when its summary is clicked', async () => {
    renderWithProviders(
      <AuthProvider>
        <App />
      </AuthProvider>,
      { route: '/contact' },
    )

    const question = await screen.findByText('How do I register as a professional?')
    const answer = screen.getByText('Choose “Join as a Pro” and follow the simple registration process.')

    expect(answer).not.toBeVisible()
    await userEvent.click(question)
    expect(answer).toBeVisible()
    expect(screen.getByText(/Agencies and companies pay a yearly subscription/)).not.toBeVisible()
    await userEvent.click(question)
    expect(answer).not.toBeVisible()
  })

  it('submits the message and confirms delivery', async () => {
    const sendContactMessage = vi.spyOn(publicApi, 'sendContactMessage').mockResolvedValue({
      message: 'Your message has been sent. We will get back to you shortly.',
    })
    renderWithProviders(
      <AuthProvider>
        <App />
      </AuthProvider>,
      { route: '/contact' },
    )
    await screen.findByRole('heading', { level: 1, name: /We’re here\s*to help/ })

    await userEvent.type(screen.getByLabelText('Your name'), 'Alex Martin')
    await userEvent.type(screen.getByLabelText('Your email address'), 'alex@example.com')
    await userEvent.selectOptions(screen.getByLabelText('Subject'), 'Profile or listing support')
    await userEvent.type(screen.getByLabelText('Your message'), 'Please help with my listing.')
    await userEvent.click(screen.getByRole('button', { name: 'Send Message' }))

    expect(sendContactMessage).toHaveBeenCalledWith({
      name: 'Alex Martin',
      email: 'alex@example.com',
      phone: '',
      subject: 'Profile or listing support',
      message: 'Please help with my listing.',
    })
    expect(await screen.findByRole('status')).toHaveTextContent('Your message has been sent')
    expect(screen.getByLabelText('Your name')).toHaveValue('')
  })
})
