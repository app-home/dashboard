import { Container, Typography } from '@mui/material'
import { useAuth } from '@/auth/useAuth'

/**
 * Página protegida de ejemplo. Solo accesible con sesión iniciada.
 */
export default function Dashboard() {
  const { user } = useAuth()

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Bienvenido{user ? `, ${user.name}` : ''}
      </Typography>
      <Typography color="text.secondary">
        Esta es una página protegida de ejemplo.
      </Typography>
    </Container>
  )
}
