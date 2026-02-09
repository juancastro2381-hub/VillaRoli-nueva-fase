import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8010',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // Note: Our backend routes are /auth, /bookings, /admin. 
        // If frontend calls /api/auth -> backend /auth.
        // If frontend calls /api/bookings -> backend /bookings.
      },
      '/auth': {
        target: 'http://localhost:8010',
        changeOrigin: true
      },
      '/admin': {
        target: 'http://localhost:8010',
        changeOrigin: true
      }
    }
  }
})
