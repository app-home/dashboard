import { Button, CircularProgress } from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'

interface GoogleLoginButtonProps {
  onClick: () => void
  loading?: boolean
  disabled?: boolean
}

/**
 * Botón "Iniciar sesión con Google" con estados de carga y deshabilitado.
 * La lógica real de autenticación se conecta vía la prop onClick (issue #4).
 */
export default function GoogleLoginButton({
  onClick,
  loading = false,
  disabled = false,
}: GoogleLoginButtonProps) {
  return (
    <Button
      variant="outlined"
      size="large"
      fullWidth
      onClick={onClick}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
      sx={{ textTransform: 'none' }}
    >
      {loading ? 'Iniciando sesión…' : 'Iniciar sesión con Google'}
    </Button>
  )
}
