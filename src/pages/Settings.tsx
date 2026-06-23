import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import RefreshIcon from '@mui/icons-material/Refresh'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import LoginIcon from '@mui/icons-material/Login'
import StorageIcon from '@mui/icons-material/Storage'
import PersonIcon from '@mui/icons-material/Person'
import KeyIcon from '@mui/icons-material/Key'
import GroupIcon from '@mui/icons-material/Group'
import { useAuth } from '@/auth/useAuth'
import { useConfig } from '@/storage/useConfig'
import type { MenuItem, UserRole } from '@/storage/driveConfig'

const ICON_OPTIONS = ['dashboard', 'settings', 'home', 'notifications', 'finanzas'] as const

const AVAILABLE_PERMISSIONS = [
  { id: 'users.manage', label: 'Administrar usuarios' },
  { id: 'settings.view', label: 'Ver configuración' },
]

/** Formatea una fecha ISO; muestra un texto alterno si no hay valor. */
function formatDate(iso: string | null, empty: string): string {
  if (!iso) return empty
  const date = new Date(iso)
  if (date.getTime() === 0) return empty
  return date.toLocaleString()
}

/**
 * Vista de configuración: estado de la sesión, sincronización con Drive
 * y gestión del menú lateral.
 */
export default function Settings() {
  const { user, lastLoginAt, accessToken } = useAuth()
  const { config, syncing, error, updateSettings, saveToDrive, loadFromDrive } =
    useConfig(accessToken)

  const menu = config.settings.menu

  const users = config.settings.users

  const [newUser, setNewUser] = useState({ email: '', role: 'user', permissions: [] as string[] })

  const handleAddUser = () => {
    if (!newUser.email.trim()) return
    const entry: UserRole = {
      email: newUser.email.trim(),
      role: newUser.role.trim() || 'user',
      permissions: newUser.permissions,
    }
    updateSettings({ users: [...users.filter((u) => u.email !== entry.email), entry] })
    setNewUser({ email: '', role: 'user', permissions: [] })
  }

  const togglePermission = (perm: string) => {
    setNewUser((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }))
  }

  const handleRemoveUser = (email: string) => {
    updateSettings({ users: users.filter((u) => u.email !== email) })
  }

  const [newItem, setNewItem] = useState({ id: '', label: '', icon: 'dashboard' as MenuItem['icon'], path: '', roles: '', permissions: '' })

  const handleAddItem = () => {
    if (!newItem.id.trim() || !newItem.label.trim() || !newItem.path.trim()) return
    const item: MenuItem = {
      id: newItem.id.trim(),
      label: newItem.label.trim(),
      icon: newItem.icon,
      path: newItem.path.trim(),
      roles: newItem.roles ? newItem.roles.split(',').map((r) => r.trim()).filter(Boolean) : undefined,
      permissions: newItem.permissions ? newItem.permissions.split(',').map((p) => p.trim()).filter(Boolean) : undefined,
    }
    updateSettings({ menu: [...menu, item] })
    setNewItem({ id: '', label: '', icon: 'dashboard', path: '', roles: '', permissions: '' })
  }

  const handleRemoveItem = (id: string) => {
    updateSettings({ menu: menu.filter((item) => item.id !== id) })
  }

  const handleMoveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= menu.length) return
    const next = [...menu]
    ;[next[index], next[target]] = [next[target], next[index]]
    updateSettings({ menu: next })
  }

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={3} sx={{ maxWidth: 600, mx: 'auto' }}>
        <Card>
          <CardContent>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <StorageIcon fontSize="small" />
              </Box>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                Estado
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                }}
              >
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LoginIcon fontSize="small" color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      Último inicio de sesión
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDate(lastLoginAt, 'Sin registro')}
                  </Typography>
                </Stack>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                }}
              >
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StorageIcon fontSize="small" color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      Última actualización
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDate(config.updatedAt, 'Sin sincronizar')}
                  </Typography>
                </Stack>
              </Box>

              {user && (
                <>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" color="primary" />
                        <Typography variant="body2" color="text.secondary">
                          Rol
                        </Typography>
                      </Box>
                      <Chip
                        label={user.role}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ width: 'fit-content', textTransform: 'capitalize' }}
                      />
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <KeyIcon fontSize="small" color="primary" />
                        <Typography variant="body2" color="text.secondary">
                          Permisos
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {user.permissions.length > 0
                          ? user.permissions.map((p) => (
                              <Chip key={p} label={p} size="small" variant="outlined" />
                            ))
                          : <Typography variant="body2" color="text.disabled">Ninguno</Typography>
                        }
                      </Box>
                    </Stack>
                  </Box>
                </>
              )}
            </Box>

            <Divider />

            <Typography variant="body2" color="text.secondary">
              Tu configuración se guarda en tu Google Drive y se sincroniza
              entre tus dispositivos.
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={loadFromDrive}
                disabled={syncing}
              >
                Actualizar ahora
              </Button>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={saveToDrive}
                disabled={syncing}
              >
                Guardar en Drive
              </Button>
            </Stack>
          </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" component="h2">
                Menú lateral
              </Typography>

              {menu.map((item, index) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Stack direction="column" spacing={0}>
                    <IconButton size="small" onClick={() => handleMoveItem(index, -1)} disabled={index === 0}>
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleMoveItem(index, 1)} disabled={index === menu.length - 1}>
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      /{item.path.replace(/^\//, '')} &middot; {item.icon}
                      {item.permissions?.length ? ` · ${item.permissions.join(', ')}` : ''}
                    </Typography>
                  </Box>
                  <IconButton color="error" onClick={() => handleRemoveItem(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}

              <Divider />

              <Typography variant="subtitle2">Agregar item</Typography>

              <Stack spacing={1.5}>
                <TextField
                  size="small"
                  label="ID"
                  value={newItem.id}
                  onChange={(e) => setNewItem({ ...newItem, id: e.target.value })}
                />
                <TextField
                  size="small"
                  label="Etiqueta"
                  value={newItem.label}
                  onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                />
                <TextField
                  size="small"
                  label="Ruta"
                  placeholder="/mi-ruta"
                  value={newItem.path}
                  onChange={(e) => setNewItem({ ...newItem, path: e.target.value })}
                />
                <TextField
                  size="small"
                  label="Icono"
                  select
                  value={newItem.icon}
                  onChange={(e) => setNewItem({ ...newItem, icon: e.target.value as MenuItem['icon'] })}
                  slotProps={{ select: { native: true } }}
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </TextField>
                <TextField
                  size="small"
                  label="Roles (separados por coma)"
                  value={newItem.roles}
                  onChange={(e) => setNewItem({ ...newItem, roles: e.target.value })}
                />
                <TextField
                  size="small"
                  label="Permisos (separados por coma)"
                  value={newItem.permissions}
                  onChange={(e) => setNewItem({ ...newItem, permissions: e.target.value })}
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                  disabled={!newItem.id.trim() || !newItem.label.trim() || !newItem.path.trim()}
                >
                  Agregar
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {user?.permissions.includes('users.manage') && (
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <GroupIcon fontSize="small" />
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    Usuarios
                  </Typography>
                </Box>

                {users.map((u) => (
                  <Box
                    key={u.email}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {u.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {u.role}
                        {u.permissions.length > 0 && ` · ${u.permissions.join(', ')}`}
                      </Typography>
                    </Box>
                    <IconButton color="error" onClick={() => handleRemoveUser(u.email)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}

                <Divider />

                <Typography variant="subtitle2">Agregar usuario</Typography>

                <Stack spacing={1.5}>
                  <TextField
                    size="small"
                    label="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                  <TextField
                    size="small"
                    label="Rol"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  />
                  <FormGroup>
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <FormControlLabel
                        key={perm.id}
                        control={
                          <Checkbox
                            size="small"
                            checked={newUser.permissions.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                          />
                        }
                        label={
                          <Typography variant="body2">{perm.label}</Typography>
                        }
                      />
                    ))}
                  </FormGroup>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddUser}
                    disabled={!newUser.email.trim()}
                  >
                    Agregar
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Container>
  )
}
