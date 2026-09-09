import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'whatsapp'
type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-400 text-[#171717] hover:bg-brand-300 active:bg-brand-500 shadow-card',
  secondary: 'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200',
  danger: 'bg-danger text-white hover:brightness-110 active:brightness-95',
  whatsapp: 'bg-[#25D366] text-[#171717] hover:brightness-105 active:brightness-95 shadow-card',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-sm gap-1.5',
  md: 'min-h-11 px-4 text-sm gap-2',
  lg: 'min-h-13 px-6 text-base gap-2.5',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  isFullWidth?: boolean
  leadingIcon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isFullWidth = false,
  leadingIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-pill font-semibold',
        'transition-[background-color,transform,box-shadow] duration-200 ease-[var(--ease-out-soft)]',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        isFullWidth && 'w-full',
        className,
      )}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : leadingIcon}
      {children}
    </button>
  )
}
