import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { Check, Share2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'

type ShareButtonProps = {
  title: string
  text: string
  url: string
  size?: 'sm' | 'md' | 'lg'
}

const CONFIRMATION_MS = 2200

export function ShareButton({ title, text, url, size = 'md' }: ShareButtonProps) {
  useLocale()
  const [hasCopied, setHasCopied] = useState(false)
  const { showToast } = useToast()

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })

        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setHasCopied(true)
      showToast('Profile link copied.', 'success')
      window.setTimeout(() => setHasCopied(false), CONFIRMATION_MS)
    } catch {
      showToast('Could not copy the link. Copy it from the address bar.', 'error')
    }
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleShare}
      leadingIcon={hasCopied ? <Check className="size-4" /> : <Share2 className="size-4" />}
      aria-label={t('Share this profile')}
    >
      {hasCopied ? t('Copied') : t('Share')}
    </Button>
  )
}
