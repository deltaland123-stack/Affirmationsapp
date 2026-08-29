import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 4000,
    open: true
  },
  preview: {
    host: true,
    port: 4000
  }
})
