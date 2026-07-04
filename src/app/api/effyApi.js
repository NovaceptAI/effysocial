// Thin client for the EffySocial product API (/api/effy). Same-origin, sends
// the session cookie. Used by TanStack Query hooks in the modules.
const BASE = '/api/effy';

async function http(path, opts = {}) {
  const res = await fetch(BASE + path, { credentials: 'include', ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export const effyApi = {
  listCampaigns: (workspaceId) => http(`/campaigns?workspace=${encodeURIComponent(workspaceId)}`).then((d) => d.campaigns),
  getCampaign: (id) => http(`/campaigns/${id}`).then((d) => d.campaign),
  createCampaign: (payload) =>
    http('/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((d) => d.campaign),

  // Brand Brain
  getBrand: (workspaceId) => http(`/brand?workspace=${encodeURIComponent(workspaceId)}`).then((d) => d.brain),
  saveBrandFact: (payload) =>
    http('/brand/fact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  testBrandVoice: (workspaceId, prompt) =>
    http('/brand/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace: workspaceId, prompt }) }),

  // AI Studio
  generateStudio: (payload) =>
    http('/studio/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),

  // Publish
  listPosts: (workspaceId) => http(`/posts?workspace=${encodeURIComponent(workspaceId)}`).then((d) => d.posts),
  approvePost: (id) => http(`/posts/${id}/approve`, { method: 'POST' }),
  requestChanges: (id, comment) =>
    http(`/posts/${id}/request-changes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment }) }),
  commentPost: (id, text) =>
    http(`/posts/${id}/comment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }),
  schedulePost: (id, payload = {}) =>
    http(`/posts/${id}/schedule`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),

  // Engage
  listConversations: (workspaceId) => http(`/conversations?workspace=${encodeURIComponent(workspaceId)}`).then((d) => d.conversations),
  replyConversation: (id, text) =>
    http(`/conversations/${id}/reply`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }),
  closeConversation: (id) => http(`/conversations/${id}/close`, { method: 'POST' }),
  listReviews: (workspaceId) => http(`/reviews?workspace=${encodeURIComponent(workspaceId)}`).then((d) => d.reviews),
  respondReview: (id) => http(`/reviews/${id}/respond`, { method: 'POST' }),

  // Analytics
  organicAnalytics: (workspaceId) => http(`/analytics/organic?workspace=${encodeURIComponent(workspaceId)}`),

  // Effy AI assistant
  assistantChat: (workspaceId, message, history = []) =>
    http('/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace: workspaceId, message, history }),
    }),
  assistantRecommendations: (workspaceId) =>
    http(`/assistant/recommendations?workspace=${encodeURIComponent(workspaceId)}`).then((d) => d.recommendations),

  // Convert — leads
  listLeads: (workspaceId) => http(`/leads?workspace=${encodeURIComponent(workspaceId)}`).then((d) => d.leads),
  createLead: (payload) =>
    http('/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((d) => d.lead),
  updateLead: (id, payload) =>
    http(`/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((d) => d.lead),
  convertLead: (conversationId) => http(`/conversations/${conversationId}/convert-lead`, { method: 'POST' }),

  // Convert — forms
  listForms: (workspaceId) => http(`/forms?workspace=${encodeURIComponent(workspaceId)}`).then((d) => d.forms),
  createForm: (payload) =>
    http('/forms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((d) => d.form),
  updateForm: (id, payload) =>
    http(`/forms/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((d) => d.form),
  formSubmissions: (id) => http(`/forms/${id}/submissions`).then((d) => d.submissions),
  // public (no auth)
  publicForm: (slug) => http(`/public/forms/${slug}`).then((d) => d.form),
  publicSubmit: (slug, payload) =>
    http(`/public/forms/${slug}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
};
