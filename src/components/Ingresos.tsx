import { useCallback, useMemo, useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  Fade,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { addIngreso, deleteIngreso, loadIngresos } from '@/storage/ingresos'
import type { Ingreso } from '@/storage/ingresos'
import { useAutoSave } from '@/contexts/AutoSaveContext'
import { useNotifications } from '@/contexts/NotificationContext'

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(n)
}

function formatCOP(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return '$ ' + Number(digits).toLocaleString('es-CO')
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function toDateInput(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10)
}

export default function Ingresos() {
  const { triggerAutoSave } = useAutoSave()
  const { addNotification } = useNotifications()
  const [ingresos, setIngresos] = useState<Ingreso[]>(() => loadIngresos())
  const [montoRaw, setMontoRaw] = useState('')
  const [descripcion, setDescripcion] = useState('')

  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const [fromDate, setFromDate] = useState(toDateInput(firstOfMonth.toISOString()))
  const [toDate, setToDate] = useState(toDateInput(lastOfMonth.toISOString()))

  const [page, setPage] = useState(0)
  const rowsPerPage = 5

  const filtered = useMemo(() => {
    const from = new Date(fromDate)
    const to = new Date(toDate)
    to.setHours(23, 59, 59, 999)
    return ingresos
      .filter((i) => {
        const d = new Date(i.fecha)
        return d >= from && d <= to
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [ingresos, fromDate, toDate])

  const pageData = filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage)
  const total = filtered.reduce((sum, i) => sum + i.monto, 0)

  const handleAdd = useCallback(() => {
    const num = Number(montoRaw)
    if (!montoRaw || !descripcion.trim() || num <= 0) return
    const created = addIngreso({
      monto: num,
      descripcion: descripcion.trim(),
      fecha: new Date().toISOString(),
    })
    setIngresos((prev) => [...prev, created])
    setMontoRaw('')
    setDescripcion('')
    addNotification(`Ingreso registrado: ${formatCurrency(num)} - ${descripcion.trim()}`)
    triggerAutoSave()
  }, [montoRaw, descripcion, triggerAutoSave])

  const handleDelete = useCallback((id: string) => {
    const item = ingresos.find((i) => i.id === id)
    deleteIngreso(id)
    setIngresos((prev) => prev.filter((i) => i.id !== id))
    if (item) addNotification(`Ingreso eliminado: ${formatCurrency(item.monto)} - ${item.descripcion}`)
    triggerAutoSave()
  }, [ingresos, triggerAutoSave])

  return (
    <Stack spacing={2.5}>
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <AccountBalanceWalletIcon sx={{ fontSize: 40, opacity: 0.9 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Total ingresos del período
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {formatCurrency(total)}
          </Typography>
        </Box>
        <Chip
          label={`${filtered.length} registro${filtered.length !== 1 ? 's' : ''}`}
          size="small"
          sx={{
            color: 'inherit',
            borderColor: 'rgba(255,255,255,0.4)',
            border: 1,
            bgcolor: 'rgba(255,255,255,0.1)',
          }}
          variant="outlined"
        />
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
        <Stack spacing={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Nuevo ingreso
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="Monto"
              placeholder="$ 0"
              value={formatCOP(montoRaw)}
              onChange={(e) => setMontoRaw(e.target.value.replace(/\D/g, ''))}
              slotProps={{ htmlInput: { inputMode: 'numeric' } }}
              sx={{ width: 200 }}
            />
            <TextField
              size="small"
              label="Descripción"
              placeholder="Ej: Pago de nómina"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 220 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={!montoRaw || !descripcion.trim()}
              sx={{ height: 40 }}
            >
              Agregar
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Accordion
        sx={{
          borderRadius: 2,
          '&::before': { display: 'none' },
          border: 1,
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 48 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonthIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {fromDate} al {toDate}
            </Typography>
          </Box>
        </AccordionSummary>
        <Divider />
        <AccordionDetails sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="Desde"
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(0) }}
              slotProps={{ htmlInput: { max: toDate } }}
              sx={{ width: 180 }}
            />
            <TextField
              size="small"
              label="Hasta"
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(0) }}
              slotProps={{ htmlInput: { min: fromDate } }}
              sx={{ width: 180 }}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {filtered.length === 0 ? (
        <Fade in>
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <AccountBalanceWalletIcon
              sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }}
            />
            <Typography variant="body1" color="text.disabled">
              No hay ingresos en este período
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Agrega tu primer ingreso usando el formulario de arriba
            </Typography>
          </Box>
        </Fade>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Monto
                </TableCell>
                <TableCell sx={{ width: 40 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {pageData.map((i, idx) => (
                <TableRow
                  key={i.id}
                  hover
                  sx={{
                    '&:last-child td': { border: 0 },
                    bgcolor: idx % 2 === 0 ? undefined : 'action.hover',
                  }}
                >
                  <TableCell>
                    <Typography variant="body2">{formatDate(i.fecha)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{i.descripcion}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatCurrency(i.monto)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(i.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <TableCell sx={{ border: 0, color: 'inherit' }} />
                <TableCell sx={{ border: 0, color: 'inherit', fontWeight: 600 }}>
                  Total
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ border: 0, color: 'inherit', fontWeight: 700 }}
                >
                  {formatCurrency(total)}
                </TableCell>
                <TableCell sx={{ border: 0 }} />
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  count={filtered.length}
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
  )
}
