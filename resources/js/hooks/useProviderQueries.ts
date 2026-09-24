import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { providerApi } from '@/api/endpoints'
import { queryKeys } from '@/api/queryKeys'

export function useOwnProfile() {
  return useQuery({
    queryKey: queryKeys.providerProfile(),
    queryFn: providerApi.profile,
  })
}

function useInvalidateProfile() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: ['provider', 'profile'] })
    void queryClient.invalidateQueries({ queryKey: queryKeys.currentUser() })
  }
}

export function useUpdateProfile() {
  const invalidate = useInvalidateProfile()

  return useMutation({ mutationFn: providerApi.updateProfile, onSuccess: invalidate })
}

export function useSubmitForReview() {
  const invalidate = useInvalidateProfile()

  return useMutation({ mutationFn: providerApi.submitForReview, onSuccess: invalidate })
}

export function useUploadBrandImage() {
  const invalidate = useInvalidateProfile()

  return useMutation({
    mutationFn: ({ kind, file }: { kind: 'logo' | 'cover'; file: File }) =>
      providerApi.uploadBrandImage(kind, file),
    onSuccess: invalidate,
  })
}

export function usePortfolio() {
  return useQuery({
    queryKey: queryKeys.providerPortfolio(),
    queryFn: providerApi.portfolio,
  })
}

function useInvalidatePortfolio() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: ['provider', 'portfolio'] })
    void queryClient.invalidateQueries({ queryKey: ['provider', 'profile'] })
  }
}

export function useUploadPortfolioImage() {
  const invalidate = useInvalidatePortfolio()

  return useMutation({
    mutationFn: ({ file, caption }: { file: File; caption?: string }) =>
      providerApi.uploadPortfolioImage(file, caption),
    onSuccess: invalidate,
  })
}

export function useDeletePortfolioImage() {
  const invalidate = useInvalidatePortfolio()

  return useMutation({ mutationFn: providerApi.deletePortfolioImage, onSuccess: invalidate })
}

export function useReorderPortfolio() {
  const invalidate = useInvalidatePortfolio()

  return useMutation({ mutationFn: providerApi.reorderPortfolio, onSuccess: invalidate })
}

export function useUpdateOpeningHours() {
  const invalidate = useInvalidateProfile()

  return useMutation({ mutationFn: providerApi.updateOpeningHours, onSuccess: invalidate })
}

export function useProviderSubscriptions() {
  return useQuery({
    queryKey: queryKeys.providerSubscriptions(),
    queryFn: providerApi.subscriptions,
  })
}

export function useRequestSubscriptions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: providerApi.requestSubscriptions,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provider', 'subscriptions'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.currentUser() })
    },
  })
}

export function usePropertyListings() {
  return useQuery({
    queryKey: queryKeys.propertyListings(),
    queryFn: providerApi.propertyListings,
  })
}

export function useCreatePropertyListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: providerApi.createPropertyListing,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['provider', 'property-listings'] }),
  })
}

export function useUploadPropertyImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ slug, file }: { slug: string; file: File }) => providerApi.uploadPropertyImage(slug, file),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['provider', 'property-listings'] }),
  })
}
