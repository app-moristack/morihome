import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/cn'

const CONTROL_CLASSES =
  'w-full rounded-xl border border-ink-200 bg-surface px-3.5 py-3 text-base text-ink-900 ' +
  'placeholder:text-ink-400 transition-colors duration-150 ' +
  'focus:border-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-300 ' +
  'disabled:bg-ink-50 disabled:text-ink-400 aria-[invalid=true]:border-danger'

type FieldShellProps = {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  isRequired?: boolean
  children: ReactNode
  className?: string
}

export function FieldShell({
  label,
  htmlFor,
  error,
  hint,
  isRequired,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-800">
        {label}
        {isRequired ? <span className="ml-0.5 text-danger">*</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-sm text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
  isRequired?: boolean
  wrapperClassName?: string
}

export function TextField({
  label,
  error,
  hint,
  isRequired,
  wrapperClassName,
  id,
  ...props
}: TextFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <FieldShell
      label={label}
      htmlFor={fieldId}
      error={error}
      hint={hint}
      isRequired={isRequired}
      className={wrapperClassName}
    >
      <input
        {...props}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(CONTROL_CLASSES, props.className)}
      />
    </FieldShell>
  )
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
  hint?: string
  isRequired?: boolean
}

export function TextAreaField({ label, error, hint, isRequired, id, ...props }: TextAreaFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <FieldShell label={label} htmlFor={fieldId} error={error} hint={hint} isRequired={isRequired}>
      <textarea
        {...props}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(CONTROL_CLASSES, 'min-h-28 resize-y', props.className)}
      />
    </FieldShell>
  )
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
  hint?: string
  isRequired?: boolean
}

export function SelectField({ label, error, hint, isRequired, id, children, ...props }: SelectFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <FieldShell label={label} htmlFor={fieldId} error={error} hint={hint} isRequired={isRequired}>
      <select
        {...props}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(CONTROL_CLASSES, 'appearance-none bg-no-repeat pr-10', props.className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235F6368' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundPosition: 'right 0.85rem center',
          backgroundSize: '1.1rem',
        }}
      >
        {children}
      </select>
    </FieldShell>
  )
}
