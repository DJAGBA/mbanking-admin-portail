import Cookies from 'js-cookie'
// ========== TYPES ==========
interface TokenPayload {
  exp?: number
  iat?: number
  sub?: string
  aud?: string | string[]
  iss?: string
  [key: string]: unknown
}
// ========== CONFIG ==========
const TOKEN_KEY = 'token'
const DEFAULT_EXPIRY_DAYS = 7
// ========== HELPERS INTERNES ==========
const decodeToken = (token: string): TokenPayload | null => {
  try {
    const [, payload] = token.split('.')
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}
// ========== FONCTIONS PUBLIQUES ==========
export const setToken = (token: string, expiresInDays = DEFAULT_EXPIRY_DAYS): void => {
  Cookies.set(TOKEN_KEY, token, {
    expires: expiresInDays,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })
}
export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY)
}
export const removeToken = (): void => {
  Cookies.remove(TOKEN_KEY, { path: '/' })
  // Legacy : suppression de l'ancien stockage localStorage
  localStorage.removeItem(TOKEN_KEY)
}
export const isTokenExpired = (token: string): boolean => {
  if (!token) return true
  const payload = decodeToken(token)
  if (!payload?.exp) return false
  return Date.now() > payload.exp * 1000
}
export const isAuthenticated = (): boolean => {
  const token = getToken()
  return !!token && !isTokenExpired(token)
}
export const getTokenPayload = (): TokenPayload | null => {
  const token = getToken()
  if (!token) return null
  return decodeToken(token)
}
export const getTokenExpirationTime = (token: string): number | null => {
  const payload = decodeToken(token)
  if (!payload?.exp) return null
  const timeLeft = payload.exp * 1000 - Date.now()
  return timeLeft > 0 ? timeLeft : null
}
export const getTimeUntilExpiry = (): number => {
  const token = getToken()
  if (!token) return 0
  return getTokenExpirationTime(token) ?? 0
}
export const shouldRefreshToken = (thresholdMs = 5 * 60 * 1000): boolean => {
  const timeLeft = getTimeUntilExpiry()
  return timeLeft < thresholdMs
}