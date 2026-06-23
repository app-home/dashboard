import { createContext } from 'react'

export interface AuthUser {
  name: string
  email: string
  picture?: string
  role: string
  permissions: string[]
}

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  /** true mientras se procesa el inicio de sesión */
  loading: boolean
  /** Access token de Google (en memoria). Base para acceder a Drive (issue #5). */
  accessToken: string | null
  /** Fecha ISO del último inicio de sesión (persistida por dispositivo). */
  lastLoginAt: string | null
  /** Inicia sesión con Google Identity Services. */
  login: () => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
