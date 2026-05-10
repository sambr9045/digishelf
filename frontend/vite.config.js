import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backendTarget = process.env.VITE_DEV_BACKEND_ORIGIN || 'http://127.0.0.1:8000'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/sitemap.xml': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/robots.txt': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
})
