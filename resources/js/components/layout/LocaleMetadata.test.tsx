import { afterEach, expect, it } from 'vitest'
import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import { setLocale } from '@/i18n'
import { LanguageSwitcher } from './LanguageSwitcher'
import { LocaleMetadata } from './LocaleMetadata'

afterEach(() => {
  cleanup()
  setLocale('en')
  document.head.querySelectorAll('[data-metadata-test]').forEach((element) => element.remove())
})

it('updates French search and sharing metadata when the visitor changes language', async () => {
  for (const [attribute, value] of [
    ['name', 'description'],
    ['property', 'og:title'],
    ['property', 'og:description'],
    ['property', 'og:locale'],
    ['name', 'twitter:description'],
  ]) {
    const meta = document.createElement('meta')
    meta.setAttribute(attribute!, value!)
    meta.setAttribute('data-metadata-test', '')
    document.head.appendChild(meta)
  }
  renderWithProviders(
    <>
      <LanguageSwitcher />
      <LocaleMetadata />
    </>,
    { route: '/properties' },
  )
  await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Change language' }), 'fr')

  expect(document.title).toBe('Immobilier à Maurice : location et vente — MoriHome')
  expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute('content', document.title)
  expect(document.querySelector('meta[property="og:locale"]')).toHaveAttribute('content', 'fr_MU')
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content')
  expect(description).toContain('maisons, appartements, terrains et locaux commerciaux')
  expect(document.querySelector('meta[property="og:description"]')).toHaveAttribute('content', description)
  expect(document.querySelector('meta[name="twitter:description"]')).toHaveAttribute('content', description)
})
