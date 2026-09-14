import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The production Content-Security-Policy, read from the nginx snippet so `vite preview`
// (used by the end-to-end tests) enforces exactly what nginx sends.
const csp = readFileSync(new URL('./deploy/content-security-policy.conf', import.meta.url), 'utf8')
  .match(/add_header Content-Security-Policy "([^"]+)"/)[1]
  .replace(/; upgrade-insecure-requests$/, '') // preview is plain http

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
  preview: {
    headers: { 'Content-Security-Policy': csp },
    // The demo-film run (npm run test:e2e:film) points the built app at a real engine.
    ...(process.env.E2E_ENGINE ? { proxy: { '/api/effy': { target: process.env.E2E_ENGINE } } } : {}),
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
