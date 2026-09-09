export type BootstrapPayload = {
  appName: string
  supportEmail: string
  supportWhatsapp: string | null
  defaultRadiusKm: number
  maxRadiusKm: number
  radiusOptionsKm: number[]
  providerTypes: { value: string; label: string }[]
  whatsappTemplate: string
}

const FALLBACK: BootstrapPayload = {
  appName: 'MoriHome',
  supportEmail: 'support@morihome.mu',
  supportWhatsapp: null,
  defaultRadiusKm: 10,
  maxRadiusKm: 50,
  radiusOptionsKm: [2, 5, 10, 20, 30, 50],
  providerTypes: [
    { value: 'individual', label: 'Individual worker' },
    { value: 'agency', label: 'Agency' },
    { value: 'business', label: 'Business' },
  ],
  whatsappTemplate: 'Hello, I found your profile on :app. I am looking for help with :service.',
}

declare global {
  interface Window {
    __MORIHOME__?: Partial<BootstrapPayload>
  }
}

export const bootstrap: BootstrapPayload = {
  ...FALLBACK,
  ...(typeof window === 'undefined' ? {} : (window.__MORIHOME__ ?? {})),
}
