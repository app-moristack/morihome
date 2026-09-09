const API_ROOT = '/api/v1'
const CSRF_COOKIE = 'XSRF-TOKEN'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors: Record<string, string[]> = {},
  ) {
    super(message)
    this.name = 'ApiError'
  }

  firstErrorFor(field: string): string | undefined {
    return this.errors[field]?.[0]
  }

  get isValidationError(): boolean {
    return this.status === 422
  }

  get isUnauthenticated(): boolean {
    return this.status === 401
  }
}

function readCsrfToken(): string | null {
  const match = document.cookie.split('; ').find((entry) => entry.startsWith(`${CSRF_COOKIE}=`))

  return match ? decodeURIComponent(match.slice(CSRF_COOKIE.length + 1)) : null
}

let csrfRequest: Promise<void> | null = null

async function ensureCsrfCookie(): Promise<void> {
  if (readCsrfToken()) {
    return
  }

  csrfRequest ??= fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' }).then(() => {
    csrfRequest = null
  })

  await csrfRequest
}

type RequestOptions = {
  method?: string
  body?: unknown
  signal?: AbortSignal
}

async function toApiError(response: Response): Promise<ApiError> {
  let message = response.statusText || 'Request failed'
  let errors: Record<string, string[]> = {}

  try {
    const payload = await response.json()
    message = payload.message ?? message
    errors = payload.errors ?? {}
  } catch {
    // A non-JSON error body leaves the status-derived message in place.
  }

  return new ApiError(response.status, message, errors)
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET'
  const isMutation = method !== 'GET' && method !== 'HEAD'
  const isFormData = options.body instanceof FormData

  if (isMutation) {
    await ensureCsrfCookie()
  }

  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = readCsrfToken()

  if (isMutation && token) {
    headers['X-XSRF-TOKEN'] = token
  }

  if (isMutation && !isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_ROOT}${path}`, {
    method,
    headers,
    credentials: 'same-origin',
    signal: options.signal,
    body: isFormData ? (options.body as FormData) : options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    throw await toApiError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function buildQueryString(params: Record<string, unknown>): string {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(`${key}[]`, String(entry)))
      continue
    }

    if (typeof value === 'boolean') {
      query.append(key, value ? '1' : '0')
      continue
    }

    query.append(key, String(value))
  }

  return query.toString()
}
