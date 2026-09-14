import { defineConfig, devices } from '@playwright/test';

// End-to-end tests against a production build served by `vite preview`, with
// /api/effy stubbed per test (see e2e/support/api.js) — no backend, no live data.
// Pinned to @playwright/test 1.63.0 so it uses the Chromium build cached on the
// server; upgrading needs `npx playwright install chromium`.
// 4180 is taken by another service on this server. Override with E2E_PORT if 4291 is too.
const PORT = Number(process.env.E2E_PORT) || 4291;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: 2,
  reporter: [['list']],
  timeout: 30_000,
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: /responsive\.spec\.js/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /responsive\.spec\.js/ },
  ],
  webServer: {
    command: `npx vite build --outDir .e2e-build --emptyOutDir --logLevel error && npx vite preview --outDir .e2e-build --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
