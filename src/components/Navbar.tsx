import { useState } from 'react'
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Popover,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import SettingsIcon from '@mui/icons-material/Settings'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { useThemeMode } from '@/contexts/ThemeModeContext'
import { useNotifications } from '@/contexts/NotificationContext'

interface NavbarProps {
  title: string
  onMenuClick: () => void
}

export default function Navbar({ title, onMenuClick }: Readonly<NavbarProps>) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { themeMode, toggleTheme } = useThemeMode()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null)

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(e.currentTarget)
  }

  return (
    <>
      <AppBar position="static">
      <Toolbar>
        <Tooltip title="Menú">
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            aria-label="Abrir menú"
            sx={{ mr: 1 }}
          >
            <MenuIcon />
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
        <Tooltip title="Notificaciones">
          <IconButton
            color="inherit"
            onClick={handleOpen}
            aria-label="Notificaciones"
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Popover
          open={Boolean(notifAnchor)}
          anchorEl={notifAnchor}
          onClose={() => setNotifAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { width: 320, maxHeight: 400 } } }}
        >
          <List dense disablePadding>
            {notifications.length === 0 ? (
              <ListItem>
                <ListItemText primary="Sin notificaciones" />
              </ListItem>
            ) : (
              notifications.slice(0, 3).map((n) => (
                <ListItem
                  key={n.id}
                  disablePadding
                  secondaryAction={
                    !n.read && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          mr: 1,
                        }}
                      />
                    )
                  }
                >
                  <ListItemButton
                    onClick={() => markAsRead(n.id)}
                    sx={{ bgcolor: n.read ? undefined : 'action.hover' }}
                  >
                    <ListItemText
                      primary={n.message}
                      secondary={new Date(n.createdAt).toLocaleString()}
                      slotProps={{
                        primary: { sx: { fontWeight: n.read ? 400 : 700 } },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
          <Divider />
          <Box sx={{ p: 1 }}>
            <Button
              size="small"
              fullWidth
              onClick={() => {
                setNotifAnchor(null)
                navigate('/notifications')
              }}
            >
              Ver todas
            </Button>
          </Box>
        </Popover>
      </Toolbar>
    </AppBar>
    </>
  )
}
