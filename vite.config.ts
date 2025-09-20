import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // 适配静态部署
  server: {
    port: 3000,
    host: true,
    open: true
  },
  build: {
    target: 'es2015',
    minify: 'esbuild', // 改用esbuild压缩，避免terser依赖问题
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          virtualization: ['react-window', 'react-window-infinite-loader'],
          utils: ['react-intersection-observer']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-window', 'react-intersection-observer']
  }
})