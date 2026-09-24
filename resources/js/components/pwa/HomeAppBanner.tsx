import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, BatteryFull, Heart, House, Share, Signal, Wifi, X, Zap } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { useHomeMotion } from '@/hooks/useHomeMotion'
import { useLocale } from '@/hooks/useLocale'
import { t } from '@/i18n'

const benefits = [
  { icon: Zap, title: 'Open instantly', description: 'Like a native app' },
  { icon: House, title: 'Browse listings', description: 'Properties & local services' },
  { icon: Heart, title: 'Always at hand', description: 'Find your next home anytime' },
]

export function HomeAppBanner() {
  useLocale()
  const [dismissed, setDismissed] = useState(false)
  const { reveal, interactive } = useHomeMotion()
  const navigate = useNavigate()
  const { canPromptNatively, isStandalone, install } = useInstallPrompt()
  const [isInstalling, setIsInstalling] = useState(false)

  const handleInstall = async () => {
    if (!canPromptNatively) {
      navigate('/install')
      return
    }

    setIsInstalling(true)
    try {
      if (await install()) setDismissed(true)
    } catch {
      navigate('/install')
    } finally {
      setIsInstalling(false)
    }
  }

  if (dismissed || isStandalone) return null

  return (
    <section className="home-app-section" aria-labelledby="app-title">
      <div className="container-page">
        <motion.div {...reveal()} className="home-app-banner">
          <div className="home-app-illustration" aria-hidden="true">
            <div className="home-app-halo" />
            <div className="home-app-rays">
              <i />
              <i />
              <i />
            </div>
            <div className="home-app-phone">
              <div className="home-app-phone-screen">
                <div className="home-app-phone-status">
                  <span>9:41</span>
                  <span className="flex gap-1">
                    <Signal size={11} />
                    <Wifi size={11} />
                    <BatteryFull size={14} />
                  </span>
                </div>
                <div className="home-app-phone-island" />
                <div className="home-app-phone-icon">
                  <img src="/icons/icon-256.png" alt="" width={96} height={96} loading="lazy" />
                </div>
                <span className="home-app-phone-label">MoriHome</span>
                <div className="home-app-phone-dock">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            </div>
          </div>
          <div className="home-app-copy">
            <h2 id="app-title">{t('Get quicker access to MoriHome')}</h2>
            <p className="home-app-subtitle">
              {t('Add MoriHome to your Home Screen — no download required.')}
            </p>
            <ul className="home-app-benefits">
              {benefits.map(({ icon: Icon, title, description }) => (
                <li key={title}>
                  <span className="home-app-benefit-icon">
                    <Icon size={23} strokeWidth={1.8} aria-hidden />
                  </span>
                  <span>
                    <strong>{t(title)}</strong>
                    <span>{t(description)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <motion.button
            {...interactive}
            type="button"
            onClick={handleInstall}
            disabled={isInstalling}
            aria-busy={isInstalling}
            className="home-app-install"
          >
            <Share size={23} aria-hidden />
            <span>{t('Add to Home Screen')}</span>
            <ArrowRight size={22} aria-hidden />
          </motion.button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="home-app-dismiss"
            aria-label={t('Dismiss app banner')}
          >
            <X size={21} aria-hidden />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
