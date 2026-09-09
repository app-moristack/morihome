import { createContext } from 'react'
import type { RegistrationPayload } from '@/api/endpoints'
import type { AuthenticatedUser } from '@/types/api'

export type AuthContextValue = {
  user: AuthenticatedUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isProvider: boolean
  login: (payload: { identifier: string; password: string; remember?: boolean }) => Promise<AuthenticatedUser>
  register: (payload: RegistrationPayload) => Promise<AuthenticatedUser>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
