import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { ImagePlus } from 'lucide-react'
import { useRef, useState } from 'react'
import { ApiError } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { useUploadBrandImage } from '@/hooks/useProviderQueries'
import { compressImage } from '@/lib/compressImage'
import { useToast } from '@/hooks/useToast'
import type { OwnedProvider } from '@/types/api'

type BrandImageUploaderProps = {
  provider: OwnedProvider
}

export function BrandImageUploader({ provider }: BrandImageUploaderProps) {
  useLocale()
  const logoInput = useRef<HTMLInputElement>(null)
  const coverInput = useRef<HTMLInputElement>(null)
  const [busyKind, setBusyKind] = useState<'logo' | 'cover' | null>(null)
  const uploadImage = useUploadBrandImage()
  const { showToast } = useToast()

  const handleFile = async (kind: 'logo' | 'cover', file: File | undefined) => {
    if (!file) {
      return
    }

    setBusyKind(kind)

    try {
      const optimised = await compressImage(file, kind === 'logo' ? 512 : 1600)
      await uploadImage.mutateAsync({ kind, file: optimised })
      showToast(t(kind === 'logo' ? 'Logo updated.' : 'Cover updated.'), 'success')
    } catch (error) {
      showToast(
        error instanceof ApiError ? (error.firstErrorFor('image') ?? error.message) : t('Upload failed.'),
        'error',
      )
    } finally {
      setBusyKind(null)
    }
  }

  return (
    <section className="card overflow-hidden">
      <div className="relative h-32 bg-ink-900 sm:h-40">
        {provider.cover_url ? (
          <img src={provider.cover_url} alt="" className="size-full object-cover" />
        ) : (
          <div className="size-full bg-gradient-to-br from-ink-900 to-ink-700" aria-hidden />
        )}

        <Button
          size="sm"
          variant="secondary"
          className="absolute right-3 bottom-3"
          isLoading={busyKind === 'cover'}
          leadingIcon={<ImagePlus className="size-4" />}
          onClick={() => coverInput.current?.click()}
        >
          {t('Cover')}
        </Button>
        <input
          ref={coverInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => handleFile('cover', event.target.files?.[0])}
          aria-label={t('Upload a cover image')}
        />
      </div>

      <div className="flex items-center gap-4 p-5">
        {provider.logo_url ? (
          <img
            src={provider.logo_url}
            alt={t('Your logo')}
            width={72}
            height={72}
            className="-mt-12 size-18 rounded-2xl border-4 border-surface bg-surface object-cover shadow-sm"
          />
        ) : (
          <div className="-mt-12 grid size-18 place-items-center rounded-2xl border-4 border-surface bg-ink-100 text-ink-400">
            <ImagePlus className="size-6" aria-hidden />
          </div>
        )}

        <div className="flex-1">
          <p className="text-sm font-bold text-ink-900">{t('Logo & cover')}</p>
          <p className="text-xs leading-relaxed text-ink-500">
            {t('Images are resized on your phone before upload, so they stay light on data.')}
          </p>
        </div>

        <Button
          size="sm"
          variant="ghost"
          isLoading={busyKind === 'logo'}
          onClick={() => logoInput.current?.click()}
        >
          {t('Change logo')}
        </Button>
        <input
          ref={logoInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => handleFile('logo', event.target.files?.[0])}
          aria-label={t('Upload a logo')}
        />
      </div>
    </section>
  )
}
