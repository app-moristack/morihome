import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
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
import { Link } from 'react-router'
import heroImage from '../../images/Grow your business with MoriHome.webp'

const FREE_BENEFITS = [
  'Create your professional profile',
  'List your services',
  'Appear in search results',
  'Direct contact via WhatsApp',
  'Upload up to 5 photos',
  'No commission on jobs',
  'No credit card required',
]

const BUSINESS_BENEFITS = [
  'Everything in the free plan',
  'Featured on the MoriHome homepage',
  'Listed at the top of search results',
  'Verified Business badge',
  'Upload up to 15 photos',
  'Direct contact via WhatsApp',
  'No commission on jobs',
]

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

function PlanBenefits({ items, business = false }: { items: string[]; business?: boolean }) {
  useLocale()
  return (
    <ul className="pro-benefit-list">
      {items.map((item) => (
        <li key={item}>
          <span className={business ? 'business-check' : ''}>
            <Check aria-hidden />
          </span>
          <span>{t(item)}</span>
        </li>
      ))}
    </ul>
  )
}

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

      <section className="container-page pro-plans" aria-label={t('Choose your professional plan')}>
        <article className="pro-plan-card">
          <header>
            <span className="pro-plan-icon free">
              <Users aria-hidden />
            </span>
            <div>
              <h2>{t('Individuals & Self-Employed')}</h2>
              <strong className="free-price">{t('FREE FOREVER')}</strong>
            </div>
          </header>
          <p>{t('Perfect for independent professionals and workers.')}</p>
          <PlanBenefits items={FREE_BENEFITS} />
          <Link to="/register?type=individual" className="pro-plan-button free-button">
            {t('Create Free Account')} <ArrowRight aria-hidden />
          </Link>
          <small>{t('100% free. Always.')}</small>
        </article>

        <article className="pro-plan-card business-plan">
          <span className="free-badge">
            {t('6 PAID')}
            <br />
            {t('PLANS')}
          </span>
          <header>
            <span className="pro-plan-icon">
              <BriefcaseBusiness aria-hidden />
            </span>
            <div>
              <h2>{t('Agencies & Companies')}</h2>
              <strong>{t('From Rs 499 / 6 months')}</strong>
            </div>
          </header>
          <p>{t('Give your business greater visibility on MoriHome.')}</p>
          <PlanBenefits items={BUSINESS_BENEFITS} business />
          <Link to="/register?type=agency" className="pro-plan-button">
            {t('Choose Agency Plans')} <ArrowRight aria-hidden />
          </Link>
          <small>{t('Choose Plus or Pro for Services, Rental and Sales.')}</small>
        </article>
      </section>

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
