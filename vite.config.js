import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  // Unit and component tests (npm test). End-to-end tests live in e2e/ and run
  // through Playwright (npm run test:e2e).
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    css: false,
    restoreMocks: true,
  },
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
