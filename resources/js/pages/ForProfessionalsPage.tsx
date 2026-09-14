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
import heroImage from '../../images/Grow your business with MoriHome.png'

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
  { icon: Handshake, title: 'Build trust', text: 'Show reviews and build your reputation locally.' },
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
  return (
    <ul className="pro-benefit-list">
      {items.map((item) => (
        <li key={item}>
          <span className={business ? 'business-check' : ''}>
            <Check aria-hidden />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function ForProfessionalsPage() {
  return (
    <div className="professionals-page">
      <section className="site-page-hero pro-hero" aria-labelledby="pro-title">
        <img src={heroImage} alt="Mauritian home-service professional overlooking Le Morne" />
        <div className="pro-hero-wash" aria-hidden />
        <div className="container-page relative">
          <div className="pro-hero-copy">
            <p className="pro-eyebrow">For professionals</p>
            <h1 id="pro-title">
              Join MoriHome &amp;
              <br />
              <span>grow your business.</span>
            </h1>
            <p>
              Get discovered by people across Mauritius looking for your services. Create your profile,
              showcase your work and receive enquiries directly via WhatsApp.
            </p>
            <div className="pro-promises">
              {HERO_PROMISES.map(({ icon: Icon, label }) => (
                <div key={label}>
                  <Icon aria-hidden />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pro-plans" aria-label="Choose your professional plan">
        <article className="pro-plan-card">
          <header>
            <span className="pro-plan-icon free">
              <Users aria-hidden />
            </span>
            <div>
              <h2>Individuals &amp; Self-Employed</h2>
              <strong className="free-price">FREE FOREVER</strong>
            </div>
          </header>
          <p>Perfect for independent professionals and workers.</p>
          <PlanBenefits items={FREE_BENEFITS} />
          <Link to="/register/individual" className="pro-plan-button free-button">
            Create Free Account <ArrowRight aria-hidden />
          </Link>
          <small>100% free. Always.</small>
        </article>

        <article className="pro-plan-card business-plan">
          <span className="free-badge">
            3 MONTHS
            <br />
            FREE
          </span>
          <header>
            <span className="pro-plan-icon">
              <BriefcaseBusiness aria-hidden />
            </span>
            <div>
              <h2>Agencies &amp; Companies</h2>
              <strong>Rs 800 / year</strong>
            </div>
          </header>
          <p>Give your business greater visibility on MoriHome.</p>
          <PlanBenefits items={BUSINESS_BENEFITS} business />
          <Link to="/register/business" className="pro-plan-button">
            Start 3 Months Free <ArrowRight aria-hidden />
          </Link>
          <small>No commitment. Pay manually after the free period.</small>
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
                <strong>{title}</strong>
                <small>{text}</small>
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pro-why">
        <p className="pro-eyebrow">Why join MoriHome?</p>
        <div className="pro-why-grid">
          {WHY_JOIN.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <span>
                <Icon aria-hidden />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
