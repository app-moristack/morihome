import { expect, it } from 'vitest'
import { credentialsStepSchema, passwordChangeSchema } from './schemas'

it.each(['Abcdef12', 'Abcdef1'])('validates the password length boundary for %s', (password) => {
  const values = { password, password_confirmation: password }
  const expected = password.length === 8

  expect(credentialsStepSchema.safeParse({ ...values, accepts_terms: true }).success).toBe(expected)
  expect(passwordChangeSchema.safeParse({ ...values, current_password: 'Existing-Password9' }).success).toBe(
    expected,
  )
})
