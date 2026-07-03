import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/novapost/api': {
        target: 'http://127.0.0.1:5010',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/novapost/, ''),
      },
    },
  },
})
