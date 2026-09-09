import {
  ArrowRight,
  CircleCheck,
  House,
  List,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { createElement } from 'react'
import { Link, useNavigate } from 'react-router'
import { HomeHeroScene } from '@/components/search/HomeHeroScene'
import { SearchHero } from '@/components/search/SearchHero'
import { WhatsappButton } from '@/components/provider/WhatsappButton'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCategories, useFeaturedProviders } from '@/hooks/useSearchQueries'
import { resolveCategoryIcon } from '@/lib/categoryIcons'
import { emptySearchState, writeSearchState, type SearchFormState } from '@/lib/searchParams'
import { initialsOf } from '@/lib/format'
import type { ProviderSummary } from '@/types/api'
import professionalBanner from '../../images/Grow your business with MoriHome.png'

const TRUST = [
  { icon: MapPin, title: 'Built for Mauritius', body: 'Your town, village or district' },
  { icon: ShieldCheck, title: 'Reviewed profiles', body: 'Checked before publication' },
  { icon: MessageCircle, title: 'Direct contact', body: 'Message on WhatsApp' },
  { icon: Search, title: 'Search freely', body: 'No customer account needed' },
]
const STEPS = [
  { icon: Search, title: 'Search', body: 'Select a service, enter your location and choose a radius.' },
  { icon: List, title: 'Browse', body: 'View matching professionals near you.' },
  { icon: MessageCircle, title: 'Contact', body: 'Get in touch directly via WhatsApp.' },
]
const BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Reviewed professionals',
    body: 'Our team reviews professional profiles before they appear in the directory.',
  },
  {
    icon: MapPin,
    title: 'Professionals near you',
    body: 'Search by town, village and distance to find services in your area.',
  },
  {
    icon: MessageCircle,
    title: 'Direct contact',
    body: 'Contact professionals directly on WhatsApp. No complicated booking process.',
  },
  {
    icon: House,
    title: 'Built for Mauritius',
    body: 'A local platform for Mauritian homeowners and businesses.',
  },
]

function SectionLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="home-section-link">
      {children}
      <ArrowRight className="size-4 shrink-0" aria-hidden />
    </Link>
  )
}

