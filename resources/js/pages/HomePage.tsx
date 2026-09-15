import {
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CircleCheck,
  House,
  KeyRound,
  List,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { createElement, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { HomeHeroScene } from '@/components/search/HomeHeroScene'
import { SearchHero } from '@/components/search/SearchHero'
import { WhatsappButton } from '@/components/provider/WhatsappButton'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCategories, useFeaturedProperties, useFeaturedProviders } from '@/hooks/useSearchQueries'
import { resolveCategoryIcon } from '@/lib/categoryIcons'
import { emptySearchState, writeSearchState, type SearchFormState } from '@/lib/searchParams'
import { initialsOf } from '@/lib/format'
import type { PropertyListing, ProviderSummary } from '@/types/api'
import professionalBanner from '../../images/Grow your business with MoriHome-services-properties.png'

const TRUST = [
  { icon: MapPin, title: 'Built for Mauritius', body: 'Your town, village or district' },
  { icon: ShieldCheck, title: 'Trusted listings', body: 'Services and properties in one place' },
  { icon: MessageCircle, title: 'Direct contact', body: 'Contact providers and property listers' },
  { icon: Search, title: 'Search freely', body: 'Find a service, rental or property for sale' },
]
const STEPS = [
  { icon: Search, title: 'Search', body: 'Choose Services or Property and tell us where to look.' },
  { icon: List, title: 'Browse', body: 'Compare professionals, rentals and properties for sale.' },
  { icon: MessageCircle, title: 'Contact', body: 'Get in touch directly with the person who listed it.' },
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
    body: 'A local platform for home services, rentals and property sales.',
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

function FeaturedPropertyCard({ listing }: { listing: PropertyListing }) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-ink-100 bg-surface shadow-card">
      <div className="relative h-40 bg-[#e3edf1]">
        {listing.images[0] ? (
          <img
            src={listing.images[0].url}
            alt={listing.title}
            loading="lazy"
            decoding="async"
            width={400}
            height={240}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <Building2 className="size-12 text-[#527182]" aria-hidden />
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-brand-400 px-2.5 py-1 text-xs font-bold text-ink-950">
          {listing.purpose === 'rental' ? 'For rent' : 'For sale'}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 text-[#102c3f]">
        <div>
          <h3 className="line-clamp-2 font-bold">{listing.title}</h3>
          <p className="mt-1 text-lg font-extrabold">
            Rs {listing.price_rupees.toLocaleString('en-MU')}
            {listing.purpose === 'rental' ? <small className="text-xs font-medium"> / month</small> : null}
          </p>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-ink-500">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{listing.locality}</span>
        </p>
        <div className="flex gap-4 text-xs text-ink-500">
          {listing.bedrooms !== null ? (
            <span className="flex items-center gap-1">
              <BedDouble className="size-4" aria-hidden /> {listing.bedrooms} beds
            </span>
          ) : null}
          {listing.bathrooms !== null ? (
            <span className="flex items-center gap-1">
              <Bath className="size-4" aria-hidden /> {listing.bathrooms} baths
            </span>
          ) : null}
        </div>
        <Link
          to={`/properties?purpose=${listing.purpose}&location=${encodeURIComponent(listing.locality)}`}
          className="mt-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-brand-400 px-4 text-sm font-bold text-ink-950 hover:bg-brand-300"
        >
          View property <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const [featuredPropertyPurpose, setFeaturedPropertyPurpose] = useState<'rental' | 'sales'>('rental')
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
  const {
    data: featuredPropertyResults,
    isLoading: featuredPropertiesLoading,
    isError: featuredPropertiesError,
    refetch: refetchFeaturedProperties,
  } = useFeaturedProperties(featuredPropertyPurpose)
  const featuredProperties = featuredPropertyResults?.data ?? []
  const categoryLink = (id: number) =>
    `/search?${writeSearchState({ ...emptySearchState(), categoryId: id }).toString()}`
  const runSearch = (state: SearchFormState) => navigate(`/search?${writeSearchState(state).toString()}`)
  const runPropertySearch = (search: {
    purpose: 'rental' | 'sales'
    propertyType: string
    location: string
    maxPrice: number | null
  }) => {
    const params = new URLSearchParams({ purpose: search.purpose })
    if (search.propertyType) params.set('property_type', search.propertyType)
    if (search.location) params.set('location', search.location)
    if (search.maxPrice) params.set('max_price', String(search.maxPrice))
    navigate(`/properties?${params.toString()}`)
  }

  return (
    <div className="home-page home-model-page bg-surface">
      <HomeHeroScene />
      <SearchHero
        state={emptySearchState()}
        onSearch={runSearch}
        onPropertySearch={runPropertySearch}
        categories={categories}
        title="Services and properties,"
        highlightedTitle="all in one local place."
        description={
          'Find trusted local professionals, homes for rent and properties for sale — anywhere in Mauritius.'
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

      <section className="home-soft-bg" aria-labelledby="property-title">
        <div className="container-page home-section">
          <div className="home-section-heading">
            <div>
              <h2 id="property-title">Find your next property</h2>
              <p>Browse homes and spaces for rent or sale across Mauritius.</p>
            </div>
            <SectionLink to="/properties">View all properties</SectionLink>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/properties?purpose=rental"
              className="card flex items-center gap-4 p-5 transition-all hover:border-brand-300 hover:shadow-lifted"
            >
              <span className="grid size-14 place-items-center rounded-xl bg-brand-100">
                <KeyRound className="size-7" aria-hidden />
              </span>
              <span>
                <strong className="block text-lg">Property for rent</strong>
                <small className="text-ink-500">Find houses, apartments and commercial spaces to rent.</small>
              </span>
              <ArrowRight className="ml-auto size-5" aria-hidden />
            </Link>
            <Link
              to="/properties?purpose=sales"
              className="card flex items-center gap-4 p-5 transition-all hover:border-brand-300 hover:shadow-lifted"
            >
              <span className="grid size-14 place-items-center rounded-xl bg-brand-100">
                <House className="size-7" aria-hidden />
              </span>
              <span>
                <strong className="block text-lg">Property for sale</strong>
                <small className="text-ink-500">
                  Discover homes, land and commercial properties for sale.
                </small>
              </span>
              <ArrowRight className="ml-auto size-5" aria-hidden />
            </Link>
          </div>
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

      <section className="home-properties-section" aria-labelledby="featured-properties-title">
        <div className="container-page home-section">
          <div className="home-section-heading items-end">
            <div>
              <h2 id="featured-properties-title">Featured Properties</h2>
              <p>Discover highlighted homes and spaces across Mauritius.</p>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <div
                role="tablist"
                aria-label="Featured property type"
                className="flex rounded-full border border-ink-100 bg-surface p-1"
              >
                {(['rental', 'sales'] as const).map((purpose) => (
                  <button
                    key={purpose}
                    type="button"
                    role="tab"
                    aria-selected={featuredPropertyPurpose === purpose}
                    onClick={() => setFeaturedPropertyPurpose(purpose)}
                    className={`min-h-9 rounded-full px-4 text-sm font-bold transition-colors ${featuredPropertyPurpose === purpose ? 'bg-brand-400 text-ink-950' : 'text-ink-600 hover:bg-ink-50'}`}
                  >
                    {purpose === 'rental' ? 'For rent' : 'For sale'}
                  </button>
                ))}
              </div>
              <SectionLink to={`/properties?purpose=${featuredPropertyPurpose}`}>
                View all {featuredPropertyPurpose === 'rental' ? 'rentals' : 'properties for sale'}
              </SectionLink>
            </div>
          </div>
          {featuredPropertiesLoading ? (
            <div className="home-featured-carousel" aria-label="Loading featured properties">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : featuredPropertiesError ? (
            <div className="home-empty">
              <p>We couldn’t load the featured properties.</p>
              <button
                type="button"
                onClick={() => void refetchFeaturedProperties()}
                className="mt-3 min-h-11 font-semibold underline"
              >
                Try again
              </button>
            </div>
          ) : featuredProperties.length ? (
            <div className="home-featured-carousel" aria-label="Featured properties">
              {featuredProperties.slice(0, 5).map((listing) => (
                <FeaturedPropertyCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="home-empty flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold">
                  No featured properties {featuredPropertyPurpose === 'rental' ? 'for rent' : 'for sale'} yet.
                </h3>
                <p className="mt-1 text-sm text-ink-500">Browse all available property listings.</p>
              </div>
              <Link to={`/properties?purpose=${featuredPropertyPurpose}`} className="home-cta">
                Browse properties <ArrowRight className="size-4" aria-hidden />
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
              <p>Find a professional or property in just a few simple steps.</p>
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
            <p className="home-pro-label">For service and property professionals</p>
            <h2
              id="join-title"
              className="mt-5 text-4xl leading-[1.02] font-extrabold tracking-[-0.045em] sm:text-5xl lg:text-6xl"
            >
              Grow your business
              <br />
              with <span className="text-brand-400">MoriHome</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600 sm:text-lg">
              Reach customers looking for trusted services, rentals and properties for sale across Mauritius.
            </p>
            <ul className="mt-8 grid max-w-2xl gap-x-8 gap-y-5 text-sm font-semibold sm:grid-cols-2 sm:text-base">
              {[
                'Create an individual or agency profile',
                'Showcase services or property listings',
                'Receive enquiries directly on WhatsApp',
                'Manage Services, Rental and Sales plans',
              ].map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CircleCheck className="size-6 shrink-0 text-brand-500" aria-hidden />
                  {benefit}
                </li>
              ))}
            </ul>
            <Link to="/register" className="home-cta mt-9">
              Create Your Account <ArrowRight className="size-4" aria-hidden />
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
