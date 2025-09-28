import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path must match the repo name for GitHub Pages
  base: '/REACT-TRANSLATION-APP/',
})
