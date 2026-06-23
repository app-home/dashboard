import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthProvider'
import { ThemeModeProvider } from '@/contexts/ThemeModeProvider'
import { NotificationProvider } from '@/contexts/NotificationContext'
import App from '@/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* basename toma el `base` de Vite (/dashboard/) para que el routing
        funcione bajo la subruta de GitHub Pages */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeModeProvider>
        <AuthProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </AuthProvider>
      </ThemeModeProvider>
    </BrowserRouter>
  </StrictMode>,
)
