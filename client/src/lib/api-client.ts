import axios from 'axios'
import { onAuthStateChanged } from 'firebase/auth'
import { firebaseAuth } from 'src/services/firebase.service'

// Every API route is protected by `requireApiAuth`, so browser requests have to
// carry the signed-in user's Firebase ID token. Registering this once keeps the
// call sites free of per-request header plumbing (and stops new call sites from
// silently forgetting it).
const isInternalApiUrl = (url?: string) => {
  if (!url) return false
  if (url.startsWith('/api/')) return true

  if (typeof window !== 'undefined' && /^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url)

      return parsed.origin === window.location.origin && parsed.pathname.startsWith('/api/')
    } catch {
      return false
    }
  }

  return false
}

// `firebaseAuth.currentUser` is null until Firebase has restored the session, so a
// request fired from a mount effect would otherwise go out unauthenticated and 401.
// Waiting for the first auth-state callback makes the token available to the very
// first request of a page load.
let authReady: Promise<void> | null = null

const waitForAuth = () => {
  if (typeof window === 'undefined') return Promise.resolve()

  if (!authReady) {
    authReady = new Promise<void>(resolve => {
      const unsubscribe = onAuthStateChanged(
        firebaseAuth,
        () => {
          unsubscribe()
          resolve()
        },
        () => {
          unsubscribe()
          resolve()
        }
      )
    })
  }

  return authReady
}

export const getIdToken = async () => {
  try {
    if (!firebaseAuth.currentUser) await waitForAuth()

    return (await firebaseAuth.currentUser?.getIdToken()) ?? null
  } catch {
    return null
  }
}

export const authHeaders = async (): Promise<Record<string, string>> => {
  const token = await getIdToken()

  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** `fetch` for internal API routes, with the bearer token attached. */
export const authFetch = async (input: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers || {})
  const token = await getIdToken()
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)

  return fetch(input, { ...init, headers })
}

let interceptorInstalled = false

export const installApiAuthInterceptor = () => {
  if (interceptorInstalled) return
  interceptorInstalled = true

  axios.interceptors.request.use(async config => {
    if (!isInternalApiUrl(config.url)) return config

    const token = await getIdToken()
    if (token) {
      config.headers = config.headers || {}
      if (!config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })
}
