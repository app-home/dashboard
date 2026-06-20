import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json'

// https://vite.dev/config/
export default defineConfig({
  // La app se sirve bajo la subruta del repo en GitHub Pages:
  // https://app-home.github.io/dashboard/
  base: '/dashboard/',
  // Expone la versión del package.json como constante global en el bundle
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    // Alias @ -> src
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [react()],
})
