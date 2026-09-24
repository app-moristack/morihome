import { categoryLabel } from '@/i18n/labels'
import { t, getFormatLocale } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  Eye,
  Grid2X2,
  Plus,
  Users,
  UserRound,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { adminApi } from '@/api/endpoints'
import { queryKeys } from '@/api/queryKeys'
import { AdminUsersTable } from '@/components/admin/AdminUsersTable'
import { USER_STATUS_LABELS } from '@/lib/admin'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/hooks/useAuth'
import { resolveCategoryIcon } from '@/lib/categoryIcons'
import type { AdminDashboard, AdminMetric, AdminUserStatus } from '@/types/api'

const number = (value: number) => value.toLocaleString(getFormatLocale())
const shortDate = (value: string) =>
  new Date(value + 'T12:00:00').toLocaleDateString(getFormatLocale(), { day: 'numeric', month: 'short' })
const STATUS_COLORS: Record<AdminUserStatus, string> = {
  active: '#34bf72',
  pending: '#ffc72c',
  suspended: '#ff456b',
  inactive: '#afbacd',
}

function MetricChange({ metric }: { metric: AdminMetric }) {
  useLocale()
  if (metric.change_percent === null)
    return <span className="admin-metric-new">{metric.current ? t('New') : '—'}</span>
  const positive = metric.change_percent >= 0
  const Icon = positive ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={positive ? 'admin-change-positive' : 'admin-change-negative'}
      title={t('New activity compared with the previous period')}
    >
      <Icon size={13} />
      {positive ? '+' : ''}
      {metric.change_percent}%
    </span>
  )
}

