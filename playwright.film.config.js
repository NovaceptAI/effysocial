import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

// The real-engine suite — the demo film end to end (launch plan 2.9, ENV-015) and
// workspaces and clients (3.1). The production build in
// Chromium, talking to the real engine (scripts/e2e_film_server.py) on a throwaway
// database with the paid AI providers stubbed. ffmpeg really assembles and exports,
// so the run ends with a playable file.
//
// The engine is the sibling checkout in a phase worktree (~/effy-work/NAME/engine),
// else /srv/novalab-engine; EFFY_ENGINE_DIR overrides.
const ENGINE_DIR = process.env.EFFY_ENGINE_DIR
  || (existsSync(resolve('../engine/scripts/e2e_film_server.py')) ? resolve('../engine') : '/srv/novalab-engine');
const PYTHON = process.env.EFFY_ENGINE_PYTHON || '/srv/novalab-engine/myenv/bin/python';
const WEB_PORT = Number(process.env.E2E_FILM_PORT) || 4293;
const ENGINE_PORT = Number(process.env.E2E_FILM_ENGINE_PORT) || 5099;
const ORIGIN = `http://127.0.0.1:${WEB_PORT}`;

export default defineConfig({
  testDir: './e2e-film',
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  timeout: 240_000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: ORIGIN,
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      // env -i: the engine must not inherit provider keys from the shell either.
      command: `env -i PATH=/usr/bin:/bin HOME=${process.env.HOME} ${PYTHON} scripts/e2e_film_server.py --port ${ENGINE_PORT} --origin ${ORIGIN}`,
      cwd: ENGINE_DIR,
      url: `http://127.0.0.1:${ENGINE_PORT}/api/effy/health`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `npx vite build --outDir .e2e-film-build --emptyOutDir --logLevel error && E2E_ENGINE=http://127.0.0.1:${ENGINE_PORT} npx vite preview --outDir .e2e-film-build --host 127.0.0.1 --port ${WEB_PORT} --strictPort`,
      url: ORIGIN,
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
