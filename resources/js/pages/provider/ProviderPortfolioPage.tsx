import { ArrowDown, ArrowUp, ImagePlus, Images, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { ApiError } from '@/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  useDeletePortfolioImage,
  usePortfolio,
  useReorderPortfolio,
  useUploadPortfolioImage,
} from '@/hooks/useProviderQueries'
import { compressImage } from '@/lib/compressImage'
import { useToast } from '@/hooks/useToast'

const MAX_IMAGES = 20
const UPLOAD_MAX_DIMENSION = 1600

export default function ProviderPortfolioPage() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { data: images = [], isLoading } = usePortfolio()
  const uploadImage = useUploadPortfolioImage()
  const deleteImage = useDeletePortfolioImage()
  const reorder = useReorderPortfolio()
  const { showToast } = useToast()

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return
    }

    setIsUploading(true)

    for (const file of Array.from(files)) {
      try {
        const optimised = await compressImage(file, UPLOAD_MAX_DIMENSION)
        await uploadImage.mutateAsync({ file: optimised })
      } catch (error) {
        showToast(
          error instanceof ApiError
            ? (error.firstErrorFor('image') ?? error.message)
            : `${file.name} failed to upload.`,
          'error',
        )
        break
      }
    }

    setIsUploading(false)

    if (fileInput.current) {
      fileInput.current.value = ''
    }
  }

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction

    if (target < 0 || target >= images.length) {
      return
    }

    const ordered = [...images]
    const [moved] = ordered.splice(index, 1)

    if (moved) {
      ordered.splice(target, 0, moved)
      reorder.mutate(ordered.map((image) => image.id))
    }
  }

  return (
    <div className="container-page max-w-3xl py-8 sm:py-10">
      <PageHeader
        eyebrow="Provider dashboard"
        title="Your portfolio"
        description="Photos of finished work are the single biggest reason customers choose one professional over another."
        action={
          <Button
            isLoading={isUploading}
            disabled={images.length >= MAX_IMAGES}
            onClick={() => fileInput.current?.click()}
            leadingIcon={<ImagePlus className="size-4" />}
          >
            Add photos
          </Button>
        }
      />

      <input
        ref={fileInput}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
        aria-label="Upload portfolio photos"
      />

      <p className="mt-3 text-sm text-ink-500">
        {images.length} of {MAX_IMAGES} photos. Photos are resized on your device before upload.
      </p>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="aspect-4/3 rounded-card" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <EmptyState
            icon={<Images className="size-6" aria-hidden />}
            title="No photos yet"
            description="Add a few pictures of jobs you have completed. Three to six good photos is plenty."
            action={
              <Button
                onClick={() => fileInput.current?.click()}
                leadingIcon={<ImagePlus className="size-4" />}
              >
                Add your first photo
              </Button>
            }
          />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image, index) => (
              <li key={image.id} className="card overflow-hidden">
                <img
                  src={image.url}
                  alt={image.caption ?? ''}
                  loading="lazy"
                  className="aspect-4/3 w-full bg-ink-50 object-cover"
                />
                <div className="flex items-center justify-between gap-1 p-2">
                  <div className="flex gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="grid size-9 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 disabled:opacity-30"
                      aria-label={`Move photo ${index + 1} earlier`}
                    >
                      <ArrowUp className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === images.length - 1}
                      className="grid size-9 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 disabled:opacity-30"
                      aria-label={`Move photo ${index + 1} later`}
                    >
                      <ArrowDown className="size-4" aria-hidden />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      deleteImage.mutate(image.id, {
                        onSuccess: () => showToast('Photo removed.', 'success'),
                      })
                    }
                    className="grid size-9 place-items-center rounded-lg text-danger hover:bg-red-50"
                    aria-label={`Delete photo ${index + 1}`}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
