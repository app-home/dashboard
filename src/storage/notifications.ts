export interface AppNotification {
  id: string
  message: string
  createdAt: string
  read: boolean
}

const STORAGE_KEY = 'dashboard.notifications'

export const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    message: 'Bienvenido al dashboard',
    createdAt: new Date(Date.now() - 60000).toISOString(),
    read: false,
  },
  {
    id: '2',
    message: 'Configuración sincronizada con Drive',
    createdAt: new Date(Date.now() - 120000).toISOString(),
    read: false,
  },
]

export function loadNotifications(): AppNotification[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    saveNotifications(DEFAULT_NOTIFICATIONS)
    return DEFAULT_NOTIFICATIONS
  }
  try {
    return JSON.parse(raw) as AppNotification[]
  } catch {
    saveNotifications(DEFAULT_NOTIFICATIONS)
    return DEFAULT_NOTIFICATIONS
  }
}

export function saveNotifications(notifications: AppNotification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
}

export function markAsRead(id: string): AppNotification[] {
  const notifications = loadNotifications()
  const updated = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n,
  )
  saveNotifications(updated)
  return updated
}

export function markAllAsRead(): AppNotification[] {
  const updated = loadNotifications().map((n) => ({ ...n, read: true }))
  saveNotifications(updated)
  return updated
}

export function unreadCount(): number {
  return loadNotifications().filter((n) => !n.read).length
}
