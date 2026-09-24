import { categoryLabel, enumLabel } from '@/i18n/labels'
import { t, getFormatLocale } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import {
  ArrowRight,
  Bath,
  BedDouble,
  CircleCheck,
  House,
  KeyRound,
  List,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useHomeMotion } from '@/hooks/useHomeMotion'
import { createElement, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { HomeHeroScene } from '@/components/search/HomeHeroScene'
import { SearchHero } from '@/components/search/SearchHero'
import { WhatsappButton } from '@/components/provider/WhatsappButton'
import { HomeAppBanner } from '@/components/pwa/HomeAppBanner'
import { PropertyImageCarousel } from '@/components/ui/PropertyImageCarousel'
import { FeaturedCarousel } from '@/components/ui/FeaturedCarousel'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCategories, useFeaturedProperties, useFeaturedProviders } from '@/hooks/useSearchQueries'
import { resolveCategoryIcon } from '@/lib/categoryIcons'
import { emptySearchState, writeSearchState, type SearchFormState } from '@/lib/searchParams'
import { initialsOf } from '@/lib/format'
import type { PropertyListing, ProviderSummary } from '@/types/api'
import professionalBanner from '../../images/Grow your business with MoriHome-services-properties.webp'

import rentalPropertyImage from '../../images/luxury-apartment-rental.webp'
import salePropertyImage from '../../images/mauritius-luxury-home-about-hero.webp'

const MotionLink = motion.create(Link)

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
  useLocale()
  const { interactive } = useHomeMotion()
  return (
    <MotionLink
      {...interactive}
      to={to}
      className="home-featured-section-link inline-flex min-h-12 shrink-0 items-center gap-4 rounded-full border border-brand-200 px-6 py-3 text-sm font-semibold shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400"
    >
      {children}
      <ArrowRight className="size-5 shrink-0" aria-hidden />
    </MotionLink>
  )
}

function FeaturedTitle({ title }: { title: string }) {
  const accent = t('Featured')
  const start = title.toLocaleLowerCase().indexOf(accent.toLocaleLowerCase())
  if (start < 0) return title
  return (
    <>
      {title.slice(0, start)}
      <span className="text-brand-400 italic">{title.slice(start, start + accent.length)}</span>
      {title.slice(start + accent.length)}
    </>
  )
}

