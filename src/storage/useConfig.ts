import { useCallback, useEffect, useRef, useState } from 'react'
import {
  loadConfigFromDrive,
  loadLocalConfig,
  saveConfigToDrive,
  saveLocalConfig,
} from '@/storage/driveConfig'
import type { AppConfig, AppSettings } from '@/storage/driveConfig'
import type { Ingreso } from '@/storage/ingresos'
import type { Gasto } from '@/storage/gastos'
import type { MetaAhorro } from '@/storage/ahorros'
import type { Inversion } from '@/storage/inversiones'
import { clearIngresosCache } from '@/storage/ingresos'
import { clearGastosCache } from '@/storage/gastos'
import { clearAhorrosCache } from '@/storage/ahorros'
import { clearInversionesCache } from '@/storage/inversiones'

const FINANCIAL_KEYS = {
  ingresos: 'dashboard.ingresos',
  gastos: 'dashboard.gastos',
  ahorros: 'dashboard.ahorros',
  inversiones: 'dashboard.inversiones',
} as const

function readFinancial<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeFinancial(key: string, data: unknown[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

function clearFinancialCaches(): void {
  clearIngresosCache()
  clearGastosCache()
  clearAhorrosCache()
  clearInversionesCache()
}

function attachFinancials(config: AppConfig): AppConfig {
  return {
    ...config,
    settings: {
      ...config.settings,
      ingresos: readFinancial<Ingreso>(FINANCIAL_KEYS.ingresos),
      gastos: readFinancial<Gasto>(FINANCIAL_KEYS.gastos),
      ahorros: readFinancial<MetaAhorro>(FINANCIAL_KEYS.ahorros),
      inversiones: readFinancial<Inversion>(FINANCIAL_KEYS.inversiones),
    },
  }
}

function writeFinancials(settings: AppSettings): void {
  writeFinancial(FINANCIAL_KEYS.ingresos, settings.ingresos)
  writeFinancial(FINANCIAL_KEYS.gastos, settings.gastos)
  writeFinancial(FINANCIAL_KEYS.ahorros, settings.ahorros)
  writeFinancial(FINANCIAL_KEYS.inversiones, settings.inversiones)
}

/**
 * Maneja la configuración del usuario:
 * - Estado inicial desde `localStorage` (sin pedir Drive).
 * - `updateSettings` guarda en local de inmediato.
 * - `saveToDrive` / `loadFromDrive` sincronizan con Drive usando el
 *   access token del usuario (obtenido durante el login).
 *
 * Los datos financieros (ingresos, gastos, ahorros, inversiones) viajan
 * dentro del AppConfig para que se respalden en Drive.
 */
export function useConfig(accessToken: string | null) {
  const [config, setConfig] = useState<AppConfig>(loadLocalConfig)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initialLoadDone = useRef(false)

  // Migración inicial: si el config cargado ya traía datos financieros
  // (ej. después de una sincronización desde Drive), escribirlos a localStorage.
  useEffect(() => {
    const s = config.settings
    if (s.ingresos?.length || s.gastos?.length || s.ahorros?.length || s.inversiones?.length) {
      writeFinancials(s)
      clearFinancialCaches()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Al iniciar sesión (accessToken disponible), carga automáticamente
  // la configuración desde Drive para sobrescribir lo que haya en local.
  useEffect(() => {
    if (accessToken && !initialLoadDone.current) {
      initialLoadDone.current = true
      loadFromDrive()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

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
      const current = attachFinancials(loadLocalConfig())
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
      writeFinancials(loaded.settings)
      clearFinancialCaches()
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
