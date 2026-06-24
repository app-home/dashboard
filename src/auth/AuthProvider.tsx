import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from '@/auth/context'
import type { AuthUser } from '@/auth/context'
import {
  fetchGoogleProfile,
  LOGIN_SCOPES,
  requestTokensPKCE,
  revokeAccessToken,
} from '@/auth/google'
import { getUserPermissions } from '@/auth/permissions'
import { DRIVE_APPDATA_SCOPE } from '@/storage/driveConfig'

const STORAGE_KEY = 'dashboard.auth.user'
const LAST_LOGIN_KEY = 'dashboard.auth.lastLogin'

const ID_TOKEN_KEY = 'dashboard.auth.idToken'

/** Lee el perfil guardado para mantener la sesión visible tras recargar. */
function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const user = JSON.parse(raw) as AuthUser
    return {
      ...user,
      role: user.role ?? 'user',
      permissions: user.permissions ?? [],
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  // El access token vive solo en memoria (caduca en ~1h); el idToken se persiste.
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [idToken, setIdToken] = useState<string | null>(() =>
    localStorage.getItem(ID_TOKEN_KEY),
  )
  const [lastLoginAt, setLastLoginAt] = useState<string | null>(() =>
    localStorage.getItem(LAST_LOGIN_KEY),
  )
  const [loading, setLoading] = useState(false)

  const login = useCallback(async () => {
    setLoading(true)
    try {
      const scopes = `${LOGIN_SCOPES} ${DRIVE_APPDATA_SCOPE}`
      const { accessToken: token, idToken } = await requestTokensPKCE(scopes)
      const profile = await fetchGoogleProfile(token)
      const { role, permissions } = await getUserPermissions(profile.email)
      const now = new Date().toISOString()
      const userWithPermissions: AuthUser = {
        ...profile,
        role,
        permissions,
      }
      setAccessToken(token)
      setIdToken(idToken || null)
      setUser(userWithPermissions)
      setLastLoginAt(now)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithPermissions))
      if (idToken) localStorage.setItem(ID_TOKEN_KEY, idToken)
      localStorage.setItem(LAST_LOGIN_KEY, now)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    if (accessToken) revokeAccessToken(accessToken)
    setAccessToken(null)
    setIdToken(null)
    setUser(null)
    setLastLoginAt(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ID_TOKEN_KEY)
    localStorage.removeItem(LAST_LOGIN_KEY)
  }, [accessToken])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      loading,
      accessToken,
      idToken,
      lastLoginAt,
      login,
      logout,
    }),
    [user, loading, accessToken, idToken, lastLoginAt, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
