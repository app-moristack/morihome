import { describe, expect, it } from 'vitest'
import { buildTelUrl, buildWhatsappMessage, buildWhatsappUrl } from './whatsapp'

const TEMPLATE = 'Hello, I found your profile on :app. I am looking for help with :service.'

describe('buildWhatsappMessage', () => {
  it('fills the app name and the service into the template', () => {
    expect(buildWhatsappMessage({ serviceName: 'Plumbing', appName: 'MoriHome', template: TEMPLATE })).toBe(
      'Hello, I found your profile on MoriHome. I am looking for help with plumbing.',
    )
  })

  it('falls back to a generic service when none is known', () => {
    expect(buildWhatsappMessage({ appName: 'MoriHome', template: TEMPLATE })).toBe(
      'Hello, I found your profile on MoriHome. I am looking for help with a project at home.',
    )
  })

  it('treats an empty service name as unknown', () => {
    expect(buildWhatsappMessage({ serviceName: '', appName: 'MoriHome', template: TEMPLATE })).toContain(
      'a project at home',
    )
  })
})

describe('buildWhatsappUrl', () => {
  it('builds a wa.me link with the prefilled message', () => {
    const url = buildWhatsappUrl({
      number: '23057654321',
      serviceName: 'Tiling',
      appName: 'MoriHome',
      template: TEMPLATE,
    })

    expect(url).toBe(
      'https://wa.me/23057654321?text=Hello%2C%20I%20found%20your%20profile%20on%20MoriHome.%20I%20am%20looking%20for%20help%20with%20tiling.',
    )
  })

  it('strips formatting characters from the number', () => {
    const url = buildWhatsappUrl({ number: '+230 5765 4321', appName: 'MoriHome', template: TEMPLATE })

    expect(url).toContain('https://wa.me/23057654321?text=')
  })

  it('returns null when the number is missing or too short', () => {
    expect(buildWhatsappUrl({ number: null })).toBeNull()
    expect(buildWhatsappUrl({ number: undefined })).toBeNull()
    expect(buildWhatsappUrl({ number: '12345' })).toBeNull()
  })

  it('encodes the message so it survives the query string', () => {
    const url = buildWhatsappUrl({
      number: '23057654321',
      serviceName: 'Roofing & Waterproofing',
      appName: 'MoriHome',
      template: TEMPLATE,
    })

    expect(url).not.toContain(' ')
    expect(url).toContain('%26')
  })
})

describe('buildTelUrl', () => {
  it('builds a tel link keeping the leading plus', () => {
    expect(buildTelUrl('+230 5765 4321')).toBe('tel:+23057654321')
  })

  it('returns null for an unusable number', () => {
    expect(buildTelUrl(null)).toBeNull()
    expect(buildTelUrl('123')).toBeNull()
  })
})
