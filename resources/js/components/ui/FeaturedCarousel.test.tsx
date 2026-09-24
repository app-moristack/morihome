import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FeaturedCarousel } from './FeaturedCarousel'

function viewport(initialWidth: number) {
  let width = initialWidth
  const listeners = new Set<() => void>()
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches: width >= Number(query.match(/\d+/)?.[0]),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: (_event: string, listener: EventListenerOrEventListenerObject | null) => {
      listeners.add(listener as () => void)
    },
    removeEventListener: (_event: string, listener: EventListenerOrEventListenerObject | null) => {
      listeners.delete(listener as () => void)
    },
    dispatchEvent: vi.fn(),
  }))
  return (nextWidth: number) =>
    act(() => {
      width = nextWidth
      listeners.forEach((listener) => listener())
    })
}

function cards(count = 11) {
  return Array.from({ length: count }, (_, i) => <article key={i}>Card {i + 1}</article>)
}

describe('FeaturedCarousel', () => {
  it.each([
    [390, 1],
    [768, 2],
    [1100, 3],
    [1440, 5],
  ])('shows %i-pixel screens with %i cards per page', (width, count) => {
    viewport(width)
    render(<FeaturedCarousel label="Featured">{cards()}</FeaturedCarousel>)
    expect(screen.getAllByRole('article').map((card) => card.textContent)).toEqual(
      Array.from({ length: count }, (_, i) => `Card ${i + 1}`),
    )
  })

  it('navigates full pages, reaches the final item, and supports keyboard navigation', async () => {
    viewport(1440)
    const user = userEvent.setup()
    render(<FeaturedCarousel label="Featured">{cards()}</FeaturedCarousel>)
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getAllByRole('article').map((card) => card.textContent)).toEqual([
      'Card 6',
      'Card 7',
      'Card 8',
      'Card 9',
      'Card 10',
    ])
    await user.keyboard('{Enter}')
    expect(screen.getAllByRole('article').map((card) => card.textContent)).toEqual(['Card 11'])
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Page 3 of 3')
    await user.click(screen.getByRole('button', { name: 'Go to page 1' }))
    expect(screen.getByText('Card 1')).toBeInTheDocument()
  })

  it('keeps the current item accessible when the viewport changes', async () => {
    const resize = viewport(1440)
    render(<FeaturedCarousel label="Featured">{cards()}</FeaturedCarousel>)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    resize(1100)
    expect(screen.getAllByRole('article').map((card) => card.textContent)).toEqual([
      'Card 4',
      'Card 5',
      'Card 6',
    ])
    resize(390)
    expect(screen.getByRole('article')).toHaveTextContent('Card 6')
  })

  it('hides navigation when all items fit and keeps carousels independent', async () => {
    viewport(1440)
    render(
      <>
        <FeaturedCarousel label="Short">{cards(2)}</FeaturedCarousel>
        <FeaturedCarousel label="Long">{cards(6)}</FeaturedCarousel>
      </>,
    )
    const short = within(screen.getByRole('group', { name: 'Short' }))
    const long = within(screen.getByRole('group', { name: 'Long' }))
    expect(short.queryByRole('button')).not.toBeInTheDocument()
    await userEvent.click(long.getByRole('button', { name: 'Next' }))
    expect(short.getAllByRole('article')).toHaveLength(2)
    expect(long.getByRole('article')).toHaveTextContent('Card 6')
  })
})
