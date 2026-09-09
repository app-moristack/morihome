import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { PortfolioImage } from '@/types/api'

type ProviderGalleryProps = {
  images: PortfolioImage[]
  providerName: string
}

export function ProviderGallery({ images, providerName }: ProviderGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    if (openIndex === null) {
      return
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenIndex(null)
      }

      if (event.key === 'ArrowRight') {
        setOpenIndex((index) => (index === null ? null : (index + 1) % images.length))
      }

      if (event.key === 'ArrowLeft') {
        setOpenIndex((index) => (index === null ? null : (index - 1 + images.length) % images.length))
      }
    }

    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [openIndex, images.length])

  if (images.length === 0) {
    return null
  }

  const activeImage = openIndex === null ? null : images[openIndex]

  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg font-bold text-ink-900">Previous work</h2>

      <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {images.map((image, index) => (
          <li key={image.id}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group block aspect-4/3 w-full overflow-hidden rounded-xl bg-ink-50 focus-visible:outline-ink-900"
              aria-label={image.caption ?? `Open work sample ${index + 1} by ${providerName}`}
            >
              <img
                src={image.url}
                alt={image.caption ?? ''}
                loading="lazy"
                decoding="async"
                {...(image.width ? { width: image.width } : {})}
                {...(image.height ? { height: image.height } : {})}
                className="size-full object-cover transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      {activeImage ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.caption ?? 'Work sample'}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink-950/92 p-4"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Close gallery"
          >
            <X className="size-5" aria-hidden />
          </button>

          <img
            src={activeImage.url}
            alt={activeImage.caption ?? ''}
            className="max-h-[78dvh] max-w-full rounded-xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />

          {activeImage.caption ? (
            <p className="mt-3 max-w-lg text-center text-sm text-white/85">{activeImage.caption}</p>
          ) : null}

          {images.length > 1 ? (
            <div className="mt-4 flex items-center gap-4" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                onClick={() => setOpenIndex((index) => ((index ?? 0) - 1 + images.length) % images.length)}
                className="grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Previous image"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <span className="text-sm font-medium text-white/70">
                {(openIndex ?? 0) + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={() => setOpenIndex((index) => ((index ?? 0) + 1) % images.length)}
                className="grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Next image"
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
