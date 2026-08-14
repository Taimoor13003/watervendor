import type { NextApiRequest, NextApiResponse } from 'next/types'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const getBearerToken = (request: NextApiRequest) => {
  const authorization = request.headers.authorization
  if (!authorization?.startsWith('Bearer ')) return null

  return authorization.slice('Bearer '.length).trim() || null
}

const verifyWithIdentityToolkit = async (token: string) => {
  const apiKey = process.env.FIREBASE_WEB_API_KEY

  if (!apiKey) return null

  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token })
    })

    return response.ok
  } catch {
    return false
  }
}

const getAdminAuth = () => {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (!projectId || !clientEmail || !privateKey) return null

    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  }

  return getAuth()
}

export const requireApiAuth = async (request: NextApiRequest, response: NextApiResponse) => {
  // Local development remains usable without production secrets. Production
  // fails closed when Firebase Admin credentials have not been configured.
  if (process.env.NODE_ENV !== 'production' && process.env.REQUIRE_API_AUTH !== 'true') return true

  const adminAuth = getAdminAuth()
  const token = getBearerToken(request)
  if (!token) {
    response.status(401).json({ error: 'Authentication is required' })

    return false
  }

  try {
    if (adminAuth) {
      await adminAuth.verifyIdToken(token)

      return true
    }

    // Vercel production can securely verify Firebase sessions without storing a
    // private service-account key. The Identity Toolkit validates the ID token
    // with the Firebase project before protected report data is returned.
    const isValidToken = await verifyWithIdentityToolkit(token)
    if (!isValidToken) {
      response.status(401).json({ error: 'Invalid or expired authentication token' })

      return false
    }

    return true
  } catch {
    response.status(401).json({ error: 'Invalid or expired authentication token' })

    return false
  }
}

// Kept as an alias while existing invoice routes migrate to the generic name.
export const requireInvoiceAuth = requireApiAuth
