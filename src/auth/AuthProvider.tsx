import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from '@/auth/context'
import type { AuthUser } from '@/auth/context'
import {
  fetchGoogleProfile,
  loadGis,
  requestAccessToken,
  revokeAccessToken,
} from '@/auth/google'

const STORAGE_KEY = 'dashboard.auth.user'

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

export function AuthProvider({ children }: { children: ReactNode }) {
  // El perfil se persiste; el access token vive solo en memoria (caduca en ~1h).
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async () => {
    setLoading(true)
    try {
      await loadGis()
      const token = await requestAccessToken()
      const profile = await fetchGoogleProfile(token)
      setAccessToken(token)
      setUser(profile)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    if (accessToken) revokeAccessToken(accessToken)
    setAccessToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [accessToken])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      loading,
      accessToken,
      login,
      logout,
    }),
    [user, loading, accessToken, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
