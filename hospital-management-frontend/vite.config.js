import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Local dev: forward /api requests to API Gateway (avoids CORS)
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) {
              return 'vendor-three'
            }
            if (id.includes('gsap') || id.includes('lenis')) {
              return 'vendor-animation'
            }
            if (id.includes('motion')) {
              return 'vendor-motion'
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react'
            }
            if (id.includes('bootstrap') || id.includes('react-toastify') || id.includes('axios')) {
              return 'vendor-utils'
            }
          }
        }
      }
    }
  }
})
