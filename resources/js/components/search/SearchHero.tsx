import { BadgeCheck, Users, Zap } from 'lucide-react'
import type { ReactNode } from 'react'
import { SearchModule } from './SearchModule'
import type { SearchFormState } from '@/lib/searchParams'
import type { ServiceCategory } from '@/types/api'
import hero from '../../../images/le-morne-mauritius-home-services.webp'
import heroVideo from '../../../videos/homepage video.mp4'

type SearchHeroProps = {
  state: SearchFormState
  onSearch: (state: SearchFormState) => void
  categories: ServiceCategory[]
  isBusy?: boolean
  stateKey?: string
  aside?: ReactNode
  title?: string
  highlightedTitle?: string
  description?: ReactNode
  background?: ReactNode
}

const TRUST_POINTS = [
  { icon: Users, label: 'Local people' },
  { icon: BadgeCheck, label: 'Verified listings' },
  { icon: Zap, label: 'Faster support' },
]

export function SearchHero({
  state,
  onSearch,
  categories,
  isBusy = false,
  stateKey,
  aside,
  title = 'Find the right professional',
  highlightedTitle = 'near you.',
  description,
  background,
}: SearchHeroProps) {
  return (
    <section className="site-page-hero search-page-hero relative isolate text-white">
      {background ?? (
        <video
          src={heroVideo}
          poster={hero}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
        />
      )}
      <div className="search-page-hero-shade absolute inset-0 -z-10" />
      <div className="container-page relative py-8 sm:py-10">
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <h1
              aria-label={`${title} ${highlightedTitle}`}
              className="max-w-3xl text-[clamp(2.45rem,5vw,4.25rem)] leading-[1.03] font-extrabold tracking-[-0.04em]"
            >
              {title}
              <br />
              <span className="home-yellow-text">{highlightedTitle}</span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/90 sm:text-lg">
              {description ?? (
                <>
                  Trusted local professionals for your home.
                  <br />
                  Build · Renovate · Repair · Maintain
                </>
              )}
            </p>
          </div>

          {aside ?? (
            <div className="search-hero-trust hidden rounded-xl bg-[#061827]/80 p-5 backdrop-blur-sm lg:flex lg:flex-col lg:gap-4">
              {TRUST_POINTS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 text-xs font-semibold tracking-wide uppercase"
                >
                  <Icon className="size-5 text-brand-300" aria-hidden />
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="search-page-search mt-6">
          <SearchModule
            key={stateKey}
            initialState={state}
            onSearch={onSearch}
            variant="hero"
            isBusy={isBusy}
          />
        </div>

        {categories.length > 0 ? (
          <div className="mt-3 flex [scrollbar-width:none] flex-wrap items-center gap-2 overflow-visible pb-1 text-xs sm:flex-nowrap sm:overflow-x-auto">
            <span className="shrink-0 basis-full font-semibold sm:basis-auto">Popular searches:</span>
            {categories.slice(0, 8).map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onSearch({ ...state, categoryId: category.id, page: 1 })}
                className="search-popular-chip"
              >
                {category.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
