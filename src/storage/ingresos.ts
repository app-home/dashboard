export interface Ingreso {
  id: string
  monto: number
  descripcion: string
  fecha: string
}

const STORAGE_KEY = 'dashboard.ingresos'

let _cache: Ingreso[] | null = null

function loadRaw(): Ingreso[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Ingreso[]
  } catch {
    return []
  }
}

export function loadIngresos(): Ingreso[] {
  if (_cache === null) {
    _cache = loadRaw()
  }
  return _cache
}

export function saveIngresos(ingresos: Ingreso[]): void {
  _cache = ingresos
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ingresos))
}

export function addIngreso(
  data: Omit<Ingreso, 'id'>,
): Ingreso {
  const ingreso: Ingreso = { ...data, id: crypto.randomUUID() }
  const list = loadIngresos()
  saveIngresos([...list, ingreso])
  return ingreso
}

export function deleteIngreso(id: string): void {
  saveIngresos(loadIngresos().filter((i) => i.id !== id))
}

export function clearIngresosCache(): void {
  _cache = null
}
