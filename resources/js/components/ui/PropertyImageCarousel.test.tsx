import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PropertyImageCarousel } from './PropertyImageCarousel'

const images = [
  { id: 2, url: '/second.jpg', caption: 'Pool', width: 800, height: 600, sort_order: 1 },
  { id: 1, url: '/first.jpg', caption: null, width: 800, height: 600, sort_order: 0 },
  { id: 3, url: '/third.jpg', caption: 'Garden', width: 800, height: 600, sort_order: 2 },
]

describe('PropertyImageCarousel', () => {
  it('shows images in listing order and cycles in both directions', async () => {
    render(<PropertyImageCarousel title="Villa" images={images} />)
    expect(screen.getByRole('img')).toHaveAttribute('src', '/first.jpg')
    await userEvent.click(screen.getByRole('button', { name: 'Next photo' }))
    expect(screen.getByRole('img')).toHaveAttribute('src', '/second.jpg')
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Pool')
    expect(screen.getByRole('status')).toHaveAccessibleName('Photo 2 of 3')
    await userEvent.click(screen.getByRole('button', { name: 'Show photo 1' }))
    await userEvent.click(screen.getByRole('button', { name: 'Previous photo' }))
    expect(screen.getByRole('img')).toHaveAttribute('src', '/third.jpg')
    await userEvent.click(screen.getByRole('button', { name: 'Next photo' }))
    expect(screen.getByRole('img')).toHaveAttribute('src', '/first.jpg')
    expect(images[0]!.id).toBe(2)
  })

  it('supports keyboard controls and horizontal swipes without intercepting vertical scrolling', () => {
    render(<PropertyImageCarousel title="Villa" images={images} />)
    const carousel = screen.getByRole('group', { name: 'Photos of Villa' })
    fireEvent.keyDown(carousel, { key: 'ArrowRight' })
    expect(screen.getByRole('img')).toHaveAttribute('src', '/second.jpg')
    fireEvent.keyDown(carousel, { key: 'ArrowLeft' })
    expect(screen.getByRole('img')).toHaveAttribute('src', '/first.jpg')
    fireEvent.touchStart(carousel, { touches: [{ clientX: 200, clientY: 100 }] })
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 50, clientY: 110 }] })
    expect(screen.getByRole('img')).toHaveAttribute('src', '/second.jpg')
    fireEvent.touchStart(carousel, { touches: [{ clientX: 200, clientY: 100 }] })
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 150, clientY: 300 }] })
    expect(screen.getByRole('img')).toHaveAttribute('src', '/second.jpg')
  })

  it('keeps image navigation independent between property cards', async () => {
    render(
      <>
        <PropertyImageCarousel title="Villa" images={images} />
        <PropertyImageCarousel title="Apartment" images={images} />
      </>,
    )
    const villa = within(screen.getByRole('group', { name: 'Photos of Villa' }))
    const apartment = within(screen.getByRole('group', { name: 'Photos of Apartment' }))
    await userEvent.click(villa.getByRole('button', { name: 'Next photo' }))
    expect(villa.getByRole('img')).toHaveAttribute('src', '/second.jpg')
    expect(apartment.getByRole('img')).toHaveAttribute('src', '/first.jpg')
  })

  it('hides controls for one or no photos and handles removed photos', async () => {
    const { rerender } = render(<PropertyImageCarousel title="Villa" images={images} />)
    await userEvent.click(screen.getByRole('button', { name: 'Previous photo' }))
    rerender(<PropertyImageCarousel title="Villa" images={[images[1]!]} />)
    expect(screen.getByRole('img')).toHaveAttribute('src', '/first.jpg')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    rerender(<PropertyImageCarousel title="Villa" images={[]} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByRole('group')).toBeInTheDocument()
  })
})
