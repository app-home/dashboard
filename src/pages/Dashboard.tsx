import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from '@mui/material'
import { useAuth } from '@/auth/useAuth'

/**
 * Página protegida de ejemplo. Solo accesible con sesión iniciada.
 * Su contenido real se desarrollará en issues posteriores.
 */
export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              Dashboard
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              v{__APP_VERSION__}
            </Typography>
          </Box>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
              <Avatar src={user.picture} sx={{ width: 32, height: 32 }}>
                {user.name.charAt(0)}
              </Avatar>
              <Typography variant="body2">{user.name}</Typography>
            </Box>
          )}
          <Button color="inherit" onClick={logout}>
            Cerrar sesión
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bienvenido{user ? `, ${user.name}` : ''}
        </Typography>
        <Typography color="text.secondary">
          Esta es una página protegida de ejemplo.
        </Typography>
      </Container>
    </Box>
  )
}
