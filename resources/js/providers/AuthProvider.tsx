import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, type ReactNode } from 'react'
import { authApi } from '@/api/endpoints'
import { AuthContext, type AuthContextValue } from './authContext'
import { queryKeys } from '@/api/queryKeys'
import type { AuthenticatedUser } from '@/types/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.currentUser(),
    queryFn: authApi.currentUser,
    retry: false,
    staleTime: 5 * 60_000,
    // A signed-out visitor is the common case, not an error worth surfacing.
    throwOnError: false,
  })

  const setUser = (user: AuthenticatedUser) => {
    queryClient.setQueryData(queryKeys.currentUser(), user)
  }

  const loginMutation = useMutation({ mutationFn: authApi.login, onSuccess: setUser })
  const registerMutation = useMutation({ mutationFn: authApi.register, onSuccess: setUser })

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.currentUser(), null)
      queryClient.removeQueries({ queryKey: ['provider'] })
      queryClient.removeQueries({ queryKey: ['admin'] })
    },
  })

  const user = data ?? null

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      isAdmin: user?.roles.includes('admin') ?? false,
      isProvider: user?.provider !== undefined,
      login: loginMutation.mutateAsync,
      register: registerMutation.mutateAsync,
      logout: async () => {
        await logoutMutation.mutateAsync()
      },
    }),
    [user, isLoading, loginMutation.mutateAsync, registerMutation.mutateAsync, logoutMutation],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
