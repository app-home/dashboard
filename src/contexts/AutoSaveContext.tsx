import { createContext, useContext, useMemo, type ReactNode } from 'react'

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error'

interface AutoSaveContextValue {
  triggerAutoSave: () => void
  syncStatus: SyncStatus
}

const AutoSaveContext = createContext<AutoSaveContextValue>({
  triggerAutoSave: () => {},
  syncStatus: 'idle',
})

export function useAutoSave() {
  return useContext(AutoSaveContext)
}

export function AutoSaveProvider({
  triggerAutoSave,
  syncStatus,
  children,
}: {
  triggerAutoSave: () => void
  syncStatus: SyncStatus
  children: ReactNode
}) {
  const value = useMemo(
    () => ({ triggerAutoSave, syncStatus }),
    [triggerAutoSave, syncStatus],
  )

  return (
    <AutoSaveContext.Provider value={value}>
      {children}
    </AutoSaveContext.Provider>
  )
}
