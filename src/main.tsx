import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { AuthProvider } from '@/auth/AuthProvider'
import { theme } from '@/theme'
import App from '@/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* basename toma el `base` de Vite (/dashboard/) para que el routing
        funcione bajo la subruta de GitHub Pages */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
