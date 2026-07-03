// NovaPost API client → shared backend via /novapost/api (nginx strips the
// prefix). A client fork only changes VITE_API_BASE to point at the hosted
// AI backend.
const BASE = import.meta.env.VITE_API_BASE || '/api';

const NO_REDIRECT_PATHS = ['/auth/me', '/auth/logout'];

let redirecting = false;

async function request(path, options = {}) {
  // FormData (file uploads) must not get a forced JSON Content-Type — the
  // browser sets the multipart boundary itself.
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    cache: 'no-store',
    headers: isForm
      ? { ...(options.headers || {}) }
      : { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (res.status === 401 && !NO_REDIRECT_PATHS.includes(path) && !redirecting) {
    redirecting = true;
    const current = window.location.pathname + window.location.search;
    window.location.assign(`/login?from=${encodeURIComponent(current)}`);
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { ok: res.ok, status: res.status, body };
}

export const api = {
  // Platform session (delegated to the NovaceptAI identity service)
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  loginWithUserid: (userid) =>
    request('/auth/login-userid', { method: 'POST', body: JSON.stringify({ userid }) }),

  // Post Studio
  getTrends: (brief) =>
    request('/social/trends', { method: 'POST', body: JSON.stringify(brief) }),
  generatePost: (brief) =>
    request('/social/generate', { method: 'POST', body: JSON.stringify(brief) }),
  generateImage: (imagePrompt, aspect) =>
    request('/social/image', {
      method: 'POST',
      body: JSON.stringify({ image_prompt: imagePrompt, aspect }),
    }),

  // Campaign Generator (partner drafts, compliance-guarded)
  getCampaignOptions: () => request('/social/campaign/options'),
  generateCampaign: (req) =>
    request('/social/campaign', { method: 'POST', body: JSON.stringify(req) }),

  // Leadership Photo Experience — guest photo in, "with the CEO" image out.
  createCeoPhoto: (photoFile) => {
    const form = new FormData();
    form.append('photo', photoFile);
    return request('/social/photo', { method: 'POST', body: form });
  },

  // Lip Sync (Sync Labs / sync.so)
  getDubOptions: () => request('/lipsync/dub-options'),
  submitLipSync: (
    videoFile,
    audioFile,
    { dryRun = false, mode = 'manual', targetLanguage = null, voiceId = null } = {},
  ) => {
    const form = new FormData();
    form.append('video', videoFile);
    form.append('mode', mode);
    if (mode === 'manual' && audioFile) form.append('audio', audioFile);
    if (mode === 'auto_dub') {
      if (targetLanguage) form.append('target_language', targetLanguage);
      if (voiceId) form.append('voice_id', voiceId);
    }
    if (dryRun) form.append('dry_run', '1');
    return request('/lipsync/submit', { method: 'POST', body: form });
  },
  getLipSyncStatus: (jobId) => request(`/lipsync/status/${jobId}`),

  // AI Caller — public browser voice (EffySocial sales agent). Phone calling
  // is intentionally not exposed publicly.
  startVoiceSession: (voiceKey) =>
    request('/inhouse/public/session', {
      method: 'POST',
      body: JSON.stringify({ persona: 'effysocial_sales', ...(voiceKey ? { voice_key: voiceKey } : {}) }),
    }),
  endVoiceSession: (jobId) =>
    request(`/inhouse/public/session/${jobId}/end`, { method: 'POST' }),
};
