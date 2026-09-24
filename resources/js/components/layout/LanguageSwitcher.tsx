import { Globe2 } from 'lucide-react'
import { VISIBLE_LANGUAGES, setLocale, t, type Locale } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'

export function LanguageSwitcher() {
  const locale = useLocale()

  return (
    <label className="relative flex min-h-11 shrink-0 items-center gap-1 rounded-full border border-ink-200 bg-surface pl-3 text-ink-800 hover:bg-ink-50">
      <Globe2 className="size-4 shrink-0" aria-hidden />
      <span className="sr-only">{t('Change language')}</span>
      <select
        value={locale}
        onChange={(event) => {
          setLocale(event.target.value as Locale)
        }}
        title={VISIBLE_LANGUAGES.find((language) => language.code === locale)?.name}
        className="min-h-11 w-14 cursor-pointer rounded-full border-0 bg-transparent py-2 pr-2 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        {VISIBLE_LANGUAGES.map((language) => (
          <option key={language.code} value={language.code} lang={language.code} aria-label={language.name}>
            {language.short}
          </option>
        ))}
      </select>
    </label>
  )
}
