import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import SettingsIcon from '@mui/icons-material/Settings'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { useThemeMode } from '@/contexts/ThemeModeContext'

interface NavbarProps {
  title: string
  showBack?: boolean
}

export default function Navbar({ title, showBack = false }: Readonly<NavbarProps>) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { themeMode, toggleTheme } = useThemeMode()

  return (
    <AppBar position="static">
      <Toolbar>
        {showBack && (
          <Tooltip title="Volver">
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => navigate('/')}
              aria-label="Volver"
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Inicio">
          <IconButton
            color="inherit"
            edge={showBack ? false : 'start'}
            onClick={() => navigate('/')}
            aria-label="Inicio"
            sx={{ mr: 1 }}
          >
            <HomeIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexGrow: 1 }}>
          <Typography variant="h6" component="div">
            {title}
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
        <Tooltip title={themeMode === 'light' ? 'Modo oscuro' : 'Modo claro'}>
          <IconButton color="inherit" onClick={toggleTheme} aria-label="Cambiar tema">
            {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>
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
  )
}
