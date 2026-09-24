import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PropertyFilters } from './PropertyFilters'

describe('reactive property filters', () => {
  it('debounces typing, resets pagination, and preserves amenities', async () => {
    const apply = vi.fn()
    render(
      <PropertyFilters
        params={new URLSearchParams('purpose=sales&page=2&amenities[]=pool')}
        onApply={apply}
      />,
    )
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Grand' } })
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Grand Baie' } })
    expect(apply).not.toHaveBeenCalled()
    await waitFor(() => expect(apply).toHaveBeenCalledTimes(1))
    const params = apply.mock.calls[0]![0] as URLSearchParams
    expect(params.get('location')).toBe('Grand Baie')
    expect(params.has('page')).toBe(false)
    expect(params.getAll('amenities[]')).toEqual(['pool'])
    expect(screen.queryByRole('button', { name: 'Apply filters' })).not.toBeInTheDocument()
  })

  it('applies selections immediately and blocks invalid budget ranges', async () => {
    const apply = vi.fn()
    render(<PropertyFilters params={new URLSearchParams('purpose=rental&min_price=50000')} onApply={apply} />)
    await userEvent.selectOptions(screen.getByLabelText('Maximum budget'), '15000')
    expect(apply).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Maximum budget')
    await userEvent.selectOptions(screen.getByLabelText('Maximum budget'), '100000')
    expect(apply).toHaveBeenCalledTimes(1)
    expect((apply.mock.calls[0]![0] as URLSearchParams).get('max_price')).toBe('100000')
  })

  it('cancels pending typed filters when clearing and synchronizes external URL changes', async () => {
    const apply = vi.fn()
    const { rerender } = render(
      <PropertyFilters params={new URLSearchParams('purpose=rental')} onApply={apply} />,
    )
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Grand Baie' } })
    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(screen.getByLabelText('Location')).toHaveValue('')
    expect(apply).toHaveBeenCalledTimes(1)
    rerender(
      <PropertyFilters params={new URLSearchParams('purpose=sales&location=Albion')} onApply={apply} />,
    )
    expect(screen.getByLabelText('Location')).toHaveValue('Albion')
    expect(screen.getByLabelText('I am looking for')).toHaveValue('sales')
  })
})
