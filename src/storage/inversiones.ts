export type TipoInversion = 'CDT' | 'Fondo' | 'Acciones' | 'Otro'
export type EstadoInversion = 'activo' | 'vencido' | 'cancelado'

export interface Inversion {
  id: string
  tipo: TipoInversion
  nombre: string
  entidad: string
  monto: number
  fechaInicio: string
  plazo: number
  tasaInteres: number
  estado: EstadoInversion
}

const STORAGE_KEY = 'dashboard.inversiones'

let _cache: Inversion[] | null = null

function loadRaw(): Inversion[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Inversion[]
  } catch {
    return []
  }
}

export function loadInversiones(): Inversion[] {
  if (_cache === null) _cache = loadRaw()
  return _cache
}

export function saveInversiones(list: Inversion[]): void {
  _cache = list
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function addInversion(data: Omit<Inversion, 'id'>): Inversion {
  const item: Inversion = { ...data, id: crypto.randomUUID() }
  const list = loadInversiones()
  saveInversiones([...list, item])
  return item
}

export function deleteInversion(id: string): void {
  saveInversiones(loadInversiones().filter((i) => i.id !== id))
}

export function rendimientoEstimado(inv: Inversion): number {
  if (inv.plazo <= 0 || inv.tasaInteres <= 0) return 0
  return inv.monto * (inv.tasaInteres / 100) * (inv.plazo / 365)
}

export function fechaVencimiento(inv: Inversion): Date | null {
  if (inv.tipo !== 'CDT' || !inv.plazo) return null
  const d = new Date(inv.fechaInicio)
  d.setDate(d.getDate() + inv.plazo)
  return d
}

export function diasRestantes(inv: Inversion): number | null {
  const venc = fechaVencimiento(inv)
  if (!venc) return null
  return Math.ceil((venc.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export function clearInversionesCache(): void {
  _cache = null
}
