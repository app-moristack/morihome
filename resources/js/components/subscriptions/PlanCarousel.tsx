import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, House, KeyRound, Wrench } from 'lucide-react'
import { Link } from 'react-router'
import { useLocale } from '@/hooks/useLocale'
import { useSubscriptions } from '@/hooks/useSearchQueries'
import { t } from '@/i18n'
import { planLabel } from '@/i18n/labels'
import { planFeatures } from '@/lib/planFeatures'

const ICONS = { services: Wrench, rental: KeyRound, sales: House }

export function PlanCarousel() {
  useLocale()
  const { data: plans = [], isLoading, isError, refetch } = useSubscriptions()
  const track = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ start: true, end: false })

  const move = (direction: number) => {
    const element = track.current
    if (!element) return
    const card = element.firstElementChild as HTMLElement | null
    element.scrollBy({
      left: direction * ((card?.offsetWidth ?? element.clientWidth) + 24),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }

  return (
    <section className="container-page py-8" aria-label={t('Choose your professional plan')}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold">{t('Choose your subscriptions')}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="plan-carousel-control"
            aria-label={t('Previous')}
            aria-controls="professional-plans"
            disabled={position.start || plans.length === 0}
            onClick={() => move(-1)}
          >
            <ArrowLeft aria-hidden />
          </button>
          <button
            type="button"
            className="plan-carousel-control"
            aria-label={t('Next')}
            aria-controls="professional-plans"
            disabled={position.end || plans.length === 0}
            onClick={() => move(1)}
          >
            <ArrowRight aria-hidden />
          </button>
        </div>
      </div>
      {isLoading && <p role="status">{t('Loading subscriptions')}</p>}
      {isError && (
        <div role="alert">
          <p>{t('Could not load subscriptions.')}</p>
          <button type="button" className="underline" onClick={() => void refetch()}>
            {t('Try again')}
          </button>
        </div>
      )}
      <div
        id="professional-plans"
        ref={track}
        className="plan-carousel"
        tabIndex={0}
        aria-label={t('Choose your professional plan')}
        onScroll={(event) => {
          const element = event.currentTarget
          setPosition({
            start: element.scrollLeft <= 1,
            end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
          })
        }}
        onKeyDown={(event) => {
          if (
            event.target === event.currentTarget &&
            (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
          ) {
            event.preventDefault()
            move(event.key === 'ArrowLeft' ? -1 : 1)
          }
        }}
      >
        {plans.map((plan) => {
          const Icon = ICONS[plan.category]
          const free = plan.tier === 'free'
          return (
            <article key={plan.id} className={`pro-plan-card ${free ? '' : 'business-plan'}`}>
              <span className="mb-4 self-start rounded-full bg-ink-100 px-3 py-1 text-xs font-bold">
                {t(free ? 'Individuals & Self-Employed' : 'Agencies & Companies')}
              </span>
              <header>
                <span className={`pro-plan-icon ${free ? 'free' : ''}`}>
                  <Icon aria-hidden />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold">{planLabel(plan.name)}</h3>
                  <strong className={free ? 'free-price' : ''}>
                    {free ? t('Free') : `Rs ${plan.price_rupees}`}
                  </strong>
                  {plan.duration_months && (
                    <span className="text-sm text-ink-500">
                      / {plan.duration_months} {t('months')}
                    </span>
                  )}
                </div>
              </header>
              <p>{planLabel(plan.description)}</p>
              <ul className="pro-benefit-list">
                {planFeatures(plan).map((feature) => (
                  <li key={feature}>
                    <span className={free ? '' : 'business-check'}>
                      <Check aria-hidden />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={`/register?type=${free ? 'individual' : 'agency'}&plan=${plan.id}`}
                className={`pro-plan-button ${free ? 'free-button' : ''}`}
                aria-label={`${t('Choose plan')}: ${planLabel(plan.name)}`}
              >
                {t('Choose plan')}
                <ArrowRight aria-hidden />
              </Link>
            </article>
          )
        })}
      </div>
    </section>
  )
}
