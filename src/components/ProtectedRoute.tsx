import { Navigate, Outlet } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '@/auth/useAuth'

/**
 * Envuelve rutas que requieren sesión. Si no hay usuario autenticado,
 * redirige a /login. Base para las rutas protegidas del MVP.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
