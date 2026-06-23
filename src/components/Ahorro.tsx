import { useCallback, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import SavingsIcon from '@mui/icons-material/Savings'
import FlagIcon from '@mui/icons-material/Flag'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { addMeta, aportar, deleteMeta, loadMetas } from '@/storage/ahorros'
import type { MetaAhorro } from '@/storage/ahorros'
import { useAutoSave } from '@/contexts/AutoSaveContext'
import { useNotifications } from '@/contexts/NotificationContext'

const ICONOS = ['💰', '🏖️', '🏠', '🚗', '🎓', '🏥', '🎯', '💎', '🛒', '✈️']

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)
}

export default function Ahorro() {
  const { triggerAutoSave } = useAutoSave()
  const { addNotification } = useNotifications()
  const [metas, setMetas] = useState<MetaAhorro[]>(() => loadMetas())
  const [dialogo, setDialogo] = useState<{ abierto: boolean; metaId: string; titulo: string }>({ abierto: false, metaId: '', titulo: '' })
  const [aporteRaw, setAporteRaw] = useState('')

  const [nuevaTitulo, setNuevaTitulo] = useState('')
  const [nuevaMeta, setNuevaMeta] = useState('')
  const [nuevaFechaLimite, setNuevaFechaLimite] = useState('')
  const [nuevaIcono, setNuevaIcono] = useState(ICONOS[0])
  const [showForm, setShowForm] = useState(false)

  const totalAhorrado = metas.reduce((s, m) => s + m.ahorrado, 0)
  const totalMeta = metas.reduce((s, m) => s + m.meta, 0)
  const progresoGlobal = totalMeta > 0 ? (totalAhorrado / totalMeta) * 100 : 0

  const handleAdd = useCallback(() => {
    if (!nuevaTitulo.trim() || !nuevaMeta || Number(nuevaMeta) <= 0) return
    addMeta({
      titulo: nuevaTitulo.trim(),
      meta: Number(nuevaMeta),
      ahorrado: 0,
      fechaLimite: nuevaFechaLimite || null,
      icono: nuevaIcono,
    })
    setMetas(loadMetas())
    setNuevaTitulo('')
    setNuevaMeta('')
    setNuevaFechaLimite('')
    setNuevaIcono(ICONOS[0])
    setShowForm(false)
    addNotification(`Nueva meta de ahorro: ${nuevaTitulo.trim()}`)
    triggerAutoSave()
  }, [nuevaTitulo, nuevaMeta, nuevaFechaLimite, nuevaIcono, triggerAutoSave])

  const handleDelete = useCallback((id: string) => {
    const meta = metas.find((m) => m.id === id)
    deleteMeta(id)
    setMetas(loadMetas())
    if (meta) addNotification(`Meta de ahorro eliminada: ${meta.titulo}`)
    triggerAutoSave()
  }, [metas, triggerAutoSave])

  const handleAportar = useCallback(() => {
    const monto = Number(aporteRaw)
    if (!aporteRaw || monto <= 0) return
    setMetas(aportar(dialogo.metaId, monto))
    addNotification(`Aporte de ${formatCurrency(monto)} a meta: ${dialogo.titulo}`)
    setAporteRaw('')
    setDialogo({ abierto: false, metaId: '', titulo: '' })
    triggerAutoSave()
  }, [aporteRaw, dialogo.metaId, dialogo.titulo, triggerAutoSave])

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: 'success.main', color: 'success.contrastText' }}>
          <Stack spacing={0.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SavingsIcon fontSize="small" />
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Total ahorrado</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatCurrency(totalAhorrado)}</Typography>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Stack spacing={0.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FlagIcon fontSize="small" />
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Meta total</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatCurrency(totalMeta)}</Typography>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon fontSize="small" color="primary" />
              <Typography variant="caption" color="text.secondary">Progreso global</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{progresoGlobal.toFixed(1)}%</Typography>
            <LinearProgress variant="determinate" value={Math.min(progresoGlobal, 100)} sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 4 } }} />
          </Stack>
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant={showForm ? 'outlined' : 'contained'} startIcon={<AddIcon />} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Nueva meta'}
        </Button>
      </Box>

      {showForm && (
        <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Nueva meta de ahorro</Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flexWrap: 'wrap' }}>
              <TextField size="small" label="Título" placeholder="Viaje a Europa" value={nuevaTitulo} onChange={(e) => setNuevaTitulo(e.target.value)} sx={{ flexGrow: 1, minWidth: 200 }} />
              <TextField size="small" label="Meta" placeholder="$ 0" value={nuevaMeta.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')} onChange={(e) => setNuevaMeta(e.target.value.replace(/\./g, ''))} slotProps={{ htmlInput: { inputMode: 'numeric' } }} sx={{ width: 180 }} />
              <TextField size="small" label="Fecha límite" type="date" value={nuevaFechaLimite} onChange={(e) => setNuevaFechaLimite(e.target.value)} sx={{ width: 180 }} />
              <TextField size="small" label="Icono" select value={nuevaIcono} onChange={(e) => setNuevaIcono(e.target.value)} slotProps={{ select: { native: true } }} sx={{ width: 120 }}>
                {ICONOS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
              </TextField>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} disabled={!nuevaTitulo.trim() || !nuevaMeta} sx={{ height: 40 }}>Crear</Button>
            </Box>
          </Stack>
        </Paper>
      )}

      {metas.length === 0 ? (
        <Fade in>
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <SavingsIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
            <Typography variant="body1" color="text.disabled">No hay metas de ahorro</Typography>
            <Typography variant="caption" color="text.disabled">Crea tu primera meta para empezar a ahorrar</Typography>
          </Box>
        </Fade>
      ) : (
        metas.map((m) => {
          const pct = m.meta > 0 ? (m.ahorrado / m.meta) * 100 : 0
          const diasRest = m.fechaLimite ? Math.ceil((new Date(m.fechaLimite).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
          return (
            <Paper key={m.id} variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {m.icono} {m.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(m.ahorrado)} / {formatCurrency(m.meta)}
                    </Typography>
                  </Stack>
                  <IconButton size="small" color="error" onClick={() => handleDelete(m.id)}><DeleteIcon /></IconButton>
                </Box>

                <LinearProgress variant="determinate" value={Math.min(pct, 100)} sx={{ height: 10, borderRadius: 5, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 5, bgcolor: pct >= 100 ? 'success.main' : 'primary.main' } }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {pct.toFixed(1)}% completado
                    {diasRest !== null && ` · ${diasRest <= 0 ? 'Fecha límite alcanzada' : `${diasRest} días restantes`}`}
                  </Typography>
                  <Button size="small" variant="outlined" onClick={() => { setDialogo({ abierto: true, metaId: m.id, titulo: m.titulo }); setAporteRaw('') }}>
                    Aportar
                  </Button>
                </Box>
              </Stack>
            </Paper>
          )
        })
      )}

      <Dialog open={dialogo.abierto} onClose={() => setDialogo({ abierto: false, metaId: '', titulo: '' })}>
        <DialogTitle>Aportar a {dialogo.titulo}</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth margin="dense" label="Monto a aportar" placeholder="$ 0" value={aporteRaw.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')} onChange={(e) => setAporteRaw(e.target.value.replace(/\./g, ''))} slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogo({ abierto: false, metaId: '', titulo: '' })}>Cancelar</Button>
          <Button variant="contained" onClick={handleAportar} disabled={!aporteRaw || Number(aporteRaw) <= 0}>Aportar</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
