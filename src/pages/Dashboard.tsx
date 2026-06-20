import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'

/**
 * Página protegida de ejemplo. Solo accesible con sesión iniciada.
 */
export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Box
            sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexGrow: 1 }}
          >
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
          <Tooltip title="Configuración">
            <IconButton
              color="inherit"
              onClick={() => navigate('/settings')}
              aria-label="Configuración"
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
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
