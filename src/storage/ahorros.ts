export interface MetaAhorro {
  id: string
  titulo: string
  meta: number
  ahorrado: number
  fechaLimite: string | null
  icono: string
}

const STORAGE_KEY = 'dashboard.ahorros'

let _cache: MetaAhorro[] | null = null

function loadRaw(): MetaAhorro[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as MetaAhorro[]
  } catch {
    return []
  }
}

export function loadMetas(): MetaAhorro[] {
  if (_cache === null) _cache = loadRaw()
  return _cache
}

export function saveMetas(list: MetaAhorro[]): void {
  _cache = list
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function addMeta(data: Omit<MetaAhorro, 'id'>): MetaAhorro {
  const item: MetaAhorro = { ...data, id: crypto.randomUUID() }
  const list = loadMetas()
  saveMetas([...list, item])
  return item
}

export function deleteMeta(id: string): void {
  saveMetas(loadMetas().filter((m) => m.id !== id))
}

export function aportar(id: string, monto: number): MetaAhorro[] {
  const list = loadMetas()
  const updated = list.map((m) =>
    m.id === id ? { ...m, ahorrado: m.ahorrado + monto } : m,
  )
  saveMetas(updated)
  return updated
}

export function clearAhorrosCache(): void {
  _cache = null
}
