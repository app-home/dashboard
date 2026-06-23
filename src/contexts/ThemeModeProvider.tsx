import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { createAppTheme } from '@/theme'
import { loadLocalConfig, saveLocalConfig } from '@/storage/driveConfig'
import { ThemeModeContext } from '@/contexts/ThemeModeContext'

type ThemeMode = 'light' | 'dark'

export function ThemeModeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [mode, setMode] = useState<ThemeMode>(
    () => loadLocalConfig().settings.themeMode,
  )

  const setThemeMode = useCallback((next: ThemeMode) => {
    setMode(next)
    const config = loadLocalConfig()
    saveLocalConfig({ ...config, settings: { ...config.settings, themeMode: next } })
  }, [])

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next: ThemeMode = prev === 'light' ? 'dark' : 'light'
      const config = loadLocalConfig()
      saveLocalConfig({ ...config, settings: { ...config.settings, themeMode: next } })
      return next
    })
  }, [])

  const theme = useMemo(() => createAppTheme(mode), [mode])

  const value = useMemo(
    () => ({ themeMode: mode, toggleTheme, setThemeMode }),
    [mode, toggleTheme, setThemeMode],
  )

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}
