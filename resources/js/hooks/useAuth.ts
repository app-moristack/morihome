import { t } from '@/i18n'
import { use } from 'react'
import { ApiError } from '@/api/client'
import { AuthContext, type AuthContextValue } from '@/providers/authContext'

export function useAuth(): AuthContextValue {
  const context = use(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }

  return context
}

export function describeAuthError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.firstErrorFor('identifier') ?? error.message
  }

  return t('Something went wrong. Please try again.')
}