function FeaturedCard({ provider, index }: { provider: ProviderSummary; index: number }) {
  useLocale()
  const { reveal, interactive } = useHomeMotion()
  const category = provider.service_categories[0]
  const categoryIcon = createElement(resolveCategoryIcon(category?.icon ?? null), {
    className: 'size-9 shrink-0',
    'aria-hidden': true,
  })
  return (
    <motion.article
      {...reveal(index)}
      className="home-provider-card flex min-w-0 flex-col overflow-hidden rounded-xl border border-ink-100 bg-surface shadow-card"
    >
      <MotionLink
        {...interactive}
        to={`/providers/${provider.slug}`}
        aria-label={t("View {name}'s profile", { name: provider.name })}
        className={`home-provider-cover ${provider.cover_url ? '' : 'home-provider-cover-identity'}`}
      >
        {provider.cover_url ? (
          <img
            src={provider.cover_url}
            alt={t('{name} — {service} in {locality}', {
              name: provider.name,
              service: category?.name ? categoryLabel(category.name) : t('home services'),
              locality: provider.locality,
            })}
            loading="lazy"
            decoding="async"
            width={400}
            height={220}
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            {categoryIcon}
            <span className="text-sm font-semibold">
              {category?.name ? categoryLabel(category.name) : enumLabel(provider.provider_type)}
            </span>
          </>
        )}
      </MotionLink>
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <div className="flex items-center gap-2.5">
          {provider.logo_url ? (
            <img
              src={provider.logo_url}
              alt={t('{name} logo', { name: provider.name })}
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
              <MotionLink {...interactive} to={`/providers/${provider.slug}`} className="hover:underline">
                {provider.name}
              </MotionLink>
            </h3>
            <p className="text-xs text-ink-500">
              {category?.name ? categoryLabel(category.name) : enumLabel(provider.provider_type)}
            </p>
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-ink-500">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          {provider.locality}
        </p>
        {provider.is_verified && (
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-300">
            <CircleCheck className="size-3" aria-hidden />
            {t('Verified')}
          </span>
        )}
        {provider.excerpt && (
          <p className="line-clamp-2 text-xs leading-relaxed text-ink-500">{provider.excerpt}</p>
        )}
        <div className="mt-auto grid gap-2 pt-1">
          <MotionLink
            {...interactive}
            to={`/providers/${provider.slug}`}
            className="home-provider-profile-link"
          >
            {t('View profile')} <ArrowRight className="size-4" aria-hidden />
          </MotionLink>
          {provider.whatsapp_number ? (
            <WhatsappButton
              slug={provider.slug}
              number={provider.whatsapp_number}
              serviceName={category?.name}
              source="home"
              variant="primary"
              isFullWidth
              label={t('Contact via WhatsApp')}
            />
          ) : null}
        </div>
      </div>
    </motion.article>
  )
}

function FeaturedPropertyCard({ listing, index }: { listing: PropertyListing; index: number }) {
  useLocale()
  const { reveal, interactive } = useHomeMotion()
  return (
    <motion.article
      {...reveal(index)}
      className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-ink-100 bg-surface shadow-card"
    >
      <PropertyImageCarousel key={listing.id} images={listing.images} title={listing.title} className="h-40">
        <span className="absolute top-3 left-3 rounded-full bg-brand-400 px-2.5 py-1 text-xs font-bold text-ink-950">
          {listing.purpose === 'rental' ? t('For rent') : t('For sale')}
        </span>
      </PropertyImageCarousel>
      <div className="flex flex-1 flex-col gap-3 p-4 text-[#102c3f]">
        <div>
          <h3 className="line-clamp-2 font-bold">{listing.title}</h3>
          <p className="mt-1 text-lg font-extrabold">
            Rs {listing.price_rupees.toLocaleString(getFormatLocale())}
            {listing.purpose === 'rental' ? (
              <small className="text-xs font-medium"> {t('/ month')}</small>
            ) : null}
          </p>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-ink-500">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{listing.locality}</span>
        </p>
        <div className="flex gap-4 text-xs text-ink-500">
          {listing.bedrooms !== null ? (
            <span className="flex items-center gap-1">
              <BedDouble className="size-4" aria-hidden /> {listing.bedrooms} {t('beds')}
            </span>
          ) : null}
          {listing.bathrooms !== null ? (
            <span className="flex items-center gap-1">
              <Bath className="size-4" aria-hidden /> {listing.bathrooms} {t('baths')}
            </span>
          ) : null}
        </div>
        <MotionLink
          {...interactive}
          to={`/properties/${listing.slug}`}
          className="mt-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-brand-400 px-4 text-sm font-bold text-ink-950 hover:bg-brand-300"
        >
          {t('View property')} <ArrowRight className="size-4" aria-hidden />
        </MotionLink>
      </div>
    </motion.article>
  )
}

export function HomePage() {
  useLocale()
  const { reveal, enter, interactive, reducedMotion } = useHomeMotion()
  const navigate = useNavigate()
  const [featuredPropertyPurpose, setFeaturedPropertyPurpose] = useState<'rental' | 'sales'>('rental')
  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useCategories()
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
  const cleaningCategory = categories.find((category) => category.slug === 'cleaning')
  const homeCategories = [
    ...categories
      .filter(
        (category) => category.is_popular && !['roofing-waterproofing', 'cleaning'].includes(category.slug),
      )
      .slice(0, 7),
    ...(cleaningCategory ? [cleaningCategory] : []),
  ]
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
        animateEntrance
        state={emptySearchState()}
        onSearch={runSearch}
        onPropertySearch={runPropertySearch}
        categories={categories}
        title={t('Services and properties,')}
        highlightedTitle={t('all in one local place.')}
        description={t(
          'Find trusted local professionals, homes for rent and properties for sale — anywhere in Mauritius.',
        )}
        aside={
          <motion.p
            {...enter(4)}
            className="home-handwritten hidden px-5 pt-4 text-[2.75rem] lg:block"
            aria-label={t('Made for Mauritius')}
          >
            {t('Made for')}
            <br />
            {t('Mauritius')}
            <span aria-hidden />
          </motion.p>
        }
      />

      <section className="home-soft-bg" aria-label={t('The MoriHome promise')}>
        <div className="container-page grid grid-cols-2 gap-x-4 gap-y-6 py-7 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, title, body }, index) => (
            <motion.div
              {...reveal(index)}
              key={title}
              className="home-trust-item flex items-center gap-3 lg:justify-center"
            >
              <Icon className="home-illustrated-icon size-9 shrink-0 sm:size-11" aria-hidden />
              <div>
                <h2 className="text-xs font-bold sm:text-sm">{t(title)}</h2>
                <p className="mt-1 text-[11px] text-ink-600 sm:text-xs">{t(body)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="home-soft-bg" aria-labelledby="property-title">
        <div className="container-page py-10 sm:py-14">
          <motion.div
            {...reveal()}
            className="mb-7 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center"
          >
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex items-center gap-2.5 rounded-full bg-brand-100 px-5 py-2 text-xs font-semibold tracking-[0.16em] text-ink-950 uppercase">
                <House className="size-4" aria-hidden />
                {t('Homes & properties')}
              </p>
              <h2
                id="property-title"
                className="text-4xl leading-[1.08] font-extrabold tracking-[-0.045em] sm:text-5xl"
              >
                {t('Find your next')} <span className="text-brand-400 italic">{t('property')}</span>
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-600 sm:text-lg">
                {t('Browse houses, apartments and commercial spaces for rent or sale across Mauritius.')}
              </p>
            </div>
            <MotionLink
              {...interactive}
              to="/properties"
              className="inline-flex min-h-12 shrink-0 items-center gap-4 rounded-full border border-brand-200 bg-surface px-6 py-3 text-sm font-semibold shadow-sm transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400"
            >
              {t('View all properties')} <ArrowRight className="size-5" aria-hidden />
            </MotionLink>
          </motion.div>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                purpose: 'rental',
                title: 'Property for rent',
                description: 'Find houses, apartments and commercial spaces to rent.',
                image: rentalPropertyImage,
                icon: KeyRound,
              },
              {
                purpose: 'sales',
                title: 'Property for sale',
                description: 'Discover homes, land and commercial properties for sale.',
                image: salePropertyImage,
                icon: House,
              },
            ].map(({ purpose, title, description, image, icon: Icon }, index) => (
              <motion.div key={purpose} {...reveal(index)}>
                <MotionLink
                  {...interactive}
                  to={`/properties?purpose=${purpose}`}
                  className="group relative isolate flex min-h-64 items-end overflow-hidden rounded-2xl border border-white/70 bg-ink-950 p-5 shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400 sm:min-h-72 sm:p-6"
                >
                  <img
                    src={image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                  />
                  <span
                    className="absolute inset-0 -z-10 bg-linear-to-t from-black/95 via-black/45 to-black/5"
                    aria-hidden
                  />
                  <span className="flex w-full items-end gap-3 sm:gap-4">
                    <span className="mb-1 grid size-12 shrink-0 place-items-center rounded-xl border border-brand-100/50 bg-black/50 text-brand-300 sm:size-16">
                      <Icon className="size-7 sm:size-9" strokeWidth={1.7} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block text-xl leading-tight font-bold text-white sm:text-2xl">
                        {t(title)}
                      </strong>
                      <span className="mt-2 block text-sm leading-relaxed text-white/85">
                        {t(description)}
                      </span>
                    </span>
                    <span className="mb-1 grid size-11 shrink-0 place-items-center rounded-full bg-brand-400 text-ink-950 shadow-sm sm:size-12">
                      <ArrowRight
                        className="size-6 transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transform-none"
                        aria-hidden
                      />
                    </span>
                  </span>
                </MotionLink>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-services-section" aria-labelledby="services-title">
        <div className="container-page py-10 sm:py-14">
          <motion.div
            {...reveal()}
            className="mb-7 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center"
          >
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex items-center gap-2.5 rounded-full bg-brand-100 px-5 py-2 text-xs font-semibold tracking-[0.16em] text-ink-950 uppercase">
                <Wrench className="size-4" aria-hidden />
                {t('Home services in Mauritius')}
              </p>
              <h2
                id="services-title"
                className="text-4xl leading-[1.08] font-extrabold tracking-[-0.045em] sm:text-5xl"
              >
                {t('What do you')} <span className="text-brand-400 italic">{t('need help with?')}</span>
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-600 sm:text-lg">
                {t('Find the right professional for your project.')}
              </p>
            </div>
            <MotionLink
              {...interactive}
              to="/search"
              className="inline-flex min-h-12 shrink-0 items-center gap-4 rounded-full border border-brand-200 bg-surface px-6 py-3 text-sm font-semibold shadow-sm transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400"
            >
              {t('View all services')} <ArrowRight className="size-5" aria-hidden />
            </MotionLink>
          </motion.div>
          {categoriesLoading ? (
            <div className="home-category-grid" aria-label={t('Loading services')}>
              {Array.from({ length: 9 }, (_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : categoriesError || !categories.length ? (
            <p className="home-empty">
              {t('Services are unavailable right now.')}{' '}
              <MotionLink {...interactive} to="/search" className="underline">
                {t('Search all professionals')}
              </MotionLink>
            </p>
          ) : (
            <ul className="home-category-grid">
              {homeCategories.map((category, index) => {
                const Icon = resolveCategoryIcon(category.icon)
                return (
                  <motion.li {...reveal(index)} key={category.id}>
                    <MotionLink {...interactive} to={categoryLink(category.id)} className="home-category">
                      <Icon className="home-illustrated-icon size-10" aria-hidden />
                      <span>{categoryLabel(category.name)}</span>
                    </MotionLink>
                  </motion.li>
                )
              })}
              <motion.li {...reveal(5)}>
                <MotionLink {...interactive} to="/search" className="home-category">
                  <MoreHorizontal className="size-10" aria-hidden />
                  <span>{t('More')}</span>
                </MotionLink>
              </motion.li>
            </ul>
          )}
        </div>
      </section>

      <section className="home-model-section" aria-labelledby="featured-title">
        <div className="container-page home-section">
          <motion.div
            {...reveal()}
            className="mb-7 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center"
          >
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex items-center gap-2.5 rounded-full bg-brand-100 px-5 py-2 text-xs font-semibold tracking-[0.16em] text-ink-950 uppercase">
                <Wrench className="size-4" aria-hidden />
                {t('Home services in Mauritius')}
              </p>
              <h2
                id="featured-title"
                className="text-4xl leading-[1.08] font-extrabold tracking-[-0.045em] sm:text-5xl"
              >
                <FeaturedTitle title={t('Featured Professionals')} />
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#d8e3eb] sm:text-lg">
                {t('Your next home project starts with a local professional. Explore who can help.')}
              </p>
            </div>
            <SectionLink to="/search">{t('View all professionals')}</SectionLink>
          </motion.div>
          {providersLoading ? (
            <div className="home-featured-carousel" aria-label={t('Loading featured professionals')}>
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : providersError ? (
            <div className="home-empty">
              <p>{t('We couldn’t load the featured professionals.')}</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-3 min-h-11 font-semibold underline"
              >
                {t('Try again')}
              </button>
            </div>
          ) : providers.length ? (
            <FeaturedCarousel label={t('Featured professionals')}>
              {providers.map((provider, index) => (
                <FeaturedCard key={provider.id} provider={provider} index={index} />
              ))}
            </FeaturedCarousel>
          ) : (
            <div className="home-empty flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold">{t('Your next home project starts here.')}</h3>
                <p className="mt-1 text-sm text-ink-500">
                  {t('Browse the directory to find professionals in your area.')}
                </p>
              </div>
              <MotionLink {...interactive} to="/search" className="home-cta">
                {t('Find a professional')} <ArrowRight className="size-4" aria-hidden />
              </MotionLink>
            </div>
          )}
        </div>
      </section>

      <section className="home-properties-section" aria-labelledby="featured-properties-title">
        <div className="container-page home-section">
          <motion.div
            {...reveal()}
            className="mb-7 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center"
          >
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex items-center gap-2.5 rounded-full bg-brand-100 px-5 py-2 text-xs font-semibold tracking-[0.16em] text-ink-950 uppercase">
                <House className="size-4" aria-hidden />
                {t('Homes & properties')}
              </p>
              <h2
                id="featured-properties-title"
                className="text-4xl leading-[1.08] font-extrabold tracking-[-0.045em] sm:text-5xl"
              >
                <FeaturedTitle title={t('Featured Properties')} />
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-600 sm:text-lg">
                {t('Discover highlighted homes and spaces across Mauritius.')}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
              <div
                role="tablist"
                aria-label={t('Featured property type')}
                className="flex rounded-full border border-ink-100 bg-surface p-1"
              >
                {(['rental', 'sales'] as const).map((purpose) => (
                  <button
                    key={purpose}
                    type="button"
                    role="tab"
                    aria-selected={featuredPropertyPurpose === purpose}
                    onClick={() => setFeaturedPropertyPurpose(purpose)}
                    className={`relative isolate min-h-9 rounded-full px-4 text-sm font-bold transition-colors ${featuredPropertyPurpose === purpose ? 'text-ink-950' : 'text-ink-600 hover:bg-ink-50'}`}
                  >
                    {featuredPropertyPurpose === purpose && (
                      <motion.span
                        layoutId={reducedMotion ? undefined : 'home-property-tab'}
                        className="absolute inset-0 -z-10 rounded-full bg-brand-400"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        aria-hidden
                      />
                    )}
                    {purpose === 'rental' ? t('For rent') : t('For sale')}
                  </button>
                ))}
              </div>
              <SectionLink to={`/properties?purpose=${featuredPropertyPurpose}`}>
                {t(
                  featuredPropertyPurpose === 'rental' ? 'View all rentals' : 'View all properties for sale',
                )}
              </SectionLink>
            </div>
          </motion.div>
          {featuredPropertiesLoading ? (
            <div className="home-featured-carousel" aria-label={t('Loading featured properties')}>
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : featuredPropertiesError ? (
            <div className="home-empty">
              <p>{t('We couldn’t load the featured properties.')}</p>
              <button
                type="button"
                onClick={() => void refetchFeaturedProperties()}
                className="mt-3 min-h-11 font-semibold underline"
              >
                {t('Try again')}
              </button>
            </div>
          ) : featuredProperties.length ? (
            <FeaturedCarousel key={featuredPropertyPurpose} label={t('Featured properties')}>
              {featuredProperties.map((listing, index) => (
                <FeaturedPropertyCard key={listing.id} listing={listing} index={index} />
              ))}
            </FeaturedCarousel>
          ) : (
            <div className="home-empty flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold">
                  {t(
                    featuredPropertyPurpose === 'rental'
                      ? 'No featured properties for rent yet.'
                      : 'No featured properties for sale yet.',
                  )}
                </h3>
                <p className="mt-1 text-sm text-ink-500">{t('Browse all available property listings.')}</p>
              </div>
              <MotionLink
                {...interactive}
                to={`/properties?purpose=${featuredPropertyPurpose}`}
                className="home-cta"
              >
                {t('Browse properties')} <ArrowRight className="size-4" aria-hidden />
              </MotionLink>
            </div>
          )}
        </div>
      </section>

      <section className="home-soft-bg" aria-labelledby="how-title">
        <div className="container-page home-section relative">
          <motion.div {...reveal()} className="home-section-heading">
            <div>
              <h2 id="how-title">{t('How MoriHome works')}</h2>
              <p>{t('Find a professional or property in just a few simple steps.')}</p>
            </div>
            <p className="home-handwritten hidden sm:block">
              {t('Simple.')}
              <br />
              {t('Fast. Local.')}
              <span />
            </p>
          </motion.div>
          <ol className="grid gap-7 pt-3 md:grid-cols-3 md:gap-12">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <motion.li {...reveal(i)} key={title} className="relative flex gap-5">
                <span className="home-step-number">{i + 1}</span>
                <div>
                  <Icon className="home-illustrated-icon mb-3 size-10" aria-hidden />
                  <h3 className="text-lg font-bold">{t(title)}</h3>
                  <p className="mt-1 max-w-52 text-sm leading-relaxed text-ink-600">{t(body)}</p>
                </div>
                {i < 2 && (
                  <ArrowRight className="absolute top-9 -right-6 hidden size-5 md:block" aria-hidden />
                )}
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="home-model-section home-why-section" aria-labelledby="why-title">
        <div className="container-page home-section grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div>
            <h2 id="why-title" className="text-2xl font-extrabold">
              {t('Why choose MoriHome?')}
            </h2>
            <div className="mt-5 grid gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
              {BENEFITS.map(({ icon: Icon, title, body }, index) => (
                <motion.div
                  {...reveal(index)}
                  key={title}
                  className="home-why-benefit border-l border-white/20 pl-4"
                >
                  <Icon className="home-illustrated-icon mb-3 size-8" aria-hidden />
                  <h3 className="text-sm font-bold">{t(title)}</h3>
                  <p className="mt-1 text-xs leading-relaxed">{t(body)}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.aside {...reveal(2)} className="home-why-trust-card rounded-xl p-5">
            <ShieldCheck className="home-illustrated-icon mb-3 size-8" aria-hidden />
            <h3 className="font-bold">{t('Professionals you can trust.')}</h3>
            <p className="mt-2 text-sm leading-relaxed">
              {t(
                'Every professional profile is reviewed before publication. The Verified badge identifies profiles approved by our team.',
              )}
            </p>
          </motion.aside>
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
          <motion.div {...reveal()} className="home-pro-content">
            <p className="home-pro-label">{t('For service and property professionals')}</p>
            <h2
              id="join-title"
              className="mt-5 text-4xl leading-[1.02] font-extrabold tracking-[-0.045em] sm:text-5xl lg:text-6xl"
            >
              {t('Grow your business')}
              <br />
              {t('with')} <span className="text-brand-400">MoriHome</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600 sm:text-lg">
              {t(
                'Reach customers looking for trusted services, rentals and properties for sale across Mauritius.',
              )}
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
                  {t(benefit)}
                </li>
              ))}
            </ul>
            <MotionLink {...interactive} to="/register" className="home-cta mt-9">
              {t('Create Your Account')} <ArrowRight className="size-4" aria-hidden />
            </MotionLink>
          </motion.div>
        </div>
      </section>

      <HomeAppBanner />
    </div>
  )
}
