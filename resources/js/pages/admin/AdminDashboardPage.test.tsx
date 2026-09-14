import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { App } from '@/App'
import { adminApi, authApi } from '@/api/endpoints'
import { AuthProvider } from '@/providers/AuthProvider'
import { renderWithProviders } from '@/test/renderWithProviders'
import type { AdminDashboard, AdminUser } from '@/types/api'

const user: AdminUser = {
  id: 2,
  name: 'Volt Mauritius',
  account_name: 'Alex',
  email: 'volt@example.com',
  phone: '+23051000009',
  type: 'agency',
  roles: ['provider'],
  locality: 'Curepipe',
  logo_url: null,
  service: 'Electrical services',
  status: 'pending',
  joined_at: '2026-09-11T09:00:00Z',
  provider_id: 7,
  provider_slug: 'volt-mauritius',
  approval_status: 'pending',
}
const metric = { total: 2, current: 1, previous: 0, change_percent: null }
const dashboard: AdminDashboard = {
  period: { days: 30, start: '2026-08-13T00:00:00Z', end: '2026-09-11T12:00:00Z' },
  metrics: {
    users: metric,
    individuals: { ...metric, total: 0 },
    businesses: { ...metric, total: 1 },
    views: { ...metric, total: 12 },
  },
  user_status: { active: 1, pending: 1, suspended: 0, inactive: 0 },
  providers: { approved: 0, pending: 1, suspended: 0, draft: 0, rejected: 0 },
  overview: [{ start: '2026-09-05', end: '2026-09-11', individuals: 0, businesses: 1, views: 12 }],
  recent_users: [user],
  categories: [
    {
      id: 3,
      name: 'Electrical services',
      slug: 'electrical-services',
      icon: 'zap',
      is_active: false,
      sort_order: 1,
    },
  ],
  top_pages: [{ path: '/', views: 12 }],
  tracking_started_at: '2026-09-11T09:00:00Z',
  service_categories: { total: 1, active: 0 },
  contact_events_last_30_days: 0,
  recent_registrations: [],
}

function renderAdmin(route = '/admin') {
  vi.spyOn(authApi, 'currentUser').mockResolvedValue({
    id: 1,
    name: 'Alex Admin',
    email: 'admin@example.com',
    phone: '',
    roles: ['admin'],
  })
  renderWithProviders(
    <AuthProvider>
      <App />
    </AuthProvider>,
    { route },
  )
}

describe('Admin dashboard', () => {
  it('renders real metrics and links, switches date range and shows pending notifications', async () => {
    const query = vi.spyOn(adminApi, 'dashboard').mockResolvedValue(dashboard)
    renderAdmin()
    expect(await screen.findByRole('heading', { name: /Welcome back, Alex/ })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Admin navigation' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Manage Volt Mauritius' })).toHaveAttribute(
      'href',
      '/admin/providers/7',
    )
    expect(screen.getByRole('link', { name: /Add Category/ })).toHaveAttribute(
      'href',
      '/admin/categories?new=1',
    )
    expect(screen.getByRole('link', { name: 'Edit Electrical services' })).toHaveAttribute(
      'href',
      '/admin/categories?edit=3',
    )
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Dashboard period' }), '7')
    await waitFor(() => expect(query).toHaveBeenCalledWith(7))
    await userEvent.click(screen.getByRole('button', { name: 'Notifications: 1 pending reviews' }))
    expect(screen.getByText('1 provider profiles are waiting for review.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Open review queue/ })).toHaveAttribute(
      'href',
      '/admin/users?status=pending',
    )
  })

  it('shows an error and retries instead of staying in a loading state', async () => {
    const query = vi.spyOn(adminApi, 'dashboard').mockRejectedValue(new Error('Unavailable'))
    renderAdmin()
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Could not load the dashboard')
    query.mockResolvedValue(dashboard)
    await userEvent.click(within(alert).getByRole('button', { name: 'Retry' }))
    expect(await screen.findByRole('heading', { name: /Welcome back/ })).toBeInTheDocument()
  })

  it('applies user type and status filters from navigation and allows pagination', async () => {
    vi.spyOn(adminApi, 'dashboard').mockResolvedValue(dashboard)
    const users = vi
      .spyOn(adminApi, 'users')
      .mockResolvedValue({
        data: [user],
        links: { first: null, last: null, next: null, prev: null },
        meta: { total: 26, current_page: 1, per_page: 25, from: 1, to: 25, last_page: 2 },
      })
    renderAdmin('/admin/users?type=agency&status=pending')
    expect(await screen.findByRole('link', { name: 'Manage Volt Mauritius' })).toBeInTheDocument()
    expect(users).toHaveBeenCalledWith({ type: 'agency', status: 'pending', page: 1, term: '' })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() =>
      expect(users).toHaveBeenCalledWith({ type: 'agency', status: 'pending', page: 2, term: '' }),
    )
  })
})
