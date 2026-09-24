import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CircleHelp,
  Download,
  Laptop,
  MoreVertical,
  Share,
  ShieldCheck,
  Smartphone,
  SquarePlus,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import phoneImage from '../../images/morihome-mobile-app-welcome.webp'
import roomImage from '../../images/mauritius-home-renovation-living-room.webp'
import '../../css/install.css'

const IOS_STEPS = [
  { title: 'Open MoriHome in Safari.', detail: 'Use Safari on your iPhone or iPad.' },
  { title: 'Tap the Share button.', detail: 'Look in the toolbar, or inside the More menu.', icon: Share },
  {
    title: 'Tap “Add to Home Screen”.',
    detail: 'Scroll down in the share sheet to find it.',
    icon: SquarePlus,
  },
  { title: 'Keep “Open as Web App” on.', detail: 'If shown, enable this for the full app experience.' },
  { title: 'Tap “Add”.', detail: 'MoriHome will appear on your home screen.' },
]
const ANDROID_STEPS = [
  { title: 'Open MoriHome in Chrome.', detail: 'Visit this website on your Android phone.' },
  { title: 'Tap the three-dot menu.', detail: 'Find it in the top-right corner.', icon: MoreVertical },
  {
    title: 'Tap “Install app” or “Add to Home screen”.',
    detail: 'Choose Install if another prompt appears.',
  },
  { title: 'Confirm, and you’re all set.', detail: 'Open MoriHome directly from your home screen.' },
]

function PhoneGuide({ android = false }: { android?: boolean }) {
  useLocale()
  return (
    <div className={`install-phone ${android ? 'install-phone-android' : ''}`} aria-hidden="true">
      <div className="install-phone-notch" />
      <div className="install-phone-screen">
        <div className="install-phone-status">
          <span>9:41</span>
          <span>▮▮▮ ▰</span>
        </div>
        <div className="install-phone-url">
          <ShieldCheck size={9} /> {'morihome.mu'} <MoreVertical size={10} />
        </div>
        <div className="install-phone-brand">
          <img src="/icons/icon-96.png" alt="" />
          <strong>MoriHome</strong>
        </div>
        {android ? (
          <div className="install-browser-menu">
            {['New tab', 'New Incognito tab', 'History', 'Downloads', 'Bookmarks', 'Recent tabs'].map(
              (item) => (
                <span key={item}>{t(item)}</span>
              ),
            )}
            <strong>
              <Download size={12} />
              {t('Install app')}
            </strong>
            <span>
              <SquarePlus size={12} />
              {t('Add to Home screen')}
            </span>
            <span>
              {t('Desktop site')} <i className="install-checkbox" />
            </span>
            <span>{t('Settings')}</span>
            <span>{t('Help & feedback')}</span>
          </div>
        ) : (
          <div className="install-share-sheet">
            <div className="install-share-grip" />
            <div className="install-share-app">
              <img src="/icons/icon-96.png" alt="" />
              <span>
                <strong>MoriHome</strong>
                <small>{'morihome.mu'}</small>
              </span>
              <span>×</span>
            </div>
            {['Copy', 'Add to Reading List', 'Add Bookmark', 'Add to Favourites', 'Find on Page'].map(
              (item) => (
                <span className="install-share-row" key={item}>
                  {t(item)}
                  <SquarePlus size={10} />
                </span>
              ),
            )}
            <strong className="install-share-highlight">
              {t('Add to Home Screen')} <SquarePlus size={13} />
            </strong>
            <span className="install-share-row">
              {t('Print')} <SquarePlus size={10} />
            </span>
            <div className="install-webapp-toggle">
              <strong>{t('Open as Web App')}</strong>
              <span />
            </div>
            <div className="install-phone-add">{t('Add')}</div>
          </div>
        )}
        <div className="install-phone-home" />
      </div>
    </div>
  )
}

