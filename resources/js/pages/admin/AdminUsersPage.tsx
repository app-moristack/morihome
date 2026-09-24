import { t, getFormatLocale } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { useQuery } from '@tanstack/react-query'
import { Search, Users } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { adminApi } from '@/api/endpoints'
import { AdminUsersTable } from '@/components/admin/AdminUsersTable'
import { Skeleton } from '@/components/ui/Skeleton'

export default function AdminUsersPage() {
  useLocale()
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
              ? t('Pending Verification')
              : type === 'individual'
                ? t('Individuals')
                : type === 'agency'
                  ? t('Businesses')
                  : t('All Users')}
          </h1>
          <p>{t('Find accounts and manage their provider profiles.')}</p>
        </div>
      </div>
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>
            <Users size={19} />
            {t('User directory')}
          </h2>
          <span className="admin-muted">
            {data ? t('{count} users', { count: data.meta.total.toLocaleString(getFormatLocale()) }) : ''}
          </span>
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
              aria-label={t('Search users')}
              name="term"
              defaultValue={term}
              maxLength={100}
              placeholder={t('Name, email, locality or service')}
            />
            <button type="submit">{t('Search')}</button>
          </form>
          <select
            aria-label={t('Filter account type')}
            value={type}
            onChange={(event) => update('type', event.target.value)}
          >
            <option value="">{t('All types')}</option>
            <option value="individual">{t('Individuals')}</option>
            <option value="agency">{t('Businesses')}</option>
          </select>
          <select
            aria-label={t('Filter user status')}
            value={status}
            onChange={(event) => update('status', event.target.value)}
          >
            <option value="">{t('All statuses')}</option>
            <option value="active">{t('Active')}</option>
            <option value="pending">{t('Pending verification')}</option>
            <option value="suspended">{t('Suspended')}</option>
            <option value="inactive">{t('Inactive')}</option>
          </select>
        </div>
        {isLoading ? (
          <Skeleton className="m-5 h-48" />
        ) : isError ? (
          <div className="admin-empty" role="alert">
            {t('Could not load users.')} <button onClick={() => void refetch()}>{t('Try again')}</button>
          </div>
        ) : (
          <AdminUsersTable users={data?.data ?? []} />
        )}
        {data ? (
          <div className="admin-pagination">
            <span>
              {data.meta.total === 0
                ? t('No results')
                : t('{from}–{to} of {total}', {
                    from: data.meta.from ?? 0,
                    to: data.meta.to ?? 0,
                    total: data.meta.total,
                  })}
            </span>
            <div>
              <button disabled={page <= 1} onClick={() => update('page', String(page - 1))}>
                {t('Previous')}
              </button>
              <span>
                {t('Page')} {data.meta.current_page} {t('of')} {data.meta.last_page}
              </span>
              <button disabled={page >= data.meta.last_page} onClick={() => update('page', String(page + 1))}>
                {t('Next')}
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </>
  )
}
