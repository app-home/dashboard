/// <reference types="vite/client" />

/** Versión del package.json inyectada en build (ver `define` en vite.config.ts). */
declare const __APP_VERSION__: string

interface ImportMetaEnv {
  /** Client ID público de OAuth de Google. Se usa a partir del issue #4. */
  readonly VITE_GOOGLE_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
