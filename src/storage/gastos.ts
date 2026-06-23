export interface Gasto {
  id: string
  monto: number
  descripcion: string
  categoria: string
  fecha: string
}

const STORAGE_KEY = 'dashboard.gastos'

let _cache: Gasto[] | null = null

function loadRaw(): Gasto[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Gasto[]
  } catch {
    return []
  }
}

export function loadGastos(): Gasto[] {
  if (_cache === null) {
    _cache = loadRaw()
  }
  return _cache
}

export function saveGastos(gastos: Gasto[]): void {
  _cache = gastos
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gastos))
}

export function addGasto(data: Omit<Gasto, 'id'>): Gasto {
  const gasto: Gasto = { ...data, id: crypto.randomUUID() }
  const list = loadGastos()
  saveGastos([...list, gasto])
  return gasto
}

export function deleteGasto(id: string): void {
  saveGastos(loadGastos().filter((g) => g.id !== id))
}

export function clearGastosCache(): void {
  _cache = null
}
