import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { adminApi } from '@/api/endpoints'
import { renderWithProviders } from '@/test/renderWithProviders'
import AdminCategoriesPage from './AdminCategoriesPage'

describe('Admin categories', () => {
  it('opens a linked category editor and preserves inactive status when saving', async () => {
    vi.spyOn(adminApi, 'categories').mockResolvedValue([
      {
        id: 3,
        name: 'Electrical',
        slug: 'electrical',
        icon: 'zap',
        sort_order: 3,
        is_active: false,
        is_popular: false,
        parent_id: null,
        description: null,
      },
    ])
    const save = vi.spyOn(adminApi, 'saveCategory').mockResolvedValue({ data: {} })
    renderWithProviders(<AdminCategoriesPage />, { route: '/admin/categories?edit=3' })
    expect(await screen.findByRole('heading', { name: 'Edit Electrical' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Active/ })).not.toBeChecked()
    await userEvent.clear(screen.getByLabelText(/^Name/))
    await userEvent.type(screen.getByLabelText(/^Name/), 'Electrical inspections')
    await userEvent.click(screen.getByRole('button', { name: 'Save category' }))
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Electrical inspections', is_active: false }),
        3,
      ),
    )
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Save category' })).not.toBeInTheDocument(),
    )
  })
})
