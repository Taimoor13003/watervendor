import type { NextApiRequest, NextApiResponse } from 'next/types'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const getBearerToken = (request: NextApiRequest) => {
  const authorization = request.headers.authorization
  if (!authorization?.startsWith('Bearer ')) return null

  return authorization.slice('Bearer '.length).trim() || null
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
  if (!adminAuth) {
    response.status(503).json({ error: 'API authentication is not configured' })

    return false
  }

  const token = getBearerToken(request)
  if (!token) {
    response.status(401).json({ error: 'Authentication is required' })

    return false
  }

  try {
    await adminAuth.verifyIdToken(token)

    return true
  } catch {
    response.status(401).json({ error: 'Invalid or expired authentication token' })

    return false
  }
}

// Kept as an alias while existing invoice routes migrate to the generic name.
export const requireInvoiceAuth = requireApiAuth
