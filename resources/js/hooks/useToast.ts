import { use } from 'react'
import { ToastContext, type ToastContextValue } from '@/providers/toastContext'

export function useToast(): ToastContextValue {
  const context = use(ToastContext)

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider.')
  }

  return context
}
