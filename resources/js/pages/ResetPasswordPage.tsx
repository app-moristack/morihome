import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { apiRequest, ApiError } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setPending(true)
    setError('')
    try {
      await apiRequest('/reset-password', {
        method: 'POST',
        body: {
          token: params.get('token'),
          email: params.get('email'),
          password: data.get('password'),
          password_confirmation: data.get('password_confirmation'),
        },
      })
      setComplete(true)
      window.history.replaceState(null, '', '/reset-password')
    } catch (failure) {
      setError(
        failure instanceof ApiError
          ? (failure.firstErrorFor('password') ?? failure.firstErrorFor('email') ?? failure.message)
          : 'Unable to reset your password. Please try again.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="container-page py-12">
      <div className="mx-auto max-w-md rounded-2xl border border-ink-200 bg-surface p-8">
        <h1 className="text-3xl font-bold">Reset your password</h1>
        {complete ? (
          <p role="status" className="mt-5">
            Your password was updated and other sessions were signed out.{' '}
            <Link to="/login" className="underline">
              Sign in
            </Link>
          </p>
        ) : !params.get('token') || !params.get('email') ? (
          <p className="mt-5">
            Open the complete link from your reset email.{' '}
            <Link to="/contact" className="underline">
              Contact us for help.
            </Link>
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-5">
            <TextField
              label="New password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              isRequired
              hint="12–128 characters, including uppercase, lowercase and a number."
            />
            <TextField
              label="Confirm new password"
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              isRequired
            />
            {error && (
              <p role="alert" className="text-danger">
                {error}
              </p>
            )}
            <Button type="submit" isLoading={pending}>
              Update password
            </Button>
          </form>
        )}
      </div>
    </section>
  )
}
