import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import RefreshIcon from '@mui/icons-material/Refresh'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { useConfig } from '@/storage/useConfig'

/** Formatea una fecha ISO; muestra un texto alterno si no hay valor. */
function formatDate(iso: string | null, empty: string): string {
  if (!iso) return empty
  const date = new Date(iso)
  if (date.getTime() === 0) return empty
  return date.toLocaleString()
}

/**
 * Vista de configuración: estado de la sesión y sincronización de los
 * ajustes del usuario con su Google Drive (carpeta privada de la app).
 */
export default function Settings() {
  const navigate = useNavigate()
  const { lastLoginAt } = useAuth()
  const { config, syncing, error, saveToDrive, loadFromDrive } = useConfig()

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
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
          <Typography variant="h6" component="div">
            Configuración
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Card sx={{ maxWidth: 520 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" component="h2">
                Estado
              </Typography>

              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Último inicio de sesión
                </Typography>
                <Typography variant="body1">
                  {formatDate(lastLoginAt, 'Sin registro')}
                </Typography>
              </Stack>

              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Última actualización de la configuración
                </Typography>
                <Typography variant="body1">
                  {formatDate(config.updatedAt, 'Sin sincronizar')}
                </Typography>
              </Stack>

              <Divider />

              <Typography variant="body2" color="text.secondary">
                Tu configuración se guarda en tu Google Drive y se sincroniza
                entre tus dispositivos. Usa «Actualizar ahora» para traer los
                cambios hechos en otro dispositivo.
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
      </Container>
    </Box>
  )
}
