import { vi } from 'vitest';

// Stub fetch for /api/effy with a table of handlers keyed "METHOD /path"
// (query string ignored), e.g. { 'GET /bootstrap': bootstrap, 'POST /campaigns': (body) => ({...}) }.
// A handler may return a body (sent as 200) or [status, body]. Every request is
// recorded in `calls`; anything without a handler lands in `unhandled` and gets a
// 404, so a test can assert the page made no unexpected requests.
export function mockApi(handlers = {}) {
  const calls = [];
  const unhandled = [];
  const fetchMock = vi.fn(async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, 'http://localhost');
    const method = (init.method || 'GET').toUpperCase();
    const path = url.pathname.replace(/^\/api\/effy/, '');
    let body = init.body;
    try { body = body ? JSON.parse(body) : undefined; } catch { /* FormData or text */ }
    const call = { method, path, query: Object.fromEntries(url.searchParams), body };
    calls.push(call);

    const handler = handlers[`${method} ${path}`];
    if (handler === undefined) {
      unhandled.push(`${method} ${path}`);
      return new Response(JSON.stringify({ status: 'error', message: `No test handler for ${method} ${path}` }), { status: 404 });
    }
    let result = typeof handler === 'function' ? await handler(body, call) : handler;
    let status = 200;
    if (Array.isArray(result)) [status, result] = result;
    return new Response(JSON.stringify(result ?? {}), { status, headers: { 'Content-Type': 'application/json' } });
  });
  vi.stubGlobal('fetch', fetchMock);
  return { calls, unhandled, fetch: fetchMock, callsTo: (key) => calls.filter((c) => `${c.method} ${c.path}` === key) };
}

// Mirrors the engine's _bootstrap_payload for a signed-in owner with one workspace.
export const bootstrapFixture = {
  status: 'ok',
  user: { id: 1, name: 'Asha Rao', email: 'asha@example.in', email_verified: true, is_admin: false },
  org: { id: 1, name: 'Rao Dental', type: 'business', plan: 'Growth' },
  workspaces: [{ id: 'ws_1', dbId: 1, name: 'Rao Dental Pune', industry: 'Dental clinic', location: 'Pune', logo: '🦷', accent: '#E84A33' }],
  role: 'Owner',
};
