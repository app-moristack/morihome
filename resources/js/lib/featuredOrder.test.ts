import { describe, expect, it, vi } from 'vitest'
import { createFeaturedOrder } from './featuredOrder'

describe('featured order', () => {
  const items = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]

  it('randomizes the whole list without mutating or losing any listings', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.6)
      .mockReturnValueOnce(0.3)
    const result = createFeaturedOrder()(items)
    expect(result.map((item) => item.id)).toEqual([2, 4, 3, 1])
    expect(items.map((item) => item.id)).toEqual([1, 2, 3, 4])
    expect(new Set(result).size).toBe(items.length)
  })

  it('keeps order stable after a refetch or language change', () => {
    const random = vi
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.6)
      .mockReturnValueOnce(0.3)
    const order = createFeaturedOrder()
    const first = order(items)
    const translated = [...items].reverse().map((item) => ({ ...item, title: 'Traduit' }))
    expect(order(translated).map((item) => item.id)).toEqual(first.map((item) => item.id))
    expect(random).toHaveBeenCalledTimes(4)
    expect(order(translated).every((item) => item.title === 'Traduit')).toBe(true)
  })

  it('uses fresh random ranks for a new page load', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const firstLoad = createFeaturedOrder()(items)
    random.mockReturnValueOnce(0.9).mockReturnValueOnce(0.7).mockReturnValueOnce(0.4).mockReturnValueOnce(0.1)
    const secondLoad = createFeaturedOrder()(items)
    expect(secondLoad.map((item) => item.id)).toEqual([4, 3, 2, 1])
    expect(secondLoad).not.toEqual(firstLoad)
  })

  it('handles empty lists and includes newly featured listings', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const order = createFeaturedOrder()
    expect(order([])).toEqual([])
    expect(order([{ id: 1 }])).toEqual([{ id: 1 }])
    expect(order(items)).toEqual(items)
  })
})
