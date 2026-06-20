/**
 * Persistencia de la configuración del usuario en Google Drive.
 *
 * Usa la carpeta de datos de aplicación (`appDataFolder`): oculta, por-usuario
 * y por-app. El scope `drive.appdata` se pide de forma incremental (no en el
 * login). Si el usuario no autoriza Drive, se usa `localStorage` como fallback.
 */

import { loadGis, requestAccessToken } from '@/auth/google'

export const DRIVE_APPDATA_SCOPE =
  'https://www.googleapis.com/auth/drive.appdata'

const CONFIG_FILENAME = 'config.json'
const LOCAL_KEY = 'dashboard.config'
const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files'
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files'

/** Ajustes del usuario. Ampliar según se necesiten más opciones. */
export interface AppSettings {
  themeMode: 'light' | 'dark'
}

/** Documento de configuración versionado (facilita migraciones futuras). */
export interface AppConfig {
  version: number
  settings: AppSettings
  updatedAt: string
}

export const DEFAULT_CONFIG: AppConfig = {
  version: 1,
  settings: { themeMode: 'light' },
  updatedAt: new Date(0).toISOString(),
}

/* ------------------------------------------------------------------ */
/* Fallback local                                                      */
/* ------------------------------------------------------------------ */

export function loadLocalConfig(): AppConfig {
  const raw = localStorage.getItem(LOCAL_KEY)
  if (!raw) return DEFAULT_CONFIG
  try {
    return JSON.parse(raw) as AppConfig
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

/** Pide (incrementalmente) un access token con el scope de Drive. */
async function getDriveToken(): Promise<string> {
  await loadGis()
  return requestAccessToken(DRIVE_APPDATA_SCOPE)
}

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
 * Carga la configuración desde Drive. Pide autorización si hace falta.
 * Devuelve DEFAULT_CONFIG si el usuario aún no tiene config guardada.
 */
export async function loadConfigFromDrive(): Promise<AppConfig> {
  const token = await getDriveToken()
  const id = await findConfigFileId(token)
  if (!id) return DEFAULT_CONFIG

  const res = await fetch(`${DRIVE_FILES_URL}/${id}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('No se pudo descargar la configuración de Drive')
  return (await res.json()) as AppConfig
}

/**
 * Guarda la configuración en Drive (crea o actualiza el config.json).
 * Sella `updatedAt` con la hora actual.
 */
export async function saveConfigToDrive(config: AppConfig): Promise<AppConfig> {
  const token = await getDriveToken()
  const toSave: AppConfig = { ...config, updatedAt: new Date().toISOString() }
  const content = JSON.stringify(toSave)
  const id = await findConfigFileId(token)

  if (id) {
    // Actualiza solo el contenido (uploadType=media).
    const res = await fetch(`${DRIVE_UPLOAD_URL}/${id}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
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
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    })
    if (!res.ok) throw new Error('No se pudo crear la configuración en Drive')
  }

  return toSave
}
