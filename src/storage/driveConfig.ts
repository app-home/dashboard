import type { Ingreso } from '@/storage/ingresos'
import type { Gasto } from '@/storage/gastos'
import type { MetaAhorro } from '@/storage/ahorros'
import type { Inversion } from '@/storage/inversiones'

/**
 * Persistencia de la configuración del usuario en Google Drive.
 *
 * Usa la carpeta de datos de aplicación (`appDataFolder`): oculta, por-usuario
 * y por-app. El access token con el scope `drive.appdata` se solicita durante
 * el login. Si el usuario no autoriza Drive, se usa `localStorage` como fallback.
 */

export const DRIVE_APPDATA_SCOPE =
  'https://www.googleapis.com/auth/drive.appdata'

const CONFIG_FILENAME = 'config.json'
const LOCAL_KEY = 'dashboard.config'
const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files'
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files'

export interface MenuItem {
  id: string
  label: string
  icon: 'dashboard' | 'settings' | 'home' | 'notifications' | 'finanzas'
  path: string
  roles?: string[]
  permissions?: string[]
}

export interface UserRole {
  email: string
  role: string
  permissions: string[]
}

/** Ajustes del usuario. Ampliar según se necesiten más opciones. */
export interface AppSettings {
  themeMode: 'light' | 'dark'
  menu: MenuItem[]
  users: UserRole[]
  ingresos: Ingreso[]
  gastos: Gasto[]
  ahorros: MetaAhorro[]
  inversiones: Inversion[]
}

/** Documento de configuración versionado (facilita migraciones futuras). */
export interface AppConfig {
  version: number
  settings: AppSettings
  updatedAt: string
}

export const DEFAULT_MENU: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/' },
  { id: 'notifications', label: 'Notificaciones', icon: 'notifications', path: '/notifications' },
  { id: 'finanzas', label: 'Finanzas', icon: 'finanzas', path: '/finanzas' },
  { id: 'settings', label: 'Configuración', icon: 'settings', path: '/settings' },
]

export const DEFAULT_USERS: UserRole[] = [
  {
    email: 'manuelflorezw@gmail.com',
    role: 'admin',
    permissions: ['users.manage', 'settings.view'],
  },
]

export const DEFAULT_CONFIG: AppConfig = {
  version: 1,
  settings: {
    themeMode: 'light',
    menu: DEFAULT_MENU,
    users: DEFAULT_USERS,
    ingresos: [],
    gastos: [],
    ahorros: [],
    inversiones: [],
  },
  updatedAt: new Date(0).toISOString(),
}

/* ------------------------------------------------------------------ */
/* Fallback local                                                      */
/* ------------------------------------------------------------------ */

export function loadLocalConfig(): AppConfig {
  const raw = localStorage.getItem(LOCAL_KEY)
  if (!raw) return DEFAULT_CONFIG
  try {
    const parsed = JSON.parse(raw) as AppConfig
    return mergeConfig(parsed)
  } catch {
    return DEFAULT_CONFIG
  }
}

export function saveLocalConfig(config: AppConfig): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(config))
}

/* ------------------------------------------------------------------ */
/* Google Drive (appDataFolder)                                       */
/* ------------------------------------------------------------------ */

/** Busca el id del config.json en appDataFolder, o null si no existe. */
async function findConfigFileId(token: string): Promise<string | null> {
  const params = new URLSearchParams({
    spaces: 'appDataFolder',
    q: `name='${CONFIG_FILENAME}'`,
    fields: 'files(id,name)',
  })
  const res = await fetch(`${DRIVE_FILES_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('No se pudo consultar Google Drive')
  const data = (await res.json()) as { files?: { id: string }[] }
  return data.files?.[0]?.id ?? null
}

/**
 * Carga la configuración desde Drive usando el access token existente.
 * Devuelve DEFAULT_CONFIG si el usuario aún no tiene config guardada.
 */
function ensureDefaultItems(menu: MenuItem[]): MenuItem[] {
  const result = [...menu]
  for (const defaultItem of DEFAULT_MENU) {
    const exists = result.some((item) => item.id === defaultItem.id)
    if (!exists) {
      const defaultIndex = DEFAULT_MENU.indexOf(defaultItem)
      result.splice(defaultIndex, 0, { ...defaultItem })
    }
  }
  return result
}

function mergeConfig(parsed: AppConfig): AppConfig {
  const menu = parsed.settings?.menu ?? DEFAULT_CONFIG.settings.menu
  return {
    ...DEFAULT_CONFIG,
    ...parsed,
    settings: {
      ...DEFAULT_CONFIG.settings,
      ...parsed.settings,
      menu: ensureDefaultItems(menu),
      users: parsed.settings?.users ?? DEFAULT_CONFIG.settings.users,
      ingresos: parsed.settings?.ingresos ?? DEFAULT_CONFIG.settings.ingresos,
      gastos: parsed.settings?.gastos ?? DEFAULT_CONFIG.settings.gastos,
      ahorros: parsed.settings?.ahorros ?? DEFAULT_CONFIG.settings.ahorros,
      inversiones: parsed.settings?.inversiones ?? DEFAULT_CONFIG.settings.inversiones,
    },
  }
}

export async function loadConfigFromDrive(
  accessToken: string,
): Promise<AppConfig> {
  const id = await findConfigFileId(accessToken)
  if (!id) return DEFAULT_CONFIG

  const res = await fetch(`${DRIVE_FILES_URL}/${id}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('No se pudo descargar la configuración de Drive')
  const parsed = (await res.json()) as AppConfig
  return mergeConfig(parsed)
}

/**
 * Guarda la configuración en Drive (crea o actualiza el config.json)
 * usando el access token existente. Sella `updatedAt` con la hora actual.
 */
export async function saveConfigToDrive(
  config: AppConfig,
  accessToken: string,
): Promise<AppConfig> {
  const toSave: AppConfig = { ...config, updatedAt: new Date().toISOString() }
  const content = JSON.stringify(toSave)
  const id = await findConfigFileId(accessToken)

  if (id) {
    // Actualiza solo el contenido (uploadType=media).
    const res = await fetch(`${DRIVE_UPLOAD_URL}/${id}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: content,
    })
    if (!res.ok) throw new Error('No se pudo actualizar la configuración en Drive')
  } else {
    // Crea el archivo en appDataFolder (uploadType=multipart: metadata + contenido).
    const boundary = 'dashboard-config-boundary'
    const metadata = { name: CONFIG_FILENAME, parents: ['appDataFolder'] }
    const body =
      `--${boundary}\r\n` +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      'Content-Type: application/json\r\n\r\n' +
      `${content}\r\n` +
      `--${boundary}--`
    const res = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    })
    if (!res.ok) throw new Error('No se pudo crear la configuración en Drive')
  }

  return toSave
}
