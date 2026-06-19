import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // La app se sirve bajo la subruta del repo en GitHub Pages:
  // https://app-home.github.io/dashboard/
  base: '/dashboard/',
  plugins: [react()],
})
