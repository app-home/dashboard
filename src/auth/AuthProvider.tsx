import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from '@/auth/context'
import type { AuthUser } from '@/auth/context'
import {
  fetchGoogleProfile,
  loadGis,
  LOGIN_SCOPES,
  requestAccessToken,
  revokeAccessToken,
} from '@/auth/google'
import { DRIVE_APPDATA_SCOPE } from '@/storage/driveConfig'

const STORAGE_KEY = 'dashboard.auth.user'
const LAST_LOGIN_KEY = 'dashboard.auth.lastLogin'

/** Lee el perfil guardado para mantener la sesión visible tras recargar. */
function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  // El perfil se persiste; el access token vive solo en memoria (caduca en ~1h).
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [lastLoginAt, setLastLoginAt] = useState<string | null>(() =>
    localStorage.getItem(LAST_LOGIN_KEY),
  )
  const [loading, setLoading] = useState(false)

  const login = useCallback(async () => {
    setLoading(true)
    try {
      await loadGis()
      const scopes = `${LOGIN_SCOPES} ${DRIVE_APPDATA_SCOPE}`
      const token = await requestAccessToken(scopes)
      const profile = await fetchGoogleProfile(token)
      const now = new Date().toISOString()
      setAccessToken(token)
      setUser(profile)
      setLastLoginAt(now)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
      localStorage.setItem(LAST_LOGIN_KEY, now)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    if (accessToken) revokeAccessToken(accessToken)
    setAccessToken(null)
    setUser(null)
    setLastLoginAt(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LAST_LOGIN_KEY)
  }, [accessToken])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      loading,
      accessToken,
      lastLoginAt,
      login,
      logout,
    }),
    [user, loading, accessToken, lastLoginAt, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
