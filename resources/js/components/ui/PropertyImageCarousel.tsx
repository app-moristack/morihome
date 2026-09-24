import { useRef, useState, type ReactNode } from 'react'
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react'
import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { cn } from '@/lib/cn'
import type { PropertyListingImage } from '@/types/api'

type Props = {
  images: PropertyListingImage[]
  title: string
  className?: string
  children?: ReactNode
}

export function PropertyImageCarousel({ images, title, className, children }: Props) {
  useLocale()
  const photos = [...images].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
  const [selected, setSelected] = useState(0)
  const index = Math.min(selected, Math.max(0, photos.length - 1))
  const photo = photos[index]
  const multiple = photos.length > 1
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const move = (direction: number) => {
    if (multiple) setSelected((index + direction + photos.length) % photos.length)
  }

  return (
    <div
      role="group"
      aria-roledescription={multiple ? t('Carousel') : undefined}
      aria-label={t('Photos of {name}', { name: title })}
      tabIndex={multiple ? 0 : undefined}
      className={cn(
        'relative h-52 overflow-hidden bg-[#e3edf1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400',
        className,
      )}
      onKeyDown={(event) => {
        if (!multiple || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
        event.preventDefault()
        event.stopPropagation()
        move(event.key === 'ArrowRight' ? 1 : -1)
      }}
      onTouchStart={(event) => {
        const touch = event.touches[0]
        touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null
      }}
      onTouchEnd={(event) => {
        const touch = event.changedTouches[0]
        const start = touchStart.current
        touchStart.current = null
        if (!touch || !start) return
        const dx = touch.clientX - start.x
        const dy = touch.clientY - start.y
        if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1)
      }}
      onTouchCancel={() => {
        touchStart.current = null
      }}
    >
      {photo ? (
        <img
          key={photo.id}
          src={photo.url}
          alt={photo.caption || title}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full place-items-center">
          <Building2 className="size-12 text-[#527182]" aria-hidden />
        </div>
      )}
      {children}
      {multiple && (
        <>
          <span
            className="pointer-events-none absolute top-2 right-2 rounded-full bg-black/65 px-2 py-1 text-xs font-semibold text-white"
            role="status"
            aria-label={t('Photo {current} of {total}', { current: index + 1, total: photos.length })}
          >
            {index + 1} / {photos.length}
          </span>
          <button
            type="button"
            aria-label={t('Previous photo')}
            onClick={() => move(-1)}
            className="absolute top-1/2 left-1 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white shadow-sm hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-brand-400"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label={t('Next photo')}
            onClick={() => move(1)}
            className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white shadow-sm hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-brand-400"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap justify-center bg-linear-to-t from-black/60 to-transparent px-10 pt-2">
            {photos.map((item, position) => (
              <button
                key={item.id}
                type="button"
                aria-label={t('Show photo {number}', { number: position + 1 })}
                aria-current={position === index ? 'true' : undefined}
                onClick={() => setSelected(position)}
                className="grid size-6 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-brand-400"
              >
                <span
                  className={cn(
                    'h-1.5 rounded-full shadow-sm',
                    position === index ? 'w-3 bg-brand-400' : 'w-1.5 bg-white/80',
                  )}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
