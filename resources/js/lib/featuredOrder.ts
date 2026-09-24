// Each page load gets fresh random ranks. Keep them for this page's lifetime so
// refetching, changing language, and moving between carousel pages don't reshuffle.
export function createFeaturedOrder() {
  const ranks = new Map<number, number>()

  return <T extends { id: number }>(items: readonly T[]): T[] => {
    for (const item of items) {
      if (!ranks.has(item.id)) ranks.set(item.id, Math.random())
    }

    return [...items].sort((a, b) => ranks.get(a.id)! - ranks.get(b.id)! || a.id - b.id)
  }
}
