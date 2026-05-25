import { serialize } from 'cookie'
import crypto from 'crypto'

const COOKIE_NAME = 'flyff_session'
const ONE_DAY_SECONDS = 60 * 60 * 24
const SESSION_VERSION = 'v1'

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET

  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET or NEXTAUTH_SECRET must be set to at least 32 characters')
  }

  return secret
}

function signPayload(payload) {
  return crypto
    .createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url')
}

function safeEqual(a, b) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)

  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

export function createSessionToken({ email, role = 'user', issuedAt = Date.now() }) {
  const safeEmail = String(email || '').trim().toLowerCase()
  const safeRole = role === 'super' ? 'super' : 'user'
  const payload = `${SESSION_VERSION}|${safeEmail}|${issuedAt}|${safeRole}`
  const signature = signPayload(payload)

  return `${payload}|${signature}`
}

export function parseSessionToken(token) {
  const value = String(token || '')
  const parts = value.split('|')

  if (parts.length === 5 && parts[0] === SESSION_VERSION) {
    const [version, email, issuedAt, role, signature] = parts
    const payload = `${version}|${email}|${issuedAt}|${role}`
    const expected = signPayload(payload)

    if (!safeEqual(signature, expected)) {
      return null
    }

    const issuedAtNumber = Number(issuedAt)
    if (!Number.isFinite(issuedAtNumber) || Date.now() - issuedAtNumber > ONE_DAY_SECONDS * 1000) {
      return null
    }

    return {
      email,
      issuedAt: issuedAtNumber,
      role: role === 'super' ? 'super' : 'user',
    }
  }

  return null
}

function getCookieDomain() {
  const domain = process.env.COOKIE_DOMAIN?.trim()

  if (!domain || domain === 'localhost') {
    return undefined
  }

  return domain
}

function isSecureCookie() {
  if (process.env.COOKIE_SECURE) {
    return process.env.COOKIE_SECURE === 'true'
  }

  const publicUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    ''

  return publicUrl.startsWith('https://')
}

export function createSessionCookie(value, options = {}) {
  const domain = getCookieDomain()

  return serialize(COOKIE_NAME, value, {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: 'strict',
    path: '/',
    ...(domain ? { domain } : {}),
    ...options,
  })
}

export function createLoginCookie(sessionToken) {
  return createSessionCookie(sessionToken, {
    maxAge: ONE_DAY_SECONDS,
  })
}

export function createLogoutCookie() {
  return createSessionCookie('', {
    expires: new Date(0),
    maxAge: 0,
  })
}
