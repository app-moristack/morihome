import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { loginSchema, type LoginValues } from '@/lib/schemas'
import { describeAuthError, useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export default function LoginPage() {
  const [formError, setFormError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginValues) => {
    setIsSubmitting(true)
    setFormError(undefined)

    try {
      const user = await login(values)
      showToast(`Welcome back, ${user.name}.`, 'success')

      const next = searchParams.get('next')
      navigate(next ?? (user.roles.includes('admin') ? '/admin' : '/dashboard'))
    } catch (error) {
      const message = describeAuthError(error)
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container-page flex max-w-md flex-col py-10 sm:py-16">
      <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">Sign in</h1>
      <p className="mt-1.5 text-sm text-ink-500">Manage your profile, portfolio and availability.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="card mt-6 flex flex-col gap-4 p-5 sm:p-6" noValidate>
        <TextField
          label="Mobile number or email"
          isRequired
          autoComplete="username"
          placeholder="5765 4321"
          {...(errors.identifier?.message ? { error: errors.identifier.message } : {})}
          {...register('identifier')}
        />

        <TextField
          label="Password"
          isRequired
          type="password"
          autoComplete="current-password"
          {...(errors.password?.message ? { error: errors.password.message } : {})}
          {...register('password')}
        />

        <label className="flex items-center gap-3 text-sm font-medium text-ink-700">
          <input type="checkbox" className="size-5 rounded accent-brand-500" {...register('remember')} />
          Keep me signed in
        </label>

        {formError ? (
          <div
            role="alert"
            className="flex gap-2.5 rounded-xl border border-danger/30 bg-red-50 p-3.5 text-sm text-danger"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {formError}
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          isFullWidth
          isLoading={isSubmitting}
          leadingIcon={<LogIn className="size-5" />}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        New to MoriHome?{' '}
        <Link to="/register" className="font-semibold text-ink-900 underline underline-offset-2">
          Join the directory
        </Link>
      </p>
    </div>
  )
}
