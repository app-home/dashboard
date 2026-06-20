import { createContext } from 'react'

export interface AuthUser {
  name: string
  email: string
  picture?: string
}

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  /** true mientras se restaura la sesión inicial */
  loading: boolean
  /** Inicia sesión. SIMULADO en el issue #3; se reemplaza por GIS en el #4. */
  login: () => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