export default function InstallPage() {
  useLocale()
  const { canPromptNatively, isStandalone, install, platform } = useInstallPrompt()
  const [isInstalling, setIsInstalling] = useState(false)
  const [message, setMessage] = useState('')
  const [installError, setInstallError] = useState(false)
  const handleInstall = async () => {
    setIsInstalling(true)
    setMessage('')
    setInstallError(false)
    try {
      const accepted = await install()
      setMessage(
        accepted
          ? t('MoriHome is being added to your home screen.')
          : t('You can install later, or follow the steps below.'),
      )
    } catch {
      setInstallError(true)
      setMessage(t('Installation could not start. Please follow the steps below or try again.'))
    } finally {
      setIsInstalling(false)
    }
  }

  return (
    <div className="install-page">
      <section className="install-hero" aria-labelledby="install-title">
        <img src={roomImage} className="install-hero-room" alt="" />
        <div className="container-page install-hero-inner">
          <div className="install-hero-copy">
            <p className="install-eyebrow">{t('Progressive web app')}</p>
            <h1 id="install-title">
              {t('Install MoriHome')}
              <br />
              <span>{t('on your phone')}</span>
            </h1>
            <p>
              {t(
                'Get quick access to MoriHome, just like a native app. Full screen, no browser bar, and one tap away when you need it.',
              )}
            </p>
            <ul className="install-benefits">
              <li>
                <span>
                  <Zap />
                </span>
                <div>
                  <strong>{t('Faster access')}</strong>
                  <small>{t('Open in one tap')}</small>
                </div>
              </li>
              <li>
                <span>
                  <Smartphone />
                </span>
                <div>
                  <strong>{t('App-like experience')}</strong>
                  <small>{t('Full screen, no browser bar')}</small>
                </div>
              </li>
            </ul>
          </div>
          <img
            src={phoneImage}
            className="install-hero-phone"
            alt={t('MoriHome app on a phone, with a view of Le Morne')}
          />
          <p className="home-handwritten install-hero-note">
            {t('Your work.')}
            <br />
            {t('Anytime.')}
            <br />
            {t('Anywhere.')}
            <span aria-hidden />
          </p>
        </div>
      </section>

      <div className="container-page install-content">
        {isStandalone ? (
          <div className="install-native-status" role="status">
            <BadgeCheck />
            <div>
              <strong>{t('You’re already installed!')}</strong>
              <p>{t('You’re using MoriHome as an app. Everything is ready.')}</p>
            </div>
          </div>
        ) : canPromptNatively ? (
          <div className="install-native-status">
            <div>
              <strong>{t('Your browser is ready to install MoriHome.')}</strong>
              <p>{t('Add it to your home screen in one tap.')}</p>
            </div>
            <Button onClick={handleInstall} isLoading={isInstalling} leadingIcon={<Download size={18} />}>
              {t('Install MoriHome')}
            </Button>
          </div>
        ) : null}
        {message && !isStandalone ? (
          <p className="install-feedback" role={installError ? 'alert' : 'status'}>
            {t(message)}
          </p>
        ) : null}
        <div className="install-guides">
          <section className="install-guide" aria-labelledby="ios-install-title">
            <header>
              <Smartphone className="install-platform-icon" aria-hidden />
              <div>
                <h2 id="ios-install-title">{t('iPhone & iPad')}</h2>
                <p>{t('Install MoriHome using Safari')}</p>
              </div>
              <span className="install-platform-badge">iOS (Safari)</span>
            </header>
            <div className="install-guide-body">
              <ol>
                {IOS_STEPS.map(({ title, detail, icon: Icon }, index) => (
                  <li key={title}>
                    <span className="install-step-number">{index + 1}</span>
                    <div>
                      <strong>
                        {t(title)}
                        {Icon ? <Icon size={15} aria-hidden /> : null}
                      </strong>
                      <p>{t(detail)}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <PhoneGuide />
            </div>
            <a
              className="install-official-help"
              href="https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Apple’s installation guide')} <ArrowRight size={12} />
            </a>
          </section>
          <section className="install-guide" aria-labelledby="android-install-title">
            <header>
              <Bot className="install-platform-icon android" aria-hidden />
              <div>
                <h2 id="android-install-title">Android</h2>
                <p>{t('Install MoriHome using Chrome')}</p>
              </div>
              <span className="install-platform-badge android">Android (Chrome)</span>
            </header>
            <div className="install-guide-body">
              <ol>
                {ANDROID_STEPS.map(({ title, detail, icon: Icon }, index) => (
                  <li key={title}>
                    <span className="install-step-number">{index + 1}</span>
                    <div>
                      <strong>
                        {t(title)}
                        {Icon ? <Icon size={15} aria-hidden /> : null}
                      </strong>
                      <p>{t(detail)}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <PhoneGuide android />
            </div>
            <a
              className="install-official-help"
              href="https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid&hl=en"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Chrome’s installation guide')} <ArrowRight size={12} />
            </a>
          </section>
        </div>
        <div className="install-bottom">
          <div className="install-detected">
            <span>
              <Laptop aria-hidden />
            </span>
            <div>
              <p>
                {t('Detected platform:')}{' '}
                <strong>
                  {platform === 'ios' ? 'iPhone / iPad' : platform === 'android' ? 'Android' : t('desktop')}
                </strong>
              </p>
              <small>
                {t('Profile links you share will open correctly in a browser or the installed app.')}
              </small>
            </div>
          </div>
          <Link to="/contact" className="install-help">
            <CircleHelp aria-hidden />
            <span>
              <strong>{t('Need help?')}</strong>
              <small>{t('Check our FAQ or contact us.')}</small>
            </span>
            <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  )
}
