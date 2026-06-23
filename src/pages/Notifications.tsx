import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { useNotifications } from '@/contexts/NotificationContext'

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [page, setPage] = useState(0)
  const rowsPerPage = 10
  const pageData = notifications.slice(page * rowsPerPage, (page + 1) * rowsPerPage)

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={3} sx={{ maxWidth: 800, mx: 'auto' }}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
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
                    <NotificationsIcon fontSize="small" />
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    Notificaciones
                  </Typography>
                  {unreadCount > 0 && (
                    <Chip label={`${unreadCount} sin leer`} size="small" color="primary" />
                  )}
                </Box>
                {unreadCount > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DoneAllIcon />}
                    onClick={markAllAsRead}
                  >
                    Marcar todas leídas
                  </Button>
                )}
              </Box>

              {notifications.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No hay notificaciones
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Mensaje</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">
                          Acción
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pageData.map((n) => (
                        <TableRow
                          key={n.id}
                          sx={{ opacity: n.read ? 0.6 : 1 }}
                        >
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: n.read ? 400 : 600 }}
                            >
                              {n.message}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(n.createdAt).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={n.read ? 'Leída' : 'No leída'}
                              size="small"
                              color={n.read ? 'default' : 'primary'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {!n.read && (
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => markAsRead(n.id)}
                                aria-label="Marcar como leída"
                              >
                                <MarkEmailReadIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          count={notifications.length}
                          page={page}
                          onPageChange={(_, p) => setPage(p)}
                          rowsPerPage={rowsPerPage}
                          rowsPerPageOptions={[rowsPerPage]}
                          labelDisplayedRows={({ from, to, count }) =>
                            `${from}–${to} de ${count}`
                          }
                        />
                      </TableRow>
                    </TableFooter>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  )
}
