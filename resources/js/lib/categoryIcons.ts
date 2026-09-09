import {
  BrickWall,
  Bug,
  Droplets,
  Flame,
  Forklift,
  Grid3x3,
  Hammer,
  HardHat,
  House,
  Package,
  PaintRoller,
  PanelsTopLeft,
  Ruler,
  SprayCan,
  Sprout,
  Trees,
  Waves,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'

/**
 * Explicit map rather than a namespace import: importing the whole lucide
 * barrel pulls every icon into the entry bundle.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'brick-wall': BrickWall,
  bug: Bug,
  droplets: Droplets,
  flame: Flame,
  forklift: Forklift,
  'grid-3x3': Grid3x3,
  hammer: Hammer,
  'hard-hat': HardHat,
  house: House,
  package: Package,
  'paint-roller': PaintRoller,
  'panels-top-left': PanelsTopLeft,
  ruler: Ruler,
  'spray-can': SprayCan,
  sprout: Sprout,
  trees: Trees,
  waves: Waves,
  wind: Wind,
  wrench: Wrench,
  zap: Zap,
}

export function resolveCategoryIcon(name: string | null): LucideIcon {
  return (name ? CATEGORY_ICONS[name] : undefined) ?? Wrench
}
