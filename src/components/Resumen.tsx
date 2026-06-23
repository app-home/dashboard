import { useCallback, useMemo, useRef, useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import { loadIngresos } from '@/storage/ingresos'
import { loadGastos } from '@/storage/gastos'

const COLORS = ['#2e7d32', '#d32f2f']

function DonutChart({
  values,
  size = 160,
  thickness = 35,
}: {
  values: { label: string; value: number; color: string }[]
  size?: number
  thickness?: number
}) {
  const total = values.reduce((s, v) => s + v.value, 0)
  if (total === 0) return null

  const containerRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<{ label: string; value: number; color: string; pct: string; x: number; y: number } | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setHovered((prev) => prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : null)
    }
  }, [hovered])

  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - thickness / 2
  const circumference = 2 * Math.PI * r
  let offset = 0

  return (
    <Box
      ref={containerRef}
      sx={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center', position: 'relative' }}
      onMouseMove={handleMouseMove}
    >
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        <style>{'.donut-segment { cursor: pointer; transition: opacity 0.2s; } .donut-segment:hover { opacity: 0.75; }'}</style>
        {values.map((v) => {
          const fraction = v.value / total
          const length = circumference * fraction
          const pct = ((v.value / total) * 100).toFixed(1)
          const seg = (
            <g
              key={v.label}
              className="donut-segment"
              onMouseEnter={(e) => {
                const rect = containerRef.current!.getBoundingClientRect()
                setHovered({ label: v.label, value: v.value, color: v.color, pct, x: e.clientX - rect.left, y: e.clientY - rect.top })
              }}
              onMouseMove={(e) => {
                if (containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect()
                  setHovered((prev) => prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : null)
                }
              }}
              onMouseLeave={() => setHovered(null)}
            >
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={v.color}
                strokeWidth={thickness}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            </g>
          )
          offset += length
          return seg
        })}
      </svg>

      {hovered && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            left: hovered.x + 12,
            top: hovered.y - 40,
            p: 1.5,
            borderRadius: 1.5,
            minWidth: 160,
            pointerEvents: 'none',
            zIndex: 1400,
            '&::after': {
              content: '""',
              position: 'absolute',
              left: -6,
              top: 34,
              width: 0,
              height: 0,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderRight: '6px solid',
              borderRightColor: 'background.paper',
            },
          }}
        >
          <Stack spacing={0.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: hovered.color, flexShrink: 0 }} />
              <Typography variant="caption" color="text.secondary">
                {hovered.label}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {hovered.value.toLocaleString('es-CO')} COP
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Number(hovered.pct)}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: hovered.color },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {hovered.pct}% del total
            </Typography>
          </Stack>
        </Paper>
      )}

      <Stack spacing={1}>
        {values.map((v) => (
          <Box key={v.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: v.color, flexShrink: 0 }} />
            <Typography variant="body2">{v.label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {((v.value / total) * 100).toFixed(1)}%
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(n)
}

function toDateInput(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10)
}

export default function Resumen() {
  const ingresos = useMemo(() => loadIngresos(), [])
  const gastos = useMemo(() => loadGastos(), [])

  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const [fromDate, setFromDate] = useState(toDateInput(firstOfMonth.toISOString()))
  const [toDate, setToDate] = useState(toDateInput(lastOfMonth.toISOString()))

  const filtrados = useMemo(() => {
    const from = new Date(fromDate)
    const to = new Date(toDate)
    to.setHours(23, 59, 59, 999)

    const ing = ingresos.filter((i) => {
      const d = new Date(i.fecha)
      return d >= from && d <= to
    })
    const gas = gastos.filter((g) => {
      const d = new Date(g.fecha)
      return d >= from && d <= to
    })
    return { ingresos: ing, gastos: gas }
  }, [ingresos, gastos, fromDate, toDate])

  const totalIngresos = filtrados.ingresos.reduce((s, i) => s + i.monto, 0)
  const totalGastos = filtrados.gastos.reduce((s, g) => s + g.monto, 0)
  const balance = totalIngresos - totalGastos

  const gastosPorCategoria = useMemo(() => {
    const map = new Map<string, number>()
    for (const g of filtrados.gastos) {
      map.set(g.categoria, (map.get(g.categoria) ?? 0) + g.monto)
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
  }, [filtrados.gastos])

  const maxGasto = gastosPorCategoria[0]?.[1] ?? 1
  const gastoPct = totalIngresos > 0 ? (totalGastos / totalIngresos) * 100 : 0

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: 'success.main',
            color: 'success.contrastText',
          }}
        >
          <Stack spacing={0.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon fontSize="small" />
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Ingresos
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {formatCurrency(totalIngresos)}
            </Typography>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: 'error.main',
            color: 'error.contrastText',
          }}
        >
          <Stack spacing={0.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingDownIcon fontSize="small" />
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Gastos
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {formatCurrency(totalGastos)}
            </Typography>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: balance >= 0 ? 'primary.main' : 'warning.main',
            color: balance >= 0 ? 'primary.contrastText' : 'warning.contrastText',
          }}
        >
          <Stack spacing={0.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceIcon fontSize="small" />
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Balance
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {formatCurrency(balance)}
            </Typography>
          </Stack>
        </Paper>
      </Box>

      {totalIngresos > 0 && (
        <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Proporción gastos / ingresos
              </Typography>
              <Chip
                label={`${gastoPct.toFixed(1)}%`}
                size="small"
                color={gastoPct > 80 ? 'error' : gastoPct > 50 ? 'warning' : 'success'}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(gastoPct, 100)}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  bgcolor:
                    gastoPct > 80
                      ? 'error.main'
                      : gastoPct > 50
                        ? 'warning.main'
                        : 'success.main',
                },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {formatCurrency(totalGastos)} de {formatCurrency(totalIngresos)}
            </Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Distribución
          </Typography>
          <DonutChart
            values={[
              { label: 'Ingresos', value: totalIngresos, color: COLORS[0] },
              { label: 'Gastos', value: totalGastos, color: COLORS[1] },
            ]}
          />
        </Paper>
      )}

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
              onChange={(e) => setFromDate(e.target.value)}
              slotProps={{ htmlInput: { max: toDate } }}
              sx={{ width: 180 }}
            />
            <TextField
              size="small"
              label="Hasta"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              slotProps={{ htmlInput: { min: fromDate } }}
              sx={{ width: 180 }}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {gastosPorCategoria.length > 0 && (
        <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Gastos por categoría
          </Typography>
          <Stack spacing={1.5}>
            {gastosPorCategoria.map(([cat, monto]) => (
              <Box key={cat}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{cat}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatCurrency(monto)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(monto / maxGasto) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': { borderRadius: 4 },
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Paper>
      )}
    </Stack>
  )
}
