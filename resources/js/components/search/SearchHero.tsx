import { categoryLabel } from '@/i18n/labels'
import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { motion } from 'motion/react'
import { useHomeMotion } from '@/hooks/useHomeMotion'
import { BadgeCheck, Building2, Search, Users, Wrench, Zap } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { AddressAutocomplete } from './AddressAutocomplete'
import { SearchModule } from './SearchModule'
import { Button } from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Field'
import type { SearchFormState } from '@/lib/searchParams'
import type { ServiceCategory } from '@/types/api'
import hero from '../../../images/le-morne-mauritius-home-services.webp'
import heroVideo from '../../../videos/homepage video.mp4'

export type PropertyHeroSearch = {
  purpose: 'rental' | 'sales'
  propertyType: '' | 'house' | 'apartment' | 'villa' | 'land' | 'commercial' | 'other'
  location: string
  maxPrice: number | null
}

type SearchHeroProps = {
  showSearchModeTabs?: boolean
  initialSearchMode?: 'services' | 'property'
  initialPropertySearch?: PropertyHeroSearch
  animateEntrance?: boolean
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
  backgroundShade?: ReactNode
  onPropertySearch?: (search: PropertyHeroSearch) => void
}

const TRUST_POINTS = [
  { icon: Users, label: 'Local people' },
  { icon: BadgeCheck, label: 'Verified listings' },
  { icon: Zap, label: 'Faster support' },
]

