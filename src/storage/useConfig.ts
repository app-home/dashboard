import { useCallback, useState } from 'react'
import {
  loadConfigFromDrive,
  loadLocalConfig,
  saveConfigToDrive,
  saveLocalConfig,
} from '@/storage/driveConfig'
import type { AppConfig, AppSettings } from '@/storage/driveConfig'

/**
 * Maneja la configuración del usuario:
 * - Estado inicial desde `localStorage` (sin pedir Drive).
 * - `updateSettings` guarda en local de inmediato.
 * - `saveToDrive` / `loadFromDrive` sincronizan con Drive usando el
 *   access token del usuario (obtenido durante el login).
 */
export function useConfig(accessToken: string | null) {
  const [config, setConfig] = useState<AppConfig>(loadLocalConfig)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setConfig((prev) => {
      const next = { ...prev, settings: { ...prev.settings, ...partial } }
      saveLocalConfig(next)
      return next
    })
  }, [])

  const saveToDrive = useCallback(async () => {
    if (!accessToken) {
      setError('No hay sesión activa. Inicia sesión de nuevo.')
      return
    }
    setSyncing(true)
    setError(null)
    try {
      const current = loadLocalConfig()
      const saved = await saveConfigToDrive(current, accessToken)
      setConfig(saved)
      saveLocalConfig(saved)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar en Drive')
    } finally {
      setSyncing(false)
    }
  }, [accessToken])

  const loadFromDrive = useCallback(async () => {
    if (!accessToken) {
      setError('No hay sesión activa. Inicia sesión de nuevo.')
      return
    }
    setSyncing(true)
    setError(null)
    try {
      const loaded = await loadConfigFromDrive(accessToken)
      setConfig(loaded)
      saveLocalConfig(loaded)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar de Drive')
    } finally {
      setSyncing(false)
    }
  }, [accessToken])

  return { config, syncing, error, updateSettings, saveToDrive, loadFromDrive }
}
