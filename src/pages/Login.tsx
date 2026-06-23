import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Card, CardContent, Stack, Typography, useTheme } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import GoogleLoginButton from '@/components/GoogleLoginButton'
import { useAuth } from '@/auth/useAuth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      await login()
      navigate('/', { replace: true })
    } catch {
      setError('No se pudo iniciar sesión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100dvh',
        p: 2,
        bgcolor: isDark ? '#0f1015' : 'grey.100',
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          ...(isDark && {
            bgcolor: '#1a1c24',
            boxShadow: '0 0 0 1px #2e303a, 0 4px 24px rgba(0,0,0,0.4)',
          }),
        }}
        elevation={isDark ? 0 : 3}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3} sx={{ alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DashboardIcon fontSize="large" color="primary" />
              <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                Dashboard
              </Typography>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center' }}
            >
              Inicia sesión con tu cuenta de Google para continuar.
            </Typography>
            {error && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            )}
            <GoogleLoginButton onClick={handleLogin} loading={loading} />
            <Typography variant="caption" color="text.secondary">
              v{__APP_VERSION__}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
