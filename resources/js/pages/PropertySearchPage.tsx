import { Bath, BedDouble, Building2, MapPin, MessageCircle, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { publicApi } from '@/api/endpoints'
import { queryKeys } from '@/api/queryKeys'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SelectField, TextField } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'

export default function PropertySearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialPurpose = searchParams.get('purpose') === 'sales' ? 'sales' : 'rental'
  const initialPropertyType = searchParams.get('property_type') ?? ''
  const [purpose, setPurpose] = useState<'rental' | 'sales'>(initialPurpose)
  const [propertyType, setPropertyType] = useState(initialPropertyType)
  const [location, setLocation] = useState(searchParams.get('location') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') ?? '')
  const params = useMemo(
    () => ({
      purpose: (searchParams.get('purpose') === 'sales' ? 'sales' : 'rental') as 'rental' | 'sales',
      property_type: (searchParams.get('property_type') || undefined) as
        'house' | 'apartment' | 'villa' | 'land' | 'commercial' | 'other' | undefined,
      location: searchParams.get('location') || undefined,
      max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
      page: Number(searchParams.get('page') ?? 1),
    }),
    [searchParams],
  )
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.propertySearch(params),
    queryFn: () => publicApi.searchProperties(params),
  })

  const search = (event: React.FormEvent) => {
    event.preventDefault()
    const next: Record<string, string> = { purpose }
    if (propertyType) next.property_type = propertyType
    if (location.trim()) next.location = location.trim()
    if (maxPrice) next.max_price = maxPrice
    setSearchParams(next)
  }

  return (
    <div className="min-h-screen bg-canvas">
      <section className="bg-[#102b3d] text-white">
        <div className="container-page py-10 sm:py-14">
          <p className="text-sm font-bold text-brand-300 uppercase">Property in Mauritius</p>
          <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">Find a place to rent or buy.</h1>
          <p className="mt-3 max-w-2xl text-white/80">
            Explore local homes, apartments, land and commercial property listed on MoriHome.
          </p>
          <form
            onSubmit={search}
            className="card mt-7 grid gap-4 p-4 text-ink-900 sm:grid-cols-2 lg:grid-cols-[0.75fr_0.85fr_1.3fr_0.9fr_auto]"
          >
            <SelectField
              label="I am looking for"
              value={purpose}
              onChange={(event) => {
                setPurpose(event.target.value as 'rental' | 'sales')
                setMaxPrice('')
              }}
            >
              <option value="rental">For rent</option>
              <option value="sales">For sale</option>
            </SelectField>
            <SelectField
              label="Property type"
              value={propertyType}
              onChange={(event) => setPropertyType(event.target.value)}
            >
              <option value="">All types</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
              <option value="other">Other</option>
            </SelectField>
            <TextField
              label="Location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Town, village or address"
            />
            <SelectField
              label="Maximum budget"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            >
              <option value="">Any budget</option>
              {purpose === 'rental' ? (
                <>
                  <option value="15000">Up to Rs 15,000</option>
                  <option value="30000">Up to Rs 30,000</option>
                  <option value="50000">Up to Rs 50,000</option>
                  <option value="100000">Up to Rs 100,000</option>
                </>
              ) : (
                <>
                  <option value="2000000">Up to Rs 2,000,000</option>
                  <option value="5000000">Up to Rs 5,000,000</option>
                  <option value="10000000">Up to Rs 10,000,000</option>
                  <option value="25000000">Up to Rs 25,000,000</option>
                </>
              )}
            </SelectField>
            <div className="flex items-end">
              <Button type="submit" size="lg" leadingIcon={<Search className="size-5" />}>
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      <main className="container-page py-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold">
              {params.purpose === 'rental' ? 'Properties for rent' : 'Properties for sale'}
            </h2>
            <p className="text-sm text-ink-500">{data?.meta.total ?? 0} listings found</p>
          </div>
          <Link to="/register" className="text-sm font-bold underline">
            List your property
          </Link>
        </div>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-80 rounded-card" />
            <Skeleton className="h-80 rounded-card" />
            <Skeleton className="h-80 rounded-card" />
          </div>
        ) : isError ? (
          <EmptyState
            icon={<Building2 className="size-6" />}
            tone="danger"
            title="Could not load properties"
          />
        ) : data?.data.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((listing) => {
              const whatsapp = listing.provider?.whatsapp_phone ?? listing.provider?.phone
              return (
                <li key={listing.id} className="card overflow-hidden">
                  {listing.images[0] ? (
                    <img
                      src={listing.images[0].url}
                      alt={listing.title}
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-52 place-items-center bg-ink-100">
                      <Building2 className="size-12 text-ink-300" />
                    </div>
                  )}
                  <div className="flex flex-col gap-3 p-5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge tone="brand">{listing.purpose === 'rental' ? 'For rent' : 'For sale'}</Badge>
                      <span className="text-xs text-ink-500">{listing.property_type}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{listing.title}</h3>
                      <p className="mt-1 text-xl font-extrabold">
                        Rs {listing.price_rupees.toLocaleString('en-MU')}
                        {listing.purpose === 'rental' ? (
                          <small className="text-xs font-medium text-ink-500"> / month</small>
                        ) : null}
                      </p>
                    </div>
                    <p className="flex items-center gap-1 text-sm text-ink-500">
                      <MapPin className="size-4" />
                      {listing.locality}
                    </p>
                    <div className="flex gap-4 text-sm text-ink-600">
                      {listing.bedrooms !== null ? (
                        <span className="flex items-center gap-1">
                          <BedDouble className="size-4" />
                          {listing.bedrooms}
                        </span>
                      ) : null}
                      {listing.bathrooms !== null ? (
                        <span className="flex items-center gap-1">
                          <Bath className="size-4" />
                          {listing.bathrooms}
                        </span>
                      ) : null}
                    </div>
                    {whatsapp ? (
                      <a
                        href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button isFullWidth leadingIcon={<MessageCircle className="size-4" />}>
                          Contact on WhatsApp
                        </Button>
                      </a>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <EmptyState
            icon={<Building2 className="size-6" />}
            title="No properties found"
            description="Try another location or check back as new listings are added."
          />
        )}
        {data && data.meta.last_page > 1 ? (
          <nav className="mt-7 flex justify-center gap-3">
            <Button
              variant="secondary"
              disabled={params.page <= 1}
              onClick={() =>
                setSearchParams({ ...Object.fromEntries(searchParams), page: String(params.page - 1) })
              }
            >
              Previous
            </Button>
            <span className="self-center text-sm">
              Page {params.page} of {data.meta.last_page}
            </span>
            <Button
              variant="secondary"
              disabled={params.page >= data.meta.last_page}
              onClick={() =>
                setSearchParams({ ...Object.fromEntries(searchParams), page: String(params.page + 1) })
              }
            >
              Next
            </Button>
          </nav>
        ) : null}
      </main>
    </div>
  )
}
