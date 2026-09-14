import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CircleAlert,
  Eye,
  EyeOff,
  ChartNoAxesCombined,
  Images,
  CircleUserRound,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { Brand } from '@/components/layout/Brand'
import loginImage from '../../images/professional-login-hero.webp'
import '../../css/login.css'
import { loginSchema, type LoginValues } from '@/lib/schemas'
import { describeAuthError, useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export default function LoginPage() {
  const [accountType, setAccountType] = useState<'individual' | 'business'>('individual')
  const [showPassword, setShowPassword] = useState(false)
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
      const safeNext =
        next?.startsWith('/') &&
        !next.startsWith('//') &&
        !next.includes('\\') &&
        !Array.from(next).some((character) => character.charCodeAt(0) < 32)
          ? next
          : null
      navigate(safeNext ?? (user.roles.includes('admin') ? '/admin' : '/dashboard'))
    } catch (error) {
      const message = describeAuthError(error)
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <aside className="login-story" aria-label="Welcome to MoriHome">
        <img
          src={loginImage}
          alt="Yellow hard hat and building plans beside a modern Mauritian home"
          className="login-story-image"
        />
        <Brand tagline="For professionals. A stronger Mauritius." />
        <div className="login-story-copy">
          <h2>
            Welcome back,
            <br />
            <span>Pro.</span>
          </h2>
          <p>Manage your professional account and take your business further.</p>
          <ul className="login-benefits">
            {[
              {
                icon: CircleUserRound,
                title: 'Manage your profile',
                text: 'Keep your information and services up to date.',
              },
              {
                icon: Images,
                title: 'Showcase your work',
                text: 'Add photos of your projects and expertise.',
              },
              {
                icon: ChartNoAxesCombined,
                title: 'Reach more clients',
                text: 'Get discovered by people looking for services and properties across Mauritius.',
              },
            ].map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span>
                  <Icon aria-hidden />
                </span>
                <div>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="home-handwritten login-story-note">
          Your skills.
          <br />
          More opportunities.
          <br />A stronger Mauritius.
          <span aria-hidden />
        </p>
      </aside>
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-signup">
          <span>Don’t have an account?</span>
          <Link to={`/register?type=${accountType === 'business' ? 'agency' : 'individual'}`}>
            Create Account
          </Link>
        </div>
        <div className="login-content">
          <h1 id="login-title">
            Welcome Back <span aria-hidden>👋</span>
          </h1>
          <p className="login-subtitle">Sign in to your MoriHome account</p>
          <fieldset className="login-account-types">
            <legend className="sr-only">Account type</legend>
            {[
              {
                value: 'individual' as const,
                icon: UserRound,
                title: 'Individual',
                description: 'Workers & Self-employed',
              },
              {
                value: 'business' as const,
                icon: Building2,
                title: 'Business',
                description: 'Agencies & Companies',
              },
            ].map(({ value, icon: Icon, title, description }) => (
              <label key={value} className={accountType === value ? 'is-selected' : ''}>
                <input
                  type="radio"
                  name="accountType"
                  value={value}
                  checked={accountType === value}
                  onChange={() => setAccountType(value)}
                  className="sr-only"
                />
                <Icon aria-hidden />
                <span>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
              </label>
            ))}
          </fieldset>

          <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
            <TextField
              label="Mobile number or email"
              isRequired
              autoComplete="username"
              placeholder="Email address or phone number"
              {...(errors.identifier?.message ? { error: errors.identifier.message } : {})}
              {...register('identifier')}
            />

            <div className="login-password">
              <TextField
                label="Password"
                isRequired
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="current-password"
                {...(errors.password?.message ? { error: errors.password.message } : {})}
                {...register('password')}
              />
              <button
                type="button"
                className="login-password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye aria-hidden /> : <EyeOff aria-hidden />}
              </button>
            </div>

            <label className="flex items-center gap-3 text-sm font-medium text-ink-700">
              <input type="checkbox" className="size-5 rounded accent-brand-500" {...register('remember')} />
              Keep me signed in
            </label>
            <Link to="/contact" className="login-help">
              Need help signing in?
            </Link>

            {formError ? (
              <div
                role="alert"
                className="flex gap-2.5 rounded-xl border border-danger/30 bg-red-50 p-3.5 text-sm text-danger"
              >
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                {formError}
              </div>
            ) : null}

            <Button type="submit" size="lg" isFullWidth isLoading={isSubmitting} className="login-submit">
              Sign In <ArrowRight className="size-5" aria-hidden />
            </Button>
          </form>

          <div className="login-security">
            <ShieldCheck aria-hidden />
            <div>
              <strong>Secure & private</strong>
              <p>Your information is safe with us.</p>
            </div>
          </div>
          <Link to="/" className="login-home">
            <ArrowLeft size={20} aria-hidden /> Back to Home
          </Link>
        </div>
      </section>
    </div>
  )
}
