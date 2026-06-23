import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Box } from '@mui/material'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { useConfig } from '@/storage/useConfig'
import { AutoSaveProvider } from '@/contexts/AutoSaveContext'
import type { SyncStatus } from '@/contexts/AutoSaveContext'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyM') {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleSidebar])
  const location = useLocation()
  const { accessToken } = useAuth()
  const { config, saveToDrive, syncing } = useConfig(accessToken)

  const [localSyncStatus, setLocalSyncStatus] = useState<SyncStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const triggerAutoSave = useCallback(() => {
    if (!accessToken) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setLocalSyncStatus('saving')
    timerRef.current = setTimeout(async () => {
      try {
        await saveToDrive()
        if (!mountedRef.current) return
        setLocalSyncStatus('saved')
        setTimeout(() => {
          if (mountedRef.current) setLocalSyncStatus('idle')
        }, 2000)
      } catch {
        if (!mountedRef.current) return
        setLocalSyncStatus('error')
        setTimeout(() => {
          if (mountedRef.current) setLocalSyncStatus('idle')
        }, 2000)
      }
    }, 5000)
  }, [accessToken, saveToDrive])

  const syncStatus: SyncStatus = syncing ? 'saving' : localSyncStatus

  const activeItem = config.settings.menu.find(
    (item) => item.path === location.pathname,
  )
  const title = activeItem?.label ?? 'Dashboard'

  return (
    <>
      <AutoSaveProvider triggerAutoSave={triggerAutoSave} syncStatus={syncStatus}>
      <Box>
        <Navbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <Box sx={{ display: 'flex' }}>
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <Box component="main" sx={{ flexGrow: 1 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </AutoSaveProvider>
    </>
  )
}
