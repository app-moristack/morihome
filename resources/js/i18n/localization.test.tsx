import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { PropertyFilters } from '@/components/search/PropertyFilters'
import { renderWithProviders } from '@/test/renderWithProviders'
import { apiRequest } from '@/api/client'
import { categoryLabel } from './labels'
import { getLocale, normalizeLocale, setLocale, t } from './index'
import messages from './messages.json'
import publicMessages from './public-messages.json'
import extraMessages from './extra-messages.json'

afterEach(() => {
  cleanup()
  setLocale('en')
  vi.unstubAllGlobals()
})

describe('language selection', () => {
  it('switches the visible languages without losing an unfinished filter form', async () => {
    const apply = vi.fn()
    renderWithProviders(
      <>
        <LanguageSwitcher />
        <PropertyFilters params={new URLSearchParams()} onApply={apply} />
      </>,
    )
    expect(screen.queryByRole('option', { name: 'Kreol Morisien' })).not.toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Location'), 'Moka')
    await userEvent.selectOptions(screen.getByLabelText('Bedrooms'), '3')
    await userEvent.click(screen.getByLabelText('Swimming pool'))
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Change language' }), 'fr')
    expect(screen.getByLabelText('Localisation')).toHaveValue('Moka')
    expect(screen.getByLabelText('Chambres')).toHaveValue('3')
    expect(screen.getByLabelText('Piscine')).toBeChecked()
    expect(document.documentElement.lang).toBe('fr')
    expect(localStorage.getItem('morihome_locale')).toBe('fr')
    expect(document.cookie).toContain('morihome_locale=fr')

    await userEvent.click(screen.getByRole('button', { name: 'Appliquer les filtres' }))
    const params = apply.mock.calls[0]![0] as URLSearchParams
    expect(params.get('location')).toBe('Moka')
    expect(params.get('bedrooms')).toBe('3')
    expect(params.getAll('amenities[]')).toEqual(['pool'])

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Changer de langue' }), 'en')
    expect(screen.getByLabelText('Bedrooms')).toHaveValue('3')
    expect(screen.getByRole('button', { name: 'Apply filters' })).toBeVisible()
  })

  it('sends the current language to the API and isolates unsupported language codes', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [] }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    setLocale('fr')
    await apiRequest('/categories')
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/categories',
      expect.objectContaining({
        headers: expect.objectContaining({ 'Accept-Language': 'fr' }),
      }),
    )
    expect(normalizeLocale('fr-MU')).toBe('fr')
    expect(normalizeLocale('../../fr')).toBe('en')
    expect(getLocale()).toBe('fr')
    expect(normalizeLocale('mfe')).toBe('en')
  })

  it('translates controlled categories and interpolates names without translating authored content', () => {
    setLocale('fr')
    expect(categoryLabel('Plumber')).toBe('Plombier')
    expect(categoryLabel('Home')).toBe('Home')
    expect(categoryLabel('My custom service')).toBe('My custom service')
    expect(t("View {name}'s profile", { name: 'Home' })).toBe('Voir le profil de Home')
  })
})

it('keeps both translations and every interpolation placeholder in the catalogs', () => {
  const catalog = { ...publicMessages, ...messages, ...extraMessages }
  const placeholders = (text: string) =>
    [...text.matchAll(/\{\w+\}|:(?:app|service)\b/g)].map((match) => match[0]).sort()
  for (const [source, translations] of Object.entries(catalog)) {
    expect(translations, source).toHaveLength(2)
    for (const translation of translations) {
      expect(translation.trim(), source).not.toBe('')
      expect(placeholders(translation), source).toEqual(placeholders(source))
    }
  }
})
