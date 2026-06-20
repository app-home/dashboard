import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from '@/auth/context'
import type { AuthUser } from '@/auth/context'

const STORAGE_KEY = 'dashboard.auth.user'

/** Lee la sesión guardada (base para la persistencia real de GIS en el #4). */
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
  // Inicialización perezosa: restaura la sesión de forma síncrona al montar.
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)

  const login = useCallback(async () => {
    // SIMULADO: en el issue #4 esto se reemplaza por el flujo real de GIS.
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const mockUser: AuthUser = {
      name: 'Usuario de prueba',
      email: 'usuario@example.com',
    }
    setUser(mockUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      // La restauración es síncrona por ahora; el #4 (GIS asíncrono) lo usará.
      loading: false,
      login,
      logout,
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
