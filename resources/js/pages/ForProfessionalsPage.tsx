import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import {
  BarChart3,
  BriefcaseBusiness,
  CreditCard,
  Eye,
  FileText,
  Handshake,
  Images,
  MessageCircle,
  RefreshCcw,
  ShieldCheck,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PlanCarousel } from '@/components/subscriptions/PlanCarousel'
import heroImage from '../../images/Grow your business with MoriHome.webp'

const WHY_JOIN = [
  { icon: Eye, title: 'More visibility', text: 'Reach more people actively looking for your services.' },
  {
    icon: Handshake,
    title: 'Build trust',
    text: 'Showcase your expertise and build your reputation locally.',
  },
  { icon: BarChart3, title: 'Grow your business', text: 'Get more enquiries and increase your income.' },
  { icon: Images, title: 'Showcase your work', text: 'Upload photos of your past projects or products.' },
  { icon: Users, title: 'Join the community', text: 'Together we build a stronger Mauritius.' },
]

const HERO_PROMISES: { icon: LucideIcon; label: string }[] = [
  { icon: Users, label: 'More clients' },
  { icon: BarChart3, label: 'Increase visibility' },
  { icon: ShieldCheck, label: 'Build trust' },
  { icon: BriefcaseBusiness, label: 'Grow your business' },
]

const PAYMENT_PROMISES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: FileText, title: 'No commitment', text: "You're in control." },
  { icon: CreditCard, title: 'No credit card needed', text: 'Simple and hassle-free.' },
  { icon: MessageCircle, title: 'Payment via Juice', text: 'Secure and easy payment.' },
  { icon: RefreshCcw, title: 'No automatic renewal', text: 'You will never be charged automatically.' },
]

export default function ForProfessionalsPage() {
  useLocale()
  return (
    <div className="professionals-page">
      <section className="site-page-hero pro-hero" aria-labelledby="pro-title">
        <img src={heroImage} alt={t('Mauritian home-service professional overlooking Le Morne')} />
        <div className="pro-hero-wash" aria-hidden />
        <div className="container-page relative">
          <div className="pro-hero-copy">
            <p className="pro-eyebrow">{t('For professionals')}</p>
            <h1 id="pro-title">
              {t('Join MoriHome &')}
              <br />
              <span>{t('grow your business.')}</span>
            </h1>
            <p>
              {t(
                'Get discovered by people across Mauritius looking for your services. Create your profile, showcase your work and receive enquiries directly via WhatsApp.',
              )}
            </p>
            <div className="pro-promises">
              {HERO_PROMISES.map(({ icon: Icon, label }) => (
                <div key={label}>
                  <Icon aria-hidden />
                  <span>{t(label)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PlanCarousel />

      <section className="pro-payment-strip">
        <div className="container-page">
          {PAYMENT_PROMISES.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <span>
                <Icon aria-hidden />
              </span>
              <p>
                <strong>{t(title)}</strong>
                <small>{t(text)}</small>
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pro-why">
        <p className="pro-eyebrow">{t('Why join MoriHome?')}</p>
        <div className="pro-why-grid">
          {WHY_JOIN.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <span>
                <Icon aria-hidden />
              </span>
              <h3>{t(title)}</h3>
              <p>{t(text)}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
