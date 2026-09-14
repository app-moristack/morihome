import { z } from 'zod'

const MAURITIAN_MOBILE = /^(\+?230)?0?5\d{7}$/
const ANY_PHONE = /^\+?\d[\d\s-]{6,17}$/

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Enter your mobile number.')
  .refine(
    (value) => MAURITIAN_MOBILE.test(value.replace(/[\s-]/g, '')) || ANY_PHONE.test(value),
    'Enter a valid Mauritian mobile (e.g. 5765 4321) or an international number.',
  )

export const optionalPhoneSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || ANY_PHONE.test(value), 'Enter a valid phone number.')
  .optional()

const passwordSchema = z
  .string()
  .min(12, 'Use at least 12 characters.')
  .max(128, 'Use no more than 128 characters.')
  .regex(/[a-z]/, 'Include a lowercase letter.')
  .regex(/[A-Z]/, 'Include an uppercase letter.')
  .regex(/\d/, 'Include a number.')

export const accountStepSchema = z.object({
  provider_type: z.enum(['individual', 'agency'], {
    message: 'Choose the kind of professional you are.',
  }),
  name: z.string().trim().min(2, 'Enter your name or business name.').max(120),
  phone: phoneSchema,
  whatsapp_phone: optionalPhoneSchema,
  email: z.string().trim().email('Enter a valid email address.').or(z.literal('')).optional(),
})

export const locationStepSchema = z.object({
  address: z.string().trim().min(4, 'Enter the address you work from.').max(255),
  locality: z.string().trim().min(2, 'Choose your town or village.').max(120),
  latitude: z.number({ message: 'Pick your location so customers can find you.' }).min(-90).max(90),
  longitude: z.number({ message: 'Pick your location so customers can find you.' }).min(-180).max(180),
  service_areas: z.array(z.string().trim().min(1)).max(20).optional(),
})

export const servicesStepSchema = z.object({
  service_categories: z.array(z.number().int().positive()).min(1, 'Pick at least one service.').max(10),
  description: z.string().trim().max(2000).optional(),
})

export const credentialsStepSchema = z
  .object({
    password: passwordSchema,
    password_confirmation: z.string(),
    accepts_terms: z.literal(true, { message: 'You must accept the terms to continue.' }),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: 'The passwords do not match.',
    path: ['password_confirmation'],
  })

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, 'Enter your mobile number or email.'),
  password: z.string().min(1, 'Enter your password.'),
  remember: z.boolean().optional(),
})

export const passwordChangeSchema = z
  .object({
    current_password: z.string().min(1, 'Enter your current password.'),
    password: passwordSchema,
    password_confirmation: z.string(),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: 'The passwords do not match.',
    path: ['password_confirmation'],
  })

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name or business name.').max(120),
  provider_type: z.enum(['individual', 'agency']),
  description: z.string().trim().max(2000).optional(),
  phone: phoneSchema,
  whatsapp_phone: optionalPhoneSchema,
  email: z.string().trim().email('Enter a valid email address.').or(z.literal('')).optional(),
  website: z.string().trim().url('Enter a full URL including https://').or(z.literal('')).optional(),
  address: z.string().trim().min(4, 'Enter your address.').max(255),
  locality: z.string().trim().min(2).max(120),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

export type AccountStepValues = z.infer<typeof accountStepSchema>
export type LocationStepValues = z.infer<typeof locationStepSchema>
export type ServicesStepValues = z.infer<typeof servicesStepSchema>
export type CredentialsStepValues = z.infer<typeof credentialsStepSchema>
export type LoginValues = z.infer<typeof loginSchema>
export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>
export type ProfileValues = z.infer<typeof profileSchema>
