import { useQuery } from '@tanstack/react-query'
import { Search, Users } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { adminApi } from '@/api/endpoints'
import { AdminUsersTable } from '@/components/admin/AdminUsersTable'
import { Skeleton } from '@/components/ui/Skeleton'

export default function AdminUsersPage() {
  const [params, setParams] = useSearchParams()
  const type = ['individual', 'agency'].includes(params.get('type') ?? '') ? params.get('type')! : ''
  const status = ['active', 'pending', 'suspended', 'inactive'].includes(params.get('status') ?? '')
    ? params.get('status')!
    : ''
  const page = Math.max(1, Number(params.get('page')) || 1)
  const term = params.get('term') ?? ''
  const filters = { type, status, page, term }
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => adminApi.users(filters),
  })
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }

  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>
            {status === 'pending'
              ? 'Pending Verification'
              : type === 'individual'
                ? 'Individuals'
                : type === 'agency'
                  ? 'Businesses'
                  : 'All Users'}
          </h1>
          <p>Find accounts and manage their provider profiles.</p>
        </div>
      </div>
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>
            <Users size={19} />
            User directory
          </h2>
          <span className="admin-muted">{data ? `${data.meta.total.toLocaleString()} users` : ''}</span>
        </div>
        <div className="admin-filters">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              update('term', String(new FormData(event.currentTarget).get('term') ?? '').slice(0, 100))
            }}
            key={term}
          >
            <Search size={16} />
            <input
              aria-label="Search users"
              name="term"
              defaultValue={term}
              maxLength={100}
              placeholder="Name, email, locality or service"
            />
            <button type="submit">Search</button>
          </form>
          <select
            aria-label="Filter account type"
            value={type}
            onChange={(event) => update('type', event.target.value)}
          >
            <option value="">All types</option>
            <option value="individual">Individuals</option>
            <option value="agency">Businesses</option>
          </select>
          <select
            aria-label="Filter user status"
            value={status}
            onChange={(event) => update('status', event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending verification</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {isLoading ? (
          <Skeleton className="m-5 h-48" />
        ) : isError ? (
          <div className="admin-empty" role="alert">
            Could not load users. <button onClick={() => void refetch()}>Try again</button>
          </div>
        ) : (
          <AdminUsersTable users={data?.data ?? []} />
        )}
        {data ? (
          <div className="admin-pagination">
            <span>
              {data.meta.total === 0
                ? 'No results'
                : `${data.meta.from}–${data.meta.to} of ${data.meta.total}`}
            </span>
            <div>
              <button disabled={page <= 1} onClick={() => update('page', String(page - 1))}>
                Previous
              </button>
              <span>
                Page {data.meta.current_page} of {data.meta.last_page}
              </span>
              <button disabled={page >= data.meta.last_page} onClick={() => update('page', String(page + 1))}>
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </>
  )
}
