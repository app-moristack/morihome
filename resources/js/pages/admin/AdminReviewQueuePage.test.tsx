import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { adminApi } from '@/api/endpoints'
import { renderWithProviders } from '@/test/renderWithProviders'
import AdminReviewQueuePage from './AdminReviewQueuePage'

describe('Admin review queue', () => {
  it('shows status labels and navigates through filtered result pages', async () => {
    const search = vi.spyOn(adminApi, 'searchProviders').mockImplementation(async ({ page = 1 }) => ({
      data: [
        {
          id: page,
          name: `Pending provider ${page}`,
          locality: 'Port Louis',
          phone: '+23051000001',
          submitted_at: null,
          approved_at: null,
          approval_status: 'pending' as const,
        },
      ],
      total: 26,
      current_page: page,
      last_page: 2,
    }))
    renderWithProviders(<AdminReviewQueuePage />, { route: '/admin/providers?status=pending' })
    expect(
      await screen.findByRole('link', { name: /Pending provider 1.*Pending.*Review/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Pending provider 2')).toBeInTheDocument()
    expect(search).toHaveBeenLastCalledWith({ status: 'pending', page: 2 })
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    await userEvent.click(screen.getByRole('tab', { name: 'Approved' }))
    await waitFor(() => expect(search).toHaveBeenLastCalledWith({ status: 'approved', page: 1 }))
  })

  it('normalizes invalid filters and page numbers from a direct URL', async () => {
    const search = vi.spyOn(adminApi, 'searchProviders').mockResolvedValue({
      data: [],
      total: 0,
      current_page: 1,
      last_page: 1,
    })
    renderWithProviders(<AdminReviewQueuePage />, { route: '/admin/providers?status=invalid&page=-2' })
    await waitFor(() => expect(search).toHaveBeenCalledWith({ status: 'pending', page: 1 }))
    expect(await screen.findByText('Nothing here')).toBeInTheDocument()
  })
})
