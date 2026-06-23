import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface TypeBackground {
    level2: string
  }
}

export function createAppTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: { main: '#1976d2' },
      ...(isDark && {
        background: {
          default: '#0f1015',
          paper: '#1a1c24',
          level2: '#23262e',
        },
      }),
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            ...(isDark && {
              border: '1px solid #2e303a',
              backgroundImage: 'none',
            }),
          },
        },
      },
    },
  })
}
