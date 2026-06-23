import { createContext, useContext } from 'react'

export interface ThemeModeContextValue {
  themeMode: 'light' | 'dark'
  toggleTheme: () => void
  setThemeMode: (mode: 'light' | 'dark') => void
}

export const ThemeModeContext = createContext<ThemeModeContextValue | null>(null)

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext)
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider')
  return ctx
}
