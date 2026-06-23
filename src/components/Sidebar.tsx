import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import SettingsIcon from '@mui/icons-material/Settings'
import HomeIcon from '@mui/icons-material/Home'
import NotificationsIcon from '@mui/icons-material/Notifications'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import LogoutIcon from '@mui/icons-material/Logout'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { useConfig } from '@/storage/useConfig'
import type { MenuItem } from '@/storage/driveConfig'

const ICON_MAP = {
  dashboard: DashboardIcon,
  settings: SettingsIcon,
  home: HomeIcon,
  notifications: NotificationsIcon,
  finanzas: AccountBalanceIcon,
} as const

function canAccess(item: MenuItem, userRole: string, userPermissions: string[]): boolean {
  if (!item.roles?.length && !item.permissions?.length) return true
  if (item.roles?.length && item.roles.includes(userRole)) return true
  if (item.permissions?.length && item.permissions.some((p) => userPermissions.includes(p))) return true
  return false
}

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const DRAWER_WIDTH = 240

export default function Sidebar({ open, onClose }: Readonly<SidebarProps>) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, accessToken, logout } = useAuth()
  const { config } = useConfig(accessToken)

  const menu = config.settings.menu

  const handleNavigate = (path: string) => {
    navigate(path)
    onClose()
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Dashboard
        </Typography>
      </Toolbar>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
          <List>
            {menu
              .filter((item) => canAccess(item, user?.role ?? 'user', user?.permissions ?? []))
              .map((item) => {
                const Icon = ICON_MAP[item.icon]
                const isActive = location.pathname === item.path
                return (
                  <ListItemButton
                    key={item.id}
                    selected={isActive}
                    onClick={() => handleNavigate(item.path)}
                  >
                    {Icon && (
                      <ListItemIcon>
                        <Icon color={isActive ? 'primary' : 'inherit'} />
                      </ListItemIcon>
                    )}
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                )
              })}
          </List>
        </Box>
        <Divider />
        <List sx={{ flexShrink: 0 }}>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Cerrar sesión" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  )
}
