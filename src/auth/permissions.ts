import { loadLocalConfig } from '@/storage/driveConfig'

/**
 * Consulta el rol y permisos de un usuario por su email.
 *
 * Actualmente lee desde la configuración local (archivo `driveConfig.ts`).
 * En el futuro, reemplazar esta implementación por una llamada a una API
 * externa (ej. microservicio de usuarios) sin cambiar la firma:
 *
 * ```ts
 * export async function getUserPermissions(email: string) {
 *   const res = await fetch(`/api/users/${encodeURIComponent(email)}/permissions`)
 *   if (!res.ok) return { role: 'user', permissions: [] }
 *   return res.json()
 * }
 * ```
 */
export async function getUserPermissions(
  email: string,
): Promise<{ role: string; permissions: string[] }> {
  const config = loadLocalConfig()
  const user = config.settings.users?.find((u) => u.email === email)
  return user ?? { role: 'user', permissions: [] }
}
