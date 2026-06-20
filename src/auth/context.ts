import { createContext } from 'react'

export interface AuthUser {
  name: string
  email: string
  picture?: string
}

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  /** true mientras se procesa el inicio de sesión */
  loading: boolean
  /** Access token de Google (en memoria). Base para acceder a Drive (issue #5). */
  accessToken: string | null
  /** Inicia sesión con Google Identity Services. */
  login: () => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
