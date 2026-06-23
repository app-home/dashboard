import { useCallback, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
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
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { addInversion, deleteInversion, diasRestantes, fechaVencimiento, loadInversiones, rendimientoEstimado } from '@/storage/inversiones'
import type { Inversion, TipoInversion, EstadoInversion } from '@/storage/inversiones'
import { useAutoSave } from '@/contexts/AutoSaveContext'
import { useNotifications } from '@/contexts/NotificationContext'

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

const TIPOS: TipoInversion[] = ['CDT', 'Fondo', 'Acciones', 'Otro']
const ESTADOS: EstadoInversion[] = ['activo', 'vencido', 'cancelado']

export default function Inversiones() {
  const { triggerAutoSave } = useAutoSave()
  const { addNotification } = useNotifications()
  const [items, setItems] = useState<Inversion[]>(() => loadInversiones())
  const [page, setPage] = useState(0)
  const rowsPerPage = 5

  const [tipo, setTipo] = useState<TipoInversion>('CDT')
  const [nombre, setNombre] = useState('')
  const [entidad, setEntidad] = useState('')
  const [montoRaw, setMontoRaw] = useState('')
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().slice(0, 10))
  const [plazo, setPlazo] = useState('')
  const [tasaInteres, setTasaInteres] = useState('')
  const [estado, setEstado] = useState<EstadoInversion>('activo')

  const activos = items.filter((i) => i.estado === 'activo')
  const totalActivo = activos.reduce((s, i) => s + i.monto, 0)
  const rendimientoTotal = items.reduce((s, i) => s + rendimientoEstimado(i), 0)

  const proxVencimiento = useMemo(() => {
    const conFecha = activos
      .map((i) => ({ item: i, venc: fechaVencimiento(i) }))
      .filter((x) => x.venc && x.venc > new Date())
      .sort((a, b) => a.venc!.getTime() - b.venc!.getTime())
    return conFecha[0] ?? null
  }, [activos])

  const pageData = items.slice(page * rowsPerPage, (page + 1) * rowsPerPage)

  const handleAdd = useCallback(() => {
    const monto = Number(montoRaw)
    if (!nombre.trim() || !entidad.trim() || !montoRaw || monto <= 0) return
    if (tipo === 'CDT' && (!plazo || Number(plazo) <= 0)) return
    addInversion({
      tipo,
      nombre: nombre.trim(),
      entidad: entidad.trim(),
      monto,
      fechaInicio: new Date(fechaInicio).toISOString(),
      plazo: tipo === 'CDT' ? Number(plazo) : 0,
      tasaInteres: Number(tasaInteres) || 0,
      estado,
    })
    setItems(loadInversiones())
    setNombre('')
    setEntidad('')
    setMontoRaw('')
    setPlazo('')
    setTasaInteres('')
    setEstado('activo')
    setTipo('CDT')
    setFechaInicio(new Date().toISOString().slice(0, 10))
    setPage(0)
    addNotification(`Inversión registrada: ${nombre.trim()} - ${entidad.trim()} (${formatCurrency(monto)})`)
    triggerAutoSave()
  }, [nombre, entidad, montoRaw, tipo, plazo, tasaInteres, estado, fechaInicio, triggerAutoSave])

  const handleDelete = useCallback((id: string) => {
    const item = items.find((i) => i.id === id)
    deleteInversion(id)
    setItems(loadInversiones())
    if (item) addNotification(`Inversión eliminada: ${item.nombre} - ${item.entidad}`)
    triggerAutoSave()
  }, [items, triggerAutoSave])

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Stack spacing={0.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceIcon fontSize="small" />
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Total invertido</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatCurrency(totalActivo)}</Typography>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: 'success.main', color: 'success.contrastText' }}>
          <Stack spacing={0.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon fontSize="small" />
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Rendimiento estimado</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatCurrency(rendimientoTotal)}</Typography>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: 'warning.main', color: 'warning.contrastText' }}>
          <Stack spacing={0.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarMonthIcon fontSize="small" />
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Próximo vencimiento</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
              {proxVencimiento ? formatDate(proxVencimiento.venc!.toISOString()) : 'Sin CDTs'}
            </Typography>
          </Stack>
        </Paper>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
        <Stack spacing={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Nueva inversión</Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField size="small" label="Tipo" select value={tipo} onChange={(e) => setTipo(e.target.value as TipoInversion)} slotProps={{ select: { native: true } }} sx={{ width: 140 }}>
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </TextField>
            <TextField size="small" label="Nombre" placeholder="CDT Bancolombia" value={nombre} onChange={(e) => setNombre(e.target.value)} sx={{ flexGrow: 1, minWidth: 180 }} />
            <TextField size="small" label="Entidad" placeholder="Bancolombia" value={entidad} onChange={(e) => setEntidad(e.target.value)} sx={{ width: 180 }} />
            <TextField size="small" label="Monto" placeholder="$ 0" value={montoRaw.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')} onChange={(e) => setMontoRaw(e.target.value.replace(/\./g, ''))} slotProps={{ htmlInput: { inputMode: 'numeric' } }} sx={{ width: 180 }} />
            <TextField size="small" label="Fecha inicio" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} sx={{ width: 180 }} />
            {tipo === 'CDT' && (
              <TextField size="small" label="Plazo (días)" type="number" value={plazo} onChange={(e) => setPlazo(e.target.value)} sx={{ width: 140 }} />
            )}
            <TextField size="small" label="Tasa % anual" type="number" value={tasaInteres} onChange={(e) => setTasaInteres(e.target.value)} slotProps={{ htmlInput: { step: 0.1 } }} sx={{ width: 140 }} />
            <TextField size="small" label="Estado" select value={estado} onChange={(e) => setEstado(e.target.value as EstadoInversion)} slotProps={{ select: { native: true } }} sx={{ width: 130 }}>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </TextField>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} disabled={!nombre.trim() || !entidad.trim() || !montoRaw} sx={{ height: 40 }}>Agregar</Button>
          </Box>
        </Stack>
      </Paper>

      {items.length === 0 ? (
        <Fade in>
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <AccountBalanceIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
            <Typography variant="body1" color="text.disabled">No hay inversiones registradas</Typography>
            <Typography variant="caption" color="text.disabled">Agrega tu primera inversión usando el formulario de arriba</Typography>
          </Box>
        </Fade>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Entidad</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Monto</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Inicio</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Vencimiento</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Tasa</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ width: 40 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {pageData.map((inv, idx) => {
                const venc = fechaVencimiento(inv)
                const rest = inv.estado === 'activo' && venc ? diasRestantes(inv) : null
                return (
                  <TableRow key={inv.id} hover sx={{ bgcolor: idx % 2 === 0 ? undefined : 'action.hover', '&:last-child td': { border: 0 } }}>
                    <TableCell><Typography variant="body2">{inv.nombre}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{inv.entidad}</Typography></TableCell>
                    <TableCell><Chip label={inv.tipo} size="small" variant="outlined" /></TableCell>
                    <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(inv.monto)}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{formatDate(inv.fechaInicio)}</Typography></TableCell>
                    <TableCell>
                      {venc ? (
                        <Stack spacing={0}>
                          <Typography variant="caption">{formatDate(venc.toISOString())}</Typography>
                          {rest !== null && (
                            <Chip label={rest <= 0 ? 'Vence hoy' : `${rest} días`} size="small" color={rest <= 7 ? 'error' : rest <= 30 ? 'warning' : 'default'} sx={{ height: 18, fontSize: 11 }} />
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right"><Typography variant="body2">{inv.tasaInteres > 0 ? `${inv.tasaInteres}%` : '—'}</Typography></TableCell>
                    <TableCell>
                      <Chip label={inv.estado} size="small" color={inv.estado === 'activo' ? 'success' : inv.estado === 'vencido' ? 'default' : 'error'} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleDelete(inv.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination count={items.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} rowsPerPageOptions={[rowsPerPage]} labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`} />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}
    </Stack>
  )
}
