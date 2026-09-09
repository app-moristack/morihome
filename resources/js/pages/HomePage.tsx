import {
  ArrowRight,
  ChartNoAxesColumnIncreasing,
  CircleCheck,
  Clock3,
  Handshake,
  Heart,
  House,
  List,
  MapPin,
  MessageCircle,
  MonitorSmartphone,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Smartphone,
  Users,
  Zap,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { SearchHero } from '@/components/search/SearchHero'
import { WhatsappButton } from '@/components/provider/WhatsappButton'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCategories, useFeaturedProviders } from '@/hooks/useSearchQueries'
import { resolveCategoryIcon } from '@/lib/categoryIcons'
import { emptySearchState, writeSearchState, type SearchFormState } from '@/lib/searchParams'
import { initialsOf } from '@/lib/format'
import type { ProviderSummary } from '@/types/api'
import room from '../../images/mauritius-home-renovation-living-room.webp'
import phoneWelcome from '../../images/morihome-mobile-app-welcome.webp'
import phoneSearch from '../../images/morihome-mobile-app-professional-search.webp'

const TRUST = [
  { icon: Users, title: 'Local Professionals', body: 'Across Mauritius' },
  { icon: ShieldCheck, title: 'Verified Listings', body: 'For your peace of mind' },
  { icon: Zap, title: 'Quick Contact', body: 'Via WhatsApp' },
  { icon: House, title: 'Stronger Homes', body: 'Stronger communities' },
]
const STEPS = [
  { icon: Search, title: 'Search', body: 'Select a service, enter your location and choose a radius.' },
  { icon: List, title: 'Browse', body: 'View matching professionals near you.' },
  { icon: MessageCircle, title: 'Contact', body: 'Get in touch directly via WhatsApp.' },
]
const BENEFITS = [
  { icon: Handshake, title: 'Local & Reliable', body: 'Real professionals in your area' },
  { icon: ShieldCheck, title: 'Verified Listings', body: 'Manual validation for quality and trust' },
  { icon: Clock3, title: 'Save Time', body: 'Find the right pro in minutes' },
  { icon: Heart, title: 'Support Local', body: 'A stronger Mauritius together' },
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
  return (
    <article className="home-provider-card flex min-w-0 flex-col overflow-hidden rounded-xl border border-ink-100 bg-surface shadow-card">
      <Link
        to={`/providers/${provider.slug}`}
        aria-label={`View ${provider.name}'s profile`}
        className="home-provider-cover"
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
          <House className="size-16" aria-hidden />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          {provider.logo_url ? (
            <img
              src={provider.logo_url}
              alt=""
              loading="lazy"
              width={44}
              height={44}
              className="size-11 rounded-full object-cover"
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
    <div className="home-page bg-surface">
      <SearchHero
        state={emptySearchState()}
        onSearch={runSearch}
        categories={categories}
        title="Your home."
        highlightedTitle="The right pro."
        description="Find trusted local professionals for construction, renovation, repairs and maintenance across Mauritius."
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

      <section className="container-page home-section" aria-labelledby="services-title">
        <div className="home-section-heading">
          <div>
            <h2 id="services-title">Browse by Service</h2>
            <p>Find the right professional for your project</p>
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

      <section className="container-page home-section max-w-none" aria-labelledby="featured-title">
        <div className="home-section-heading">
          <div>
            <h2 id="featured-title">Featured Professionals</h2>
            <p>Discover local expertise across Mauritius.</p>
          </div>
          <SectionLink to="/search">View all professionals</SectionLink>
        </div>
        {providersLoading ? (
          <div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
            aria-label="Loading featured professionals"
          >
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {providers.map((provider) => (
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
      </section>

      <section className="home-app-banner relative isolate overflow-hidden" aria-labelledby="app-title">
        <div className="container-page relative grid gap-8 py-10 md:grid-cols-2 md:py-12">
          <div className="relative z-10">
            <h2 id="app-title" className="text-4xl leading-[1.1] font-extrabold tracking-tight lg:text-5xl">
              Take MoriHome
              <br />
              <span className="home-yellow-text">with you</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/90 sm:text-lg">
              Add MoriHome to your home screen and access it like a mobile app on iOS and Android.
            </p>
            <ul className="my-7 flex flex-wrap gap-x-5 gap-y-4 text-xs sm:text-sm">
              <li className="flex items-center gap-2">
                <Smartphone className="size-7" aria-hidden />
                <span>
                  Add to
                  <br />
                  Home Screen
                </span>
              </li>
              <li className="flex items-center gap-2">
                <MonitorSmartphone className="size-7" aria-hidden />
                <span>
                  Install on
                  <br />
                  Android
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CircleCheck className="size-7" aria-hidden />
                <span>
                  Fast. Simple.
                  <br />
                  Always with you.
                </span>
              </li>
            </ul>
            <Link to="/install" className="home-cta">
              Learn how <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="home-phone-art" aria-label="MoriHome mobile app previews">
            <img
              src={phoneWelcome}
              alt="MoriHome welcome screen on a phone"
              width={600}
              height={990}
              loading="lazy"
              decoding="async"
              className="home-phone-welcome"
            />
            <img
              src={phoneSearch}
              alt="MoriHome mobile search with service, location and radius fields"
              width={600}
              height={990}
              loading="lazy"
              decoding="async"
              className="home-phone-search"
            />
          </div>
        </div>
      </section>

      <section
        className="container-page home-section grid gap-7 lg:grid-cols-[1fr_260px]"
        aria-labelledby="why-title"
      >
        <div>
          <h2 id="why-title" className="text-2xl font-extrabold">
            Why choose MoriHome?
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
            {BENEFITS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="border-l border-ink-100 pl-4">
                <Icon className="home-illustrated-icon mb-3 size-8" aria-hidden />
                <h3 className="text-sm font-bold">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="home-soft-bg flex flex-col justify-center rounded-xl p-6">
          <ShieldCheck className="home-illustrated-icon mb-3 size-8" aria-hidden />
          <h3 className="font-bold">Peace of mind starts here.</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Every professional is reviewed by our team before appearing in the directory.
          </p>
          <Link to="/about" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
            Our commitment <ArrowRight className="size-4" aria-hidden />
          </Link>
        </aside>
      </section>

      <section className="home-pro-banner relative isolate" aria-labelledby="join-title">
        <img
          src={room}
          alt=""
          width={1600}
          height={640}
          loading="lazy"
          className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="home-pro-shade pointer-events-none absolute inset-0 -z-10" />
        <div className="container-page grid items-center gap-8 py-10 lg:grid-cols-[1fr_1fr] lg:pl-64">
          <div>
            <h2 id="join-title" className="text-2xl font-extrabold">
              Are you a professional?
            </h2>
            <p className="mt-2 text-sm text-ink-600">Join MoriHome and get discovered by people near you.</p>
            <Link to="/register" className="home-cta mt-5">
              Create Your Free Account <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ul className="grid grid-cols-3 gap-4 text-center text-xs font-semibold">
            {[
              { icon: ChartNoAxesColumnIncreasing, label: 'Grow your business' },
              { icon: Users, label: 'Reach more clients' },
              { icon: ShieldCheck, label: 'Build your reputation' },
            ].map(({ icon: Icon, label }) => (
              <li key={label}>
                <span className="mx-auto mb-3 grid size-16 place-items-center rounded-full bg-surface/80">
                  <Icon className="home-illustrated-icon size-9" aria-hidden />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
