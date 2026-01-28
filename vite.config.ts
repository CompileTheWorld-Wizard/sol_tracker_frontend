import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  root: './',
  build: {
    outDir: 'dist-frontend',
    emptyOutDir: true
  },
  server: {
    port: 5175,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        ws: true
      },
      '/trade-api': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        ws: true
      },
      '/fund-api': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        ws: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
