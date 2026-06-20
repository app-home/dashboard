# Dashboard

Aplicación web (SPA) construida con **React 19**, **TypeScript** y **Vite**, con
inicio de sesión mediante **Google** y sincronización de la configuración del
usuario en su propio **Google Drive**. Se despliega automáticamente en
**GitHub Pages**.

## Características

- 🔐 **Inicio de sesión con Google** (Google Identity Services, client-side).
- 🛡️ **Rutas protegidas**: las vistas privadas requieren sesión.
- ☁️ **Configuración por usuario en Google Drive** (`appDataFolder`), con
  fallback a `localStorage` y sincronización entre dispositivos.
- 🎨 **UI con Material UI (MUI)**.
- 🚀 **Despliegue continuo** en GitHub Pages vía GitHub Actions.
- 🔢 **Versionado semántico automático** con release-please.

## Tecnologías

- React 19 · TypeScript · Vite
- React Router
- Material UI (MUI) + Emotion
- Google Identity Services + Google Drive API
- ESLint

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior
- [pnpm](https://pnpm.io/)
- Un proyecto en [Google Cloud Console](https://console.cloud.google.com) con
  un OAuth Client ID (ver [Configuración de Google](#configuración-de-google)).

## Instalación

```bash
pnpm install
```

## Configuración de Google

La app necesita un **OAuth Client ID** de Google:

1. En Google Cloud Console, crea un proyecto y habilita la **Google Drive API**.
2. Configura la **pantalla de consentimiento de OAuth** (tipo *External*) y, en
   modo *Testing*, agrega tu cuenta en **Test users**.
3. Agrega los scopes: `openid`, `email`, `profile` y
   `https://www.googleapis.com/auth/drive.appdata`.
4. Crea credenciales → **OAuth client ID** → *Web application*.
5. En **Authorized JavaScript origins** agrega (solo host, sin ruta):
   - `http://localhost:5173`
   - `https://app-home.github.io`

### Variables de entorno

Copia `.env.example` a `.env.local` y completa el Client ID:

```bash
# .env.local
VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
```

> El Client ID es público (se incrusta en el bundle). Nunca pongas un *client
> secret* en variables `VITE_*`.

Para el build en CI, define `VITE_GOOGLE_CLIENT_ID` como **Variable del repo**
(Settings → Secrets and variables → Actions → Variables).

## Scripts disponibles

| Comando        | Descripción                                          |
| -------------- | ---------------------------------------------------- |
| `pnpm dev`     | Inicia el servidor de desarrollo con HMR.            |
| `pnpm build`   | Compila TypeScript y genera el build de producción.  |
| `pnpm preview` | Sirve localmente el build de producción.             |
| `pnpm lint`    | Ejecuta ESLint sobre el proyecto.                    |

## Desarrollo

```bash
pnpm dev
```

Luego abre la URL que indica la terminal (por defecto http://localhost:5173).

## Estructura del proyecto

```
src/
├── auth/            # Autenticación con Google (contexto, provider, GIS)
├── components/      # Componentes reutilizables (botón de login, ruta protegida)
├── pages/           # Vistas: Login, Dashboard, Settings
├── storage/         # Configuración del usuario en Google Drive
├── theme.ts         # Tema de MUI
├── App.tsx          # Definición de rutas
└── main.tsx         # Providers (Router, MUI, Auth)
```

Los imports usan el alias `@` → `src` (configurado en `vite.config.ts` y
`tsconfig.app.json`).

## Despliegue

El despliegue a GitHub Pages es automático en cada push a `main`
([.github/workflows/deploy.yml](.github/workflows/deploy.yml)).

La app se sirve bajo la subruta `/dashboard/`, configurada con `base` en
[vite.config.ts](vite.config.ts).

> Requisito: en **Settings → Pages → Source** seleccionar **GitHub Actions**.

## Versionado

El versionado sigue [SemVer](https://semver.org/) y se automatiza con
**release-please** a partir de [Conventional Commits](https://www.conventionalcommits.org/):

- `fix:` → patch · `feat:` → minor · `feat!:` / `BREAKING CHANGE:` → major.

Al mergear a `main`, release-please abre un *Release PR* que actualiza
`package.json` y el `CHANGELOG.md`. Al mergear ese PR se crea el release. La
versión activa se muestra dentro de la app (login y dashboard).
