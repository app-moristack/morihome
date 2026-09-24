import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import {
  ArrowRight,
  Cloud,
  CodeXml,
  Gem,
  Handshake,
  House,
  Quote,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react'
import aboutHero from '../../images/mauritius-luxury-home-about-hero.png'
import coast from '../../images/le-morne-mauritius-home-services.webp'
import storyImage from '../../images/mauritius-home-construction-about-story.png'
import moristackLogo from '../../images/logo-moristack.png'

const VALUES = [
  {
    icon: Handshake,
    title: 'Trust',
    description: 'Reviewed professional profiles you can explore with confidence.',
  },
  { icon: Users, title: 'Local First', description: 'Supporting Mauritian talent and businesses.' },
  { icon: Gem, title: 'Simplicity', description: 'A seamless and easy experience for everyone.' },
  {
    icon: House,
    title: 'Stronger Communities',
    description: 'Building better homes for a brighter Mauritius.',
  },
]

function Eyebrow({ children }: { children: React.ReactNode }) {
  useLocale()
  return (
    <p className="about-eyebrow">
      <span aria-hidden />
      {children}
    </p>
  )
}

export default function AboutPage() {
  useLocale()
  return (
    <div className="about-page">
      <section className="site-page-hero about-hero" aria-labelledby="about-title">
        <img
          src={aboutHero}
          alt={t('A contemporary Mauritian home beneath a mountain at sunset')}
          className="about-hero-image"
          fetchPriority="high"
        />
        <div className="about-hero-wash" aria-hidden />
        <div className="container-page relative">
          <div className="about-hero-copy">
            <Eyebrow>{t('About us')}</Eyebrow>
            <h1 id="about-title">
              {t('Building')}
              <br />
              <span>{t('stronger homes')}</span>
              <br />
              {t('together.')}
            </h1>
            <p className="about-intro">
              {t(
                'MoriHome connects you with trusted local professionals and properties for rent or sale across Mauritius.',
              )}
            </p>
            <div className="about-hero-promises">
              {[
                { icon: Users, label: 'Local Professionals' },
                { icon: ShieldCheck, label: 'Trusted Listings' },
                { icon: House, label: 'Stronger Communities' },
              ].map(({ icon: Icon, label }) => (
                <div key={label}>
                  <Icon className="home-illustrated-icon" aria-hidden />
                  <span>{t(label)}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="home-handwritten site-page-hero-note">
            {t('For a')}
            <br />
            {t('Better Mauritius')}
            <span aria-hidden />
          </p>
        </div>
      </section>

      <section className="container-page about-story" aria-labelledby="story-title">
        <div>
          <Eyebrow>{t('Our story')}</Eyebrow>
          <h2 id="story-title">
            {t('A platform built for')}
            <br />
            <span>{t('Mauritius, by Mauritians.')}</span>
          </h2>
          <p>
            {t(
              'MoriHome was born from a simple idea: to make it easier for homeowners and businesses in Mauritius to find reliable, skilled professionals for their projects.',
            )}
          </p>
          <p>
            {t(
              'Whether you need the right person for a repair, a home to rent or a property to buy, MoriHome brings trusted local professionals and property listings together in one place.',
            )}
          </p>
        </div>
        <div className="about-story-visual">
          <img
            src={storyImage}
            alt={t('A Mauritian home under construction beneath a mountain at sunset')}
            width={1536}
            height={1024}
            loading="lazy"
          />
          <blockquote>
            <Quote aria-hidden />
            <p>
              {t('Better homes.')}
              <br />
              {t('Brighter lives.')}
              <br />
              {t('A stronger Mauritius.')}
            </p>
            <span aria-hidden />
          </blockquote>
        </div>
      </section>

      <section className="about-values" aria-labelledby="values-title">
        <div className="container-page">
          <h2 id="values-title" className="sr-only">
            {t('Our values')}
          </h2>
          <Eyebrow>{t('Our values')}</Eyebrow>
          <div className="about-values-grid">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <article key={title}>
                <div className="about-value-icon">
                  <Icon className="home-illustrated-icon" aria-hidden />
                </div>
                <h3>{t(title)}</h3>
                <p>{t(description)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-moristack" aria-labelledby="moristack-title">
        <img src={coast} className="about-moristack-landscape" alt="" loading="lazy" />
        <div className="container-page about-moristack-grid">
          <div>
            <Eyebrow>{t('Part of MoriStack')}</Eyebrow>
            <h2 id="moristack-title">
              {t('We are part of')} <span>MoriStack.</span>
            </h2>
            <p>
              {t(
                'MoriHome is a product of MoriStack, a Mauritius-based tech company passionate about creating digital solutions that make a real difference in people’s lives. Through innovative platforms like MoriHome, we aim to empower local communities, support businesses, and build a smarter, more connected Mauritius.',
              )}
            </p>
            <a href="https://moristack.mu" className="about-button">
              {t('Learn more about MoriStack')} <ArrowRight size={18} aria-hidden />
            </a>
          </div>
          <img
            src={moristackLogo}
            alt="MoriStack"
            width={224}
            height={224}
            loading="lazy"
            className="about-moristack-logo"
          />
          <div className="about-moristack-services">
            <ul>
              {[
                { icon: CodeXml, label: 'Web Development' },
                { icon: Smartphone, label: 'Web & Mobile Applications' },
                { icon: Cloud, label: 'Digital Platforms' },
                { icon: Users, label: 'Local Impact' },
              ].map(({ icon: Icon, label }) => (
                <li key={label}>
                  <Icon size={25} aria-hidden />
                  {t(label)}
                </li>
              ))}
            </ul>
            <p className="home-handwritten">
              {t('Ideas today.')}
              <br />
              {t('A brighter Mauritius tomorrow.')}
              <span aria-hidden />
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
