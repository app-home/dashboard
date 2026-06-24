/**
 * Integración con Google OAuth 2.0 vía PKCE (Authorization Code + PKCE).
 *
 * Usa un popup con redirect_uri=postmessage y el endpoint de token de Google
 * para obtener access_token e id_token en un solo flujo.
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'

/** Scopes mínimos para el login (perfil + email). */
export const LOGIN_SCOPES = 'openid email profile'

export interface GoogleProfile {
  name: string
  email: string
  picture?: string
}

export interface TokenResponse {
  accessToken: string
  idToken: string
}

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return base64urlEncode(array.buffer)
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64urlEncode(digest)
}

/**
 * Abre un popup de Google OAuth con PKCE y devuelve accessToken + idToken.
 * Debe llamarse en respuesta a un gesto del usuario (click) para evitar
 * bloqueo de popups.
 */
export function requestTokensPKCE(scope: string = LOGIN_SCOPES): Promise<TokenResponse> {
  return new Promise<TokenResponse>(async (resolve, reject) => {
    if (!CLIENT_ID) {
      reject(new Error('Falta configurar VITE_GOOGLE_CLIENT_ID'))
      return
    }

    const state = generateCodeVerifier()
    const codeVerifier = generateCodeVerifier()
    let codeChallenge: string

    try {
      codeChallenge = await generateCodeChallenge(codeVerifier)
    } catch {
      reject(new Error('Error al generar code challenge'))
      return
    }

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: 'postmessage',
      response_type: 'code',
      scope,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
      access_type: 'offline',
    })

    const popup = window.open(
      `${AUTH_URL}?${params.toString()}`,
      'google-oauth',
      'width=500,height=700',
    )

    if (!popup) {
      reject(new Error('El navegador bloqueó el popup. Permite popups e intenta de nuevo.'))
      return
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://accounts.google.com') return
      if (event.source !== popup) return

      const data = event.data
      if (data?.type !== 'authorization_response') return

      window.removeEventListener('message', handleMessage)

      if (data.error) {
        reject(new Error(data.error))
        return
      }

      const code = data.code
      if (!code) {
        reject(new Error('No se recibió el código de autorización'))
        return
      }

      if (data.state !== state) {
        reject(new Error('State mismatch — posible ataque CSRF'))
        return
      }

      fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          redirect_uri: 'postmessage',
          grant_type: 'authorization_code',
          code_verifier: codeVerifier,
        }),
      })
        .then((res) => res.json())
        .then((tokenData: Record<string, unknown>) => {
          if (tokenData.error) {
            reject(new Error(String(tokenData.error)))
            return
          }
          resolve({
            accessToken: tokenData.access_token as string,
            idToken: (tokenData.id_token as string) ?? '',
          })
        })
        .catch(() => reject(new Error('Error al intercambiar el código por tokens')))
        .finally(() => {
          try { popup.close() } catch { /* ignore */ }
        })
    }

    window.addEventListener('message', handleMessage)

    const poll = setInterval(() => {
      if (popup.closed) {
        clearInterval(poll)
        window.removeEventListener('message', handleMessage)
        reject(new Error('Ventana de autenticación cerrada por el usuario'))
      }
    }, 500)
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
