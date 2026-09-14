// Stub /api/effy for a page. Handlers are keyed "METHOD /path" (query ignored)
// and return a body (200) or [status, body]. Requests with no handler get a 404
// and are collected in `unhandled`, so a spec can assert the page made no
// unexpected calls. Generated media under /api/effy/media/ is answered empty.
export async function stubApi(page, handlers = {}) {
  const calls = [];
  const unhandled = [];
  await page.route('**/api/effy/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace(/^\/api\/effy/, '');
    const key = `${req.method()} ${path}`;
    let body;
    try { body = req.postDataJSON(); } catch { body = undefined; }
    calls.push({ key, query: Object.fromEntries(url.searchParams), body });
    if (path.startsWith('/media/')) return route.fulfill({ status: 404, body: '' });
    const handler = handlers[key];
    if (handler === undefined) {
      unhandled.push(key);
      return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ status: 'error', message: `No e2e handler for ${key}` }) });
    }
    let result = typeof handler === 'function' ? await handler(body) : handler;
    let status = 200;
    if (Array.isArray(result)) [status, result] = result;
    return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(result ?? {}) });
  });
  return { calls, unhandled, callsTo: (key) => calls.filter((c) => c.key === key) };
}

export const signedOut = { 'GET /bootstrap': [401, { status: 'error', message: 'Authentication required.' }] };

// Mirrors the engine's _bootstrap_payload for a signed-in owner with one workspace.
export const bootstrap = {
  status: 'ok',
  user: { id: 1, name: 'Asha Rao', email: 'asha@example.in', email_verified: true, is_admin: false },
  org: { id: 1, name: 'Rao Dental', type: 'business', plan: 'Growth' },
  workspaces: [{ id: 'ws_1', dbId: 1, name: 'Rao Dental Pune', industry: 'Dental clinic', location: 'Pune', logo: '🦷', accent: '#E84A33', managerId: 1 }],
  role: 'Workspace admin',
};

// What the signed-in shell and home screen request, answered with an empty workspace.
export const signedInEmpty = {
  'GET /bootstrap': bootstrap,
  'GET /films': { status: 'ok', films: [] },
  'GET /product-shots': { status: 'ok', shots: [] },
  'GET /library': { status: 'ok', media: [] },
  'GET /posts': { status: 'ok', posts: [] },
  'GET /assistant/recommendations': { status: 'ok', recommendations: [] },
  'GET /integrations': { status: 'ok', integrations: [] },
};
