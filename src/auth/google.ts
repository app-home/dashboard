/**
 * Integración con Google Identity Services (GIS), 100% client-side.
 *
 * Usa el "token model" (`initTokenClient`): un access token que sirve tanto
 * para obtener el perfil del usuario (login) como, más adelante, para pedir
 * scopes adicionales de Drive de forma incremental (issue #5).
 */

const GIS_SRC = 'https://accounts.google.com/gsi/client'
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

/** Scopes mínimos para el login (perfil + email). */
export const LOGIN_SCOPES = 'openid email profile'

export interface GoogleProfile {
  name: string
  email: string
  picture?: string
}

let gisPromise: Promise<void> | null = null

/** Carga el script de GIS una sola vez y resuelve cuando está disponible. */
export function loadGis(): Promise<void> {
  if (gisPromise) return gisPromise

  gisPromise = new Promise<void>((resolve, reject) => {
    if (typeof google !== 'undefined' && google.accounts?.oauth2) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () =>
      reject(new Error('No se pudo cargar Google Identity Services'))
    document.head.appendChild(script)
  })

  return gisPromise
}

/**
 * Solicita un access token vía el token model de GIS.
 * Debe llamarse tras `loadGis()` y en respuesta a un gesto del usuario (click).
 */
export function requestAccessToken(scope: string = LOGIN_SCOPES): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!CLIENT_ID) {
      reject(new Error('Falta configurar VITE_GOOGLE_CLIENT_ID'))
      return
    }

    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error))
          return
        }
        resolve(response.access_token)
      },
      error_callback: (error) => {
        reject(new Error(error.message || 'Autorización cancelada'))
      },
    })

    tokenClient.requestAccessToken()
  })
}

interface UserInfoResponse {
  name?: string
  email?: string
  picture?: string
}

/** Obtiene el perfil del usuario usando el access token. */
export async function fetchGoogleProfile(
  accessToken: string,
): Promise<GoogleProfile> {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    throw new Error('No se pudo obtener el perfil de Google')
  }
  const data = (await res.json()) as UserInfoResponse
  return {
    name: data.name ?? data.email ?? 'Usuario',
    email: data.email ?? '',
    picture: data.picture,
  }
}

/** Revoca el access token (parte del logout). */
export function revokeAccessToken(accessToken: string): void {
  if (typeof google !== 'undefined' && google.accounts?.oauth2) {
    google.accounts.oauth2.revoke(accessToken, () => {})
  }
}
