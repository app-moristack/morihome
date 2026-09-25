import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { CredentialsStep } from './CredentialsStep'

it('keeps credentials and consent when reading and closing legal documents', async () => {
  const submit = vi.fn()
  renderWithProviders(<CredentialsStep onSubmit={submit} onBack={vi.fn()} isSubmitting={false} />)
  await userEvent.type(screen.getByLabelText(/^Password/), 'Abcdef12')
  await userEvent.type(screen.getByLabelText(/^Confirm password/), 'Abcdef12')
  await userEvent.click(screen.getByRole('checkbox'))

  for (const [label, title, heading] of [
    ['terms of use', 'Terms of use', 'What MoriHome is'],
    ['privacy policy', 'Privacy policy', 'Your rights'],
  ]) {
    const trigger = screen.getByRole('button', { name: label })
    await userEvent.click(trigger)
    expect(screen.getByRole('dialog', { name: title })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
    expect(submit).not.toHaveBeenCalled()
    if (label === 'terms of use') {
      await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    } else {
      await userEvent.keyboard('{Escape}')
    }
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(screen.getByLabelText(/^Password/)).toHaveValue('Abcdef12')
    expect(screen.getByLabelText(/^Confirm password/)).toHaveValue('Abcdef12')
    expect(screen.getByRole('checkbox')).toBeChecked()
  }

  await userEvent.click(screen.getByRole('button', { name: 'Create my profile' }))
  expect(submit).toHaveBeenCalledWith(
    { password: 'Abcdef12', password_confirmation: 'Abcdef12', accepts_terms: true },
    expect.anything(),
  )
})
