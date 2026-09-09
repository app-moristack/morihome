import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { KeyRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { ApiError } from '@/api/client'
import { authApi } from '@/api/endpoints'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { passwordChangeSchema, type PasswordChangeValues } from '@/lib/schemas'
import { useToast } from '@/hooks/useToast'

export default function ProviderSecurityPage() {
  const { showToast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordChangeValues>({ resolver: zodResolver(passwordChangeSchema) })

  const changePassword = useMutation({
    mutationFn: authApi.updatePassword,
    onSuccess: () => {
      reset()
      showToast('Your password has been changed.', 'success')
    },
    onError: (error) => {
      if (error instanceof ApiError && error.firstErrorFor('current_password')) {
        setError('current_password', { message: error.firstErrorFor('current_password') })

        return
      }

      showToast('We could not change your password.', 'error')
    },
  })

  return (
    <div className="container-page max-w-lg py-8 sm:py-10">
      <PageHeader
        eyebrow="Provider dashboard"
        title="Security"
        description="Change the password you sign in with."
      />

      <form
        onSubmit={handleSubmit((values) => changePassword.mutate(values))}
        className="card mt-6 flex flex-col gap-4 p-5 sm:p-6"
        noValidate
      >
        <TextField
          label="Current password"
          isRequired
          type="password"
          autoComplete="current-password"
          {...(errors.current_password?.message ? { error: errors.current_password.message } : {})}
          {...register('current_password')}
        />

        <TextField
          label="New password"
          isRequired
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters, with an uppercase letter and a number."
          {...(errors.password?.message ? { error: errors.password.message } : {})}
          {...register('password')}
        />

        <TextField
          label="Confirm new password"
          isRequired
          type="password"
          autoComplete="new-password"
          {...(errors.password_confirmation?.message ? { error: errors.password_confirmation.message } : {})}
          {...register('password_confirmation')}
        />

        <Button
          type="submit"
          size="lg"
          isFullWidth
          isLoading={changePassword.isPending}
          leadingIcon={<KeyRound className="size-5" />}
        >
          Change password
        </Button>
      </form>
    </div>
  )
}