function FeaturedCard({ provider }: { provider: ProviderSummary }) {
  const category = provider.service_categories[0]
  const categoryIcon = createElement(resolveCategoryIcon(category?.icon ?? null), {
    className: 'size-9 shrink-0',
    'aria-hidden': true,
  })
  return (
    <article className="home-provider-card flex min-w-0 flex-col overflow-hidden rounded-xl border border-ink-100 bg-surface shadow-card">
      <Link
        to={`/providers/${provider.slug}`}
        aria-label={`View ${provider.name}'s profile`}
        className={`home-provider-cover ${provider.cover_url ? '' : 'home-provider-cover-identity'}`}
      >
        {provider.cover_url ? (
          <img
            src={provider.cover_url}
            alt={`${provider.name} — ${category?.name ?? 'home services'} in ${provider.locality}`}
            loading="lazy"
            decoding="async"
            width={400}
            height={220}
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            {categoryIcon}
            <span className="text-sm font-semibold">{category?.name ?? provider.provider_type_label}</span>
          </>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <div className="flex items-center gap-2.5">
          {provider.logo_url ? (
            <img
              src={provider.logo_url}
              alt={`${provider.name} logo`}
              loading="lazy"
              width={44}
              height={44}
              className="size-10 rounded-full object-cover"
            />
          ) : (
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-900">
              {initialsOf(provider.name)}
            </span>
          )}
          <div className="min-w-0">
            <h3 className="font-bold">
              <Link to={`/providers/${provider.slug}`} className="hover:underline">
                {provider.name}
              </Link>
            </h3>
            <p className="text-xs text-ink-500">{category?.name ?? provider.provider_type_label}</p>
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-ink-500">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          {provider.locality}
        </p>
        {provider.is_verified && (
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-300">
            <CircleCheck className="size-3" aria-hidden />
            Verified
          </span>
        )}
        {provider.excerpt && (
          <p className="line-clamp-2 text-xs leading-relaxed text-ink-500">{provider.excerpt}</p>
        )}
        <div className="mt-auto pt-1">
          {provider.whatsapp_number ? (
            <WhatsappButton
              slug={provider.slug}
              number={provider.whatsapp_number}
              serviceName={category?.name}
              source="home"
              variant="primary"
              isFullWidth
              label="Contact via WhatsApp"
            />
          ) : (
            <Link to={`/providers/${provider.slug}`} className="home-cta w-full">
              View profile <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategories(true)
  const {
    data: providers = [],
    isLoading: providersLoading,
    isError: providersError,
    refetch,
  } = useFeaturedProviders()
  const categoryLink = (id: number) =>
    `/search?${writeSearchState({ ...emptySearchState(), categoryId: id }).toString()}`
  const runSearch = (state: SearchFormState) => navigate(`/search?${writeSearchState(state).toString()}`)

  return (
    <div className="home-page home-model-page bg-surface">
      <HomeHeroScene />
      <SearchHero
        state={emptySearchState()}
        onSearch={runSearch}
        categories={categories}
        title="Need work done at home?"
        highlightedTitle="Find the right local pro."
        description={
          'Find local professionals near you for repairs, renovation, maintenance and construction across Mauritius.'
        }
        aside={
          <p
            className="home-handwritten hidden px-5 pt-4 text-[2.75rem] lg:block"
            aria-label="Made for Mauritius"
          >
            Made for
            <br />
            Mauritius
            <span aria-hidden />
          </p>
        }
      />

      <section className="home-soft-bg" aria-label="The MoriHome promise">
        <div className="container-page grid grid-cols-2 gap-x-4 gap-y-6 py-7 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, title, body }) => (
            <div key={title} className="home-trust-item flex items-center gap-3 lg:justify-center">
              <Icon className="home-illustrated-icon size-9 shrink-0 sm:size-11" aria-hidden />
              <div>
                <h2 className="text-xs font-bold sm:text-sm">{title}</h2>
                <p className="mt-1 text-[11px] text-ink-600 sm:text-xs">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-services-section" aria-labelledby="services-title">
        <div className="container-page home-section">
          <div className="home-section-heading">
            <div>
              <h2 id="services-title">What do you need help with?</h2>
              <p>Find the right professional for your project.</p>
            </div>
            <SectionLink to="/search">View all services</SectionLink>
          </div>
          {categoriesLoading ? (
            <div className="home-category-grid" aria-label="Loading services">
              {Array.from({ length: 9 }, (_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : categoriesError || !categories.length ? (
            <p className="home-empty">
              Services are unavailable right now.{' '}
              <Link to="/search" className="underline">
                Search all professionals
              </Link>
            </p>
          ) : (
            <ul className="home-category-grid">
              {categories.slice(0, 8).map((category) => {
                const Icon = resolveCategoryIcon(category.icon)
                return (
                  <li key={category.id}>
                    <Link to={categoryLink(category.id)} className="home-category">
                      <Icon className="home-illustrated-icon size-10" aria-hidden />
                      <span>{category.name}</span>
                    </Link>
                  </li>
                )
              })}
              <li>
                <Link to="/search" className="home-category">
                  <MoreHorizontal className="size-10" aria-hidden />
                  <span>More</span>
                </Link>
              </li>
            </ul>
          )}
        </div>
      </section>

      <section className="home-model-section" aria-labelledby="featured-title">
        <div className="container-page home-section">
          <div className="home-section-heading">
            <div>
              <h2 id="featured-title">Featured Professionals</h2>
              <p>Your next home project starts with a local professional. Explore who can help.</p>
            </div>
            <SectionLink to="/search">View all professionals</SectionLink>
          </div>
          {providersLoading ? (
            <div className="home-featured-carousel" aria-label="Loading featured professionals">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : providersError ? (
            <div className="home-empty">
              <p>We couldn’t load the featured professionals.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-3 min-h-11 font-semibold underline"
              >
                Try again
              </button>
            </div>
          ) : providers.length ? (
            <div className="home-featured-carousel" aria-label="Featured professionals">
              {providers.slice(0, 5).map((provider) => (
                <FeaturedCard key={provider.id} provider={provider} />
              ))}
            </div>
          ) : (
            <div className="home-empty flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold">Your next home project starts here.</h3>
                <p className="mt-1 text-sm text-ink-500">
                  Browse the directory to find professionals in your area.
                </p>
              </div>
              <Link to="/search" className="home-cta">
                Find a professional <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="home-soft-bg" aria-labelledby="how-title">
        <div className="container-page home-section relative">
          <div className="home-section-heading">
            <div>
              <h2 id="how-title">How MoriHome works</h2>
              <p>Get the help you need in just a few simple steps.</p>
            </div>
            <p className="home-handwritten hidden sm:block">
              Simple.
              <br />
              Fast. Local.
              <span />
            </p>
          </div>
          <ol className="grid gap-7 pt-3 md:grid-cols-3 md:gap-12">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="relative flex gap-5">
                <span className="home-step-number">{i + 1}</span>
                <div>
                  <Icon className="home-illustrated-icon mb-3 size-10" aria-hidden />
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="mt-1 max-w-52 text-sm leading-relaxed text-ink-600">{body}</p>
                </div>
                {i < 2 && (
                  <ArrowRight className="absolute top-9 -right-6 hidden size-5 md:block" aria-hidden />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="home-model-section home-why-section" aria-labelledby="why-title">
        <div className="container-page home-section grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div>
            <h2 id="why-title" className="text-2xl font-extrabold">
              Why choose MoriHome?
            </h2>
            <div className="mt-5 grid gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
              {BENEFITS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="home-why-benefit border-l border-white/20 pl-4">
                  <Icon className="home-illustrated-icon mb-3 size-8" aria-hidden />
                  <h3 className="text-sm font-bold">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="home-why-trust-card rounded-xl p-5">
            <ShieldCheck className="home-illustrated-icon mb-3 size-8" aria-hidden />
            <h3 className="font-bold">Professionals you can trust.</h3>
            <p className="mt-2 text-sm leading-relaxed">
              Every professional profile is reviewed before publication. The Verified badge identifies
              profiles approved by our team.
            </p>
          </aside>
        </div>
      </section>

      <section className="home-pro-banner relative isolate" aria-labelledby="join-title">
        <img
          src={professionalBanner}
          alt=""
          width={2084}
          height={755}
          loading="lazy"
          className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="home-pro-shade pointer-events-none absolute inset-0 -z-10" />
        <div className="container-page py-12 sm:py-16 lg:py-18">
          <div className="home-pro-content">
            <p className="home-pro-label">
              For local professionals · Free registration
            </p>
            <h2 id="join-title" className="mt-5 text-4xl leading-[1.02] font-extrabold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              Grow your business
              <br />
              with <span className="text-brand-400">MoriHome</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600 sm:text-lg">
              Get discovered by customers looking for your services near you.
            </p>
            <ul className="mt-8 grid max-w-2xl gap-x-8 gap-y-5 text-sm font-semibold sm:grid-cols-2 sm:text-base">
            {[
              'Create your professional profile',
              'Showcase your services and project photos',
              'Hear from customers directly on WhatsApp',
              'Build your local presence',
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <CircleCheck className="size-6 shrink-0 text-brand-500" aria-hidden />
                {benefit}
              </li>
            ))}
            </ul>
            <Link to="/register" className="home-cta mt-9">
              Create Your Free Account <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-app-banner relative isolate overflow-hidden" aria-labelledby="app-title">
        <div className="container-page flex flex-col items-start justify-between gap-5 py-7 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Smartphone className="size-10 shrink-0 text-brand-300" aria-hidden />
            <div>
              <h2 id="app-title" className="text-xl font-bold">
                Keep MoriHome close at hand
              </h2>
              <p className="mt-1 max-w-xl text-sm text-white/85">
                Add MoriHome to your home screen for easy access on iOS and Android.
              </p>
            </div>
          </div>
          <Link
            to="/install"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-brand-300 hover:underline"
          >
            Add to your phone <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  )
}
