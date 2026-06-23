import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { loadNotifications, saveNotifications, markAsRead, markAllAsRead } from '@/storage/notifications'
import type { AppNotification } from '@/storage/notifications'

interface NotificationContextValue {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (message: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
})

export function useNotifications() {
  return useContext(NotificationContext)
}

let _notifSeq = 2

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadNotifications())

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const addNotification = useCallback((message: string) => {
    _notifSeq++
    const n: AppNotification = {
      id: Date.now().toString(36) + _notifSeq.toString(36),
      message,
      createdAt: new Date().toISOString(),
      read: false,
    }
    setNotifications((prev) => {
      const next = [n, ...prev]
      saveNotifications(next)
      return next
    })
  }, [])

  const handleMarkAsRead = useCallback((id: string) => {
    const updated = markAsRead(id)
    setNotifications(updated)
  }, [])

  const handleMarkAllAsRead = useCallback(() => {
    const updated = markAllAsRead()
    setNotifications(updated)
  }, [])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead: handleMarkAsRead,
      markAllAsRead: handleMarkAllAsRead,
    }),
    [notifications, unreadCount, addNotification, handleMarkAsRead, handleMarkAllAsRead],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
