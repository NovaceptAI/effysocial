// Connecting an account opens the provider's sign-in in its own tab, so the page you were on
// (onboarding, Integrations) stays put. The provider sends that tab back to /connected/<page>
// (engine oauth.RETURN_PATHS "-tab"), which reports how it went here over a BroadcastChannel
// and closes. If the browser blocked the new tab, the sign-in happens in this tab and
// /connected finds nobody listening, so it carries on to the page with the result in its URL.
const CHANNEL = 'effy-connect';

function channel() {
  return typeof BroadcastChannel === 'function' ? new BroadcastChannel(CHANNEL) : null;
}

// Must run straight from the click (before any await), or the browser blocks the tab.
export function openBlankTab() {
  const tab = window.open('', '_blank');
  if (tab) {
    try { tab.opener = null; } catch { /* the provider's page must not reach back into this one */ }
  }
  return tab;
}

// Start a connection: `request` asks the engine for the provider's sign-in address.
// Resolves to the engine's answer, plus `tab` when the sign-in opened in a new tab.
export async function startConnect(request) {
  const tab = openBlankTab();
  let r;
  try {
    r = await request();
  } catch (e) {
    tab?.close();
    throw e;
  }
  if (r.state === 'redirect' && r.redirect) {
    if (tab) {
      tab.location.href = r.redirect;
      return { ...r, tab };
    }
    window.location.assign(r.redirect);
    return r;
  }
  tab?.close();
  return r;
}

// Calls `onGone` once the tab is closed (finished or abandoned). Returns a stop function.
export function watchTab(tab, onGone, every = 800) {
  const t = setInterval(() => {
    if (!tab || tab.closed) { clearInterval(t); onGone(); }
  }, every);
  return () => clearInterval(t);
}

// The page that opened the tab: hear each result, and acknowledge it so the tab closes.
export function listenForResults(onResult) {
  const bc = channel();
  if (!bc) return () => {};
  bc.onmessage = (e) => {
    const m = e.data || {};
    if (m.type !== 'result') return;
    bc.postMessage({ type: 'ack', id: m.id });
    onResult({ provider: m.provider, status: m.status, reason: m.reason || '' });
  };
  return () => bc.close();
}

// The /connected page: tell whoever opened the tab. Resolves true when a page heard it.
export function reportResult(result, wait = 700) {
  const bc = channel();
  if (!bc) return Promise.resolve(false);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return new Promise((resolve) => {
    const done = (heard) => { clearTimeout(timer); bc.close(); resolve(heard); };
    const timer = setTimeout(() => done(false), wait);
    bc.onmessage = (e) => { if (e.data?.type === 'ack' && e.data.id === id) done(true); };
    bc.postMessage({ type: 'result', id, ...result });
  });
}