export function SearchHero({
  showSearchModeTabs = true,
  initialSearchMode = 'services',
  initialPropertySearch,
  animateEntrance = false,
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
  backgroundShade,
  onPropertySearch,
}: SearchHeroProps) {
  useLocale()
  const { enter } = useHomeMotion(animateEntrance)
  const [searchMode, setSearchMode] = useState<'services' | 'property'>(initialSearchMode)
  const [propertyPurpose, setPropertyPurpose] = useState<'rental' | 'sales'>(
    initialPropertySearch?.purpose ?? 'rental',
  )
  const [propertyType, setPropertyType] = useState(initialPropertySearch?.propertyType ?? '')
  const [propertyLocation, setPropertyLocation] = useState(initialPropertySearch?.location ?? '')
  const [propertyMaxPrice, setPropertyMaxPrice] = useState(initialPropertySearch?.maxPrice?.toString() ?? '')

  const submitPropertySearch = (event: FormEvent) => {
    event.preventDefault()
    onPropertySearch?.({
      purpose: propertyPurpose,
      propertyType: propertyType as '' | 'house' | 'apartment' | 'villa' | 'land' | 'commercial' | 'other',
      location: propertyLocation.trim(),
      maxPrice: propertyMaxPrice ? Number(propertyMaxPrice) : null,
    })
  }

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
      {backgroundShade ?? <div className="search-page-hero-shade absolute inset-0 -z-10" />}
      <div className="container-page relative py-8 sm:py-10">
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <motion.h1
              {...enter()}
              aria-label={`${t(title)} ${t(highlightedTitle)}`}
              className="max-w-3xl text-[clamp(2.45rem,5vw,4.25rem)] leading-[1.03] font-extrabold tracking-[-0.04em]"
            >
              {t(title)}
              {highlightedTitle && (
                <>
                  <br />
                  <span className="home-yellow-text">{t(highlightedTitle)}</span>
                </>
              )}
            </motion.h1>
            <motion.p
              {...enter(2)}
              className="mt-4 max-w-lg text-base leading-relaxed text-white/90 sm:text-lg"
            >
              {(typeof description === 'string' ? t(description) : description) ?? (
                <>
                  {t('Trusted services and property listings for your home.')}
                  <br />
                  {t('Build · Renovate · Rent · Buy')}
                </>
              )}
            </motion.p>
          </div>

          {aside ?? (
            <div className="search-hero-trust hidden rounded-xl bg-[#061827]/80 p-5 backdrop-blur-sm lg:flex lg:flex-col lg:gap-4">
              {TRUST_POINTS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 text-xs font-semibold tracking-wide uppercase"
                >
                  <Icon className="size-5 text-brand-300" aria-hidden />
                  {t(label)}
                </div>
              ))}
            </div>
          )}
        </div>

        <motion.div {...enter(3)} className="search-page-search mt-6 flex flex-col gap-0">
          {onPropertySearch && showSearchModeTabs ? (
            <div
              className="flex w-fit rounded-t-xl bg-[#071a29]/90 p-1"
              role="tablist"
              aria-label={t('Search category')}
            >
              <button
                type="button"
                role="tab"
                aria-selected={searchMode === 'services'}
                onClick={() => setSearchMode('services')}
                className={`flex min-h-11 items-center gap-2 rounded-lg px-5 text-sm font-bold ${searchMode === 'services' ? 'bg-brand-400 text-ink-950' : 'text-white'}`}
              >
                <Wrench className="size-4" aria-hidden /> {t('Services')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={searchMode === 'property'}
                onClick={() => setSearchMode('property')}
                className={`flex min-h-11 items-center gap-2 rounded-lg px-5 text-sm font-bold ${searchMode === 'property' ? 'bg-brand-400 text-ink-950' : 'text-white'}`}
              >
                <Building2 className="size-4" aria-hidden /> {t('Properties')}
              </button>
            </div>
          ) : null}
          {searchMode === 'services' ? (
            <SearchModule
              key={stateKey}
              initialState={state}
              onSearch={onSearch}
              variant="hero"
              isBusy={isBusy}
            />
          ) : (
            <form
              onSubmit={submitPropertySearch}
              className={`card grid gap-4 p-4 shadow-lifted sm:grid-cols-2 sm:p-5 lg:grid-cols-[0.75fr_0.85fr_1.3fr_0.9fr_auto] ${showSearchModeTabs ? 'rounded-tl-none' : ''}`}
              role="search"
              aria-label={t('Find property in Mauritius')}
            >
              <SelectField
                label={t('I am looking for')}
                value={propertyPurpose}
                onChange={(event) => {
                  setPropertyPurpose(event.target.value as 'rental' | 'sales')
                  setPropertyMaxPrice('')
                }}
              >
                <option value="rental">{t('For rent')}</option>
                <option value="sales">{t('For sale')}</option>
              </SelectField>
              <SelectField
                label={t('Property type')}
                value={propertyType}
                onChange={(event) =>
                  setPropertyType(event.target.value as PropertyHeroSearch['propertyType'])
                }
              >
                <option value="">{t('All types')}</option>
                <option value="house">{t('House')}</option>
                <option value="apartment">{t('Apartment')}</option>
                <option value="villa">{t('Villa')}</option>
                <option value="land">{t('Land')}</option>
                <option value="commercial">{t('Commercial')}</option>
                <option value="other">{t('Other')}</option>
              </SelectField>
              <AddressAutocomplete
                label={t('Where in Mauritius?')}
                value={propertyLocation}
                onChange={setPropertyLocation}
                onResolve={(location) => {
                  if (location) setPropertyLocation(location.label)
                }}
              />
              <SelectField
                label={t('Maximum budget')}
                value={propertyMaxPrice}
                onChange={(event) => setPropertyMaxPrice(event.target.value)}
              >
                <option value="">{t('Any budget')}</option>
                {propertyPurpose === 'rental' ? (
                  <>
                    <option value="15000">{t('Up to Rs 15,000')}</option>
                    <option value="30000">{t('Up to Rs 30,000')}</option>
                    <option value="50000">{t('Up to Rs 50,000')}</option>
                    <option value="100000">{t('Up to Rs 100,000')}</option>
                  </>
                ) : (
                  <>
                    <option value="2000000">{t('Up to Rs 2,000,000')}</option>
                    <option value="5000000">{t('Up to Rs 5,000,000')}</option>
                    <option value="10000000">{t('Up to Rs 10,000,000')}</option>
                    <option value="25000000">{t('Up to Rs 25,000,000')}</option>
                  </>
                )}
              </SelectField>
              <div className="flex items-end">
                <Button
                  type="submit"
                  size="lg"
                  isFullWidth
                  isLoading={isBusy}
                  leadingIcon={<Search className="size-5" />}
                  className="lg:min-w-40"
                >
                  {t('Search properties')}
                </Button>
              </div>
            </form>
          )}
        </motion.div>

        {searchMode === 'services' && categories.length > 0 ? (
          <div className="mt-3 flex [scrollbar-width:none] flex-wrap items-center gap-2 overflow-visible pb-1 text-xs sm:flex-nowrap sm:overflow-x-auto">
            <span className="shrink-0 basis-full font-semibold sm:basis-auto">{t('Popular searches:')}</span>
            {categories.slice(0, 8).map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onSearch({ ...state, categoryId: category.id, page: 1 })}
                className="search-popular-chip"
              >
                {categoryLabel(category.name)}
              </button>
            ))}
          </div>
        ) : searchMode === 'property' ? (
          <div className="mt-3 flex [scrollbar-width:none] flex-wrap items-center gap-2 overflow-visible pb-1 text-xs sm:flex-nowrap sm:overflow-x-auto">
            <span className="shrink-0 basis-full font-semibold sm:basis-auto">{t('Popular:')}</span>
            {[
              { label: 'House for rent', purpose: 'rental' as const, propertyType: 'house' as const },
              { label: 'Apartment', purpose: propertyPurpose, propertyType: 'apartment' as const },
              { label: 'Land', purpose: 'sales' as const, propertyType: 'land' as const },
              { label: 'Villa', purpose: propertyPurpose, propertyType: 'villa' as const },
              { label: 'Commercial', purpose: propertyPurpose, propertyType: 'commercial' as const },
              { label: 'House for sale', purpose: 'sales' as const, propertyType: 'house' as const },
            ].map((popular) => (
              <button
                key={popular.label}
                type="button"
                onClick={() =>
                  onPropertySearch?.({
                    purpose: popular.purpose,
                    propertyType: popular.propertyType,
                    location: propertyLocation.trim(),
                    maxPrice:
                      popular.purpose === propertyPurpose && propertyMaxPrice
                        ? Number(propertyMaxPrice)
                        : null,
                  })
                }
                className="search-popular-chip"
              >
                {t(popular.label)}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
