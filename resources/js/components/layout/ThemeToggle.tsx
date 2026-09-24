import { t } from '@/i18n'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => {
      let preference: string | null = null
      try {
        preference = localStorage.getItem('morihome-theme')
      } catch {
        /* Storage may be unavailable. */
      }
      const next = preference === 'dark' || (preference !== 'light' && media.matches)
      document.documentElement.classList.toggle('dark', next)
      setDark(next)
    }
    sync()
    media.addEventListener('change', sync)
    window.addEventListener('storage', sync)
    return () => {
      media.removeEventListener('change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={t(dark ? 'Switch to light mode' : 'Switch to dark mode')}
      onClick={() => {
        const next = !dark
        setDark(next)
        document.documentElement.classList.toggle('dark', next)
        try {
          localStorage.setItem('morihome-theme', next ? 'dark' : 'light')
        } catch {
          /* Keep the in-memory choice. */
        }
      }}
    >
      {dark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
    </button>
  )
}