function Overview({ rows, views = false }: { rows: AdminDashboard['overview']; views?: boolean }) {
  useLocale()
  const maximum = Math.max(1, ...rows.map((row) => (views ? row.views : row.individuals + row.businesses)))
  const ceiling = Math.max(5, Math.ceil(maximum / 5) * 5)
  return (
    <div
      className="admin-chart"
      role="group"
      aria-label={
        views ? t('Website views by period') : t('New individual and business registrations by period')
      }
    >
      <div className="admin-chart-axis">
        {[1, 0.75, 0.5, 0.25, 0].map((fraction) => (
          <span key={fraction}>{Math.round(ceiling * fraction)}</span>
        ))}
      </div>
      <div className="admin-chart-plot">
        <div className="admin-chart-grid" aria-hidden />
        {rows.map((row) => (
          <div
            key={row.start}
            className="admin-chart-column"
            title={`${shortDate(row.start)}–${shortDate(row.end)}: ${views ? t('{count} views', { count: row.views }) : t('{count} individuals, {businesses} businesses', { count: row.individuals, businesses: row.businesses })}`}
          >
            <div className="admin-chart-stack">
              {views ? (
                <span className="admin-bar-views" style={{ height: `${(row.views / ceiling) * 100}%` }} />
              ) : (
                <>
                  <span
                    className="admin-bar-business"
                    style={{ height: `${(row.businesses / ceiling) * 100}%` }}
                  />
                  <span
                    className="admin-bar-individual"
                    style={{ height: `${(row.individuals / ceiling) * 100}%` }}
                  />
                </>
              )}
            </div>
            <span className="admin-chart-label">{shortDate(row.start)}</span>
          </div>
        ))}
      </div>
      <table className="sr-only">
        <caption>{views ? t('Website views') : t('New registrations')}</caption>
        <thead>
          <tr>
            <th>{t('Period')}</th>
            <th>{views ? t('Views') : t('Individuals')}</th>
            {!views ? <th>{t('Businesses')}</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.start}>
              <th>
                {row.start} {t('to')} {row.end}
              </th>
              <td>{views ? row.views : row.individuals}</td>
              {!views ? <td>{row.businesses}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminDashboardPage() {
  useLocale()
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const parsedDays = Number(params.get(t('days')) ?? 30)
  const days = [7, 30, 90].includes(parsedDays) ? parsedDays : 30
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.adminDashboard(days),
    queryFn: () => adminApi.dashboard(days),
  })

  if (isLoading)
    return (
      <div aria-label={t('Loading dashboard')}>
        <Skeleton className="mb-6 h-12 w-80" />
        <div className="admin-metrics">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="mt-6 h-96" />
      </div>
    )
  if (isError || !data)
    return (
      <div className="admin-empty" role="alert">
        <h1>{t('Could not load the dashboard')}</h1>
        <p>{t('Please try again.')}</p>
        <button onClick={() => void refetch()}>{t('Retry')}</button>
      </div>
    )

  const metrics = [
    { key: 'users' as const, label: 'Total Users', icon: Users, to: '/admin/users' },
    {
      key: 'individuals' as const,
      label: 'Individuals',
      icon: UserRound,
      to: '/admin/users?type=individual',
    },
    { key: 'businesses' as const, label: 'Businesses', icon: Building2, to: '/admin/users?type=agency' },
    { key: 'views' as const, label: 'Website Views', icon: Eye, to: '#website-views' },
  ]
  const total = Object.values(data.user_status).reduce((sum, count) => sum + count, 0)
  let cumulative = 0
  const segments = (Object.entries(data.user_status) as [AdminUserStatus, number][]).map(
    ([status, count]) => {
      const start = cumulative
      cumulative += total ? (count / total) * 100 : 0
      return `${STATUS_COLORS[status]} ${start}% ${cumulative}%`
    },
  )

  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>
            {t('Welcome back,')} {user?.name.split(' ')[0] ?? t('Admin')}! <span aria-hidden>👋</span>
          </h1>
          <p>{t('Here’s what’s happening on MoriHome today.')}</p>
        </div>
        <label className="admin-period">
          <CalendarDays size={17} aria-hidden />
          <select
            aria-label={t('Dashboard period')}
            value={days}
            onChange={(event) => setParams({ days: event.target.value })}
          >
            <option value={7}>{t('Last 7 days')}</option>
            <option value={30}>{t('Last 30 days')}</option>
            <option value={90}>{t('Last 90 days')}</option>
          </select>
        </label>
      </div>
      <div className="admin-metrics">
        {metrics.map(({ key, label, icon: Icon, to }) => (
          <Link
            key={key}
            to={to}
            className={`admin-metric admin-metric-${key}`}
            onClick={
              key === 'views'
                ? (event) => {
                    event.preventDefault()
                    document.getElementById('website-views')?.scrollIntoView({ behavior: 'smooth' })
                  }
                : undefined
            }
          >
            <span className="admin-metric-icon">
              <Icon />
            </span>
            <div>
              <h2>{t(label)}</h2>
              <div className="admin-metric-value">
                <strong>{number(data.metrics[key].total)}</strong>
                <MetricChange metric={data.metrics[key]} />
              </div>
              <p>
                {key === 'views' ? t('Page views') : '+' + number(data.metrics[key].current) + ' joined'}{' '}
                {t('in the last')} {days} {t('days')}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <p className="admin-metrics-note">
        {t('User totals are all-time. Growth compares new activity with the previous')} {days} {t('days.')}
      </p>

      <div className="admin-dashboard-grid">
        <div className="admin-dashboard-main">
          <section className="admin-panel admin-recent">
            <div className="admin-panel-heading">
              <h2>
                <Users size={19} />
                {t('Recent Users')}
              </h2>
              <Link to="/admin/users">
                {t('View all')} <ArrowRight size={14} />
              </Link>
            </div>
            <AdminUsersTable users={data.recent_users} />
          </section>
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>
                <Grid2X2 size={19} />
                {t('Service Categories')}
              </h2>
              <div>
                <Link to="/admin/categories">
                  {t('View all')} <ArrowRight size={14} />
                </Link>
                <Link className="admin-primary-button" to="/admin/categories?new=1">
                  <Plus size={14} />
                  {t('Add Category')}
                </Link>
              </div>
            </div>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('Category Name')}</th>
                    <th>{t('Icon')}</th>
                    <th>{t('Status')}</th>
                    <th>{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.categories.map((category, index) => {
                    const Icon = resolveCategoryIcon(category.icon)
                    return (
                      <tr key={category.id}>
                        <td>{index + 1}</td>
                        <td>
                          <strong>{categoryLabel(category.name)}</strong>
                        </td>
                        <td>
                          <Icon size={20} className="admin-category-icon" aria-hidden />
                        </td>
                        <td>
                          <span
                            className={`admin-status admin-status-${category.is_active ? 'active' : 'inactive'}`}
                          >
                            {category.is_active ? t('Active') : t('Inactive')}
                          </span>
                        </td>
                        <td>
                          <Link
                            className="admin-row-action"
                            aria-label={t('Edit {name}', { name: categoryLabel(category.name) })}
                            to={`/admin/categories?edit=${category.id}`}
                          >
                            {t('Edit')}
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {data.categories.length === 0 ? (
                <p className="admin-empty">{t('No categories yet. Add your first service category.')}</p>
              ) : null}
            </div>
          </section>
        </div>
        <div className="admin-dashboard-aside">
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>
                <BarChart3 size={19} />
                {t('Users Overview')}
              </h2>
            </div>
            <div className="admin-chart-legend">
              <span>
                <i style={{ background: '#2f8cff' }} />
                {t('Individuals')}
              </span>
              <span>
                <i style={{ background: '#ffc72c' }} />
                {t('Businesses')}
              </span>
            </div>
            <Overview rows={data.overview} />
            <p className="admin-chart-caption">{t('New provider accounts in the selected period')}</p>
          </section>
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>
                <Users size={19} />
                {t('User Status')}
              </h2>
            </div>
            <div className="admin-status-chart">
              <div
                className="admin-donut"
                style={{ background: total ? `conic-gradient(${segments.join(',')})` : '#e5eaf1' }}
              >
                <div>
                  <strong>{number(total)}</strong>
                  <span>{t('Users')}</span>
                </div>
              </div>
              <ul>
                {(Object.entries(data.user_status) as [AdminUserStatus, number][]).map(([status, count]) => (
                  <li key={status}>
                    <Link to={`/admin/users?status=${status}`}>
                      <i style={{ background: STATUS_COLORS[status] }} />
                      {t(USER_STATUS_LABELS[status])}
                    </Link>
                    <strong>{number(count)}</strong>
                    <span>{total ? Math.round((count / total) * 100) : 0}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="admin-chart-caption">
              {t('Inactive includes draft, rejected and unpublished profiles.')}
            </p>
          </section>
        </div>
      </div>
      <section className="admin-panel admin-views-panel" id="website-views">
        <div className="admin-panel-heading">
          <h2>
            <Eye size={19} />
            {t('Website Views')}
          </h2>
          <span className="admin-muted">
            {number(data.metrics.views.total)} {t('in the last')} {days} {t('days')}
          </span>
        </div>
        <div className="admin-views-grid">
          <Overview rows={data.overview} views />
          <div className="admin-top-pages">
            <h3>{t('Most viewed pages')}</h3>
            {data.top_pages.length ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('Page')}</th>
                    <th>{t('Views')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_pages.map((page) => (
                    <tr key={page.path}>
                      <td>
                        <Link to={page.path}>{page.path === '/' ? t('Home') : page.path}</Link>
                      </td>
                      <td>{number(Number(page.views))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="admin-empty">
                {t(
                  'No visits recorded in this period. Real visits will appear here as people browse the website.',
                )}
              </p>
            )}
          </div>
        </div>
        <p className="admin-chart-caption">
          {t(
            'Public page loads and navigation, excluding administrator visits. These are page views, not unique visitors.',
          )}
          {data.tracking_started_at
            ? ' ' + t('Tracking since {date}', { date: shortDate(data.tracking_started_at.slice(0, 10)) })
            : ''}
        </p>
      </section>
    </>
  )
}
