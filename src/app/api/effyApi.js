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
  updateCampaign: (id, payload) =>
    http(`/campaigns/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((d) => d.campaign),
  campaignAssembly: (id) => http(`/campaigns/${id}/assembly`),

  // Brand Brain
  getBrand: (workspaceId) => http(`/brand?workspace=${encodeURIComponent(workspaceId)}`).then((d) => d.brain),
  saveBrandFact: (payload) =>
    http('/brand/fact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  testBrandVoice: (workspaceId, prompt) =>
    http('/brand/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace: workspaceId, prompt }) }),

  // AI Studio
  generateStudio: (payload) =>
    http('/studio/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  studioContext: (workspaceId) => http(`/studio/context?workspace=${encodeURIComponent(workspaceId)}`),
  studioImage: (payload) =>
    http('/studio/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  studioRefine: (payload) =>
    http('/studio/refine', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  studioVideoStart: (payload) =>
    http('/studio/video/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  studioVideoStatus: (payload) =>
    http('/studio/video/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  storyPlan: (payload) =>
    http('/studio/story/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  storyScene: (payload) =>
    http('/studio/story/scene', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  storyStitch: (payload) =>
    http('/studio/story/stitch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  sendToApproval: (payload) =>
    http('/studio/send-to-approval', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),

  // Media Library — asset catalogue
  listMedia: (workspaceId, type) =>
    http(`/library?workspace=${encodeURIComponent(workspaceId)}${type ? `&type=${type}` : ''}`).then((d) => d.media),
  uploadMedia: (workspaceId, file) => {
    const fd = new FormData();
    fd.append('workspace', workspaceId);
    fd.append('file', file);
    return http('/library/upload', { method: 'POST', body: fd }).then((d) => d.media);
  },
  deleteMedia: (id) => http(`/library/${id}`, { method: 'DELETE' }),
  animateMedia: (payload) =>
    http('/studio/animate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),

  // Ideas — content backlog
  listIdeas: (workspaceId) => http(`/ideas?workspace=${encodeURIComponent(workspaceId)}`).then((d) => d.ideas),
  createIdea: (payload) =>
    http('/ideas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((d) => d.idea),
  updateIdea: (id, payload) =>
    http(`/ideas/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((d) => d.idea),
  deleteIdea: (id) => http(`/ideas/${id}`, { method: 'DELETE' }),

  // Strategy intelligence (real trends + competitors)
  strategyTrends: (workspaceId) => http(`/strategy/trends?workspace=${encodeURIComponent(workspaceId)}`),
  strategyCompetitors: (workspaceId) => http(`/strategy/competitors?workspace=${encodeURIComponent(workspaceId)}`).then((d) => d.competitors),

  // Publish
  listPosts: (workspaceId) => http(`/posts?workspace=${encodeURIComponent(workspaceId)}`).then((d) => d.posts),
  createPost: (payload) =>
    http('/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((d) => d.post),
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
  leadAnalytics: (workspaceId) => http(`/analytics/leads?workspace=${encodeURIComponent(workspaceId)}`),
  revenueAnalytics: (workspaceId) => http(`/analytics/revenue?workspace=${encodeURIComponent(workspaceId)}`),
  creativeAnalytics: (workspaceId) => http(`/analytics/creative?workspace=${encodeURIComponent(workspaceId)}`),
  adsDashboard: (workspaceId) => http(`/ads/dashboard?workspace=${encodeURIComponent(workspaceId)}`),

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
  getLead: (id) => http(`/leads/${id}`).then((d) => d.lead),
  createLead: (payload) =>
    http('/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((d) => d.lead),
  updateLead: (id, payload) =>
    http(`/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((d) => d.lead),
  convertLead: (conversationId) => http(`/conversations/${conversationId}/convert-lead`, { method: 'POST' }),

  // Team
  listTeam: () => http('/team').then((d) => d.members),

  // Integrations (Phase 3)
  listIntegrations: (workspaceId) => http(`/integrations?workspace=${encodeURIComponent(workspaceId)}`).then((d) => d.integrations),
  connectIntegration: (provider, workspaceId) =>
    http(`/integrations/${provider}/connect`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace: workspaceId }) }),
  disconnectIntegration: (provider, workspaceId) =>
    http(`/integrations/${provider}/disconnect`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace: workspaceId }) }),
  connectInstagramToken: (workspaceId, token) =>
    http('/integrations/instagram/connect-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace: workspaceId, token }) }),
  publishInstagram: (workspaceId, imageUrl, caption) =>
    http('/publish/instagram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace: workspaceId, imageUrl, caption }) }),

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

  // Convert — landing pages
  listLanding: (workspaceId) => http(`/landing?workspace=${encodeURIComponent(workspaceId)}`).then((d) => d.pages),
  createLanding: (payload) =>
    http('/landing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((d) => d.page),
  updateLanding: (id, payload) =>
    http(`/landing/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((d) => d.page),
  landingAiCopy: (id, topic) =>
    http(`/landing/${id}/ai-copy`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic }) }),
  // public (no auth)
  publicLanding: (slug) => http(`/public/landing/${slug}`).then((d) => d.page),

  // Convert — link-in-bio
  listBio: (workspaceId) => http(`/bio?workspace=${encodeURIComponent(workspaceId)}`).then((d) => d.pages),
  createBio: (payload) =>
    http('/bio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((d) => d.page),
  updateBio: (id, payload) =>
    http(`/bio/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((d) => d.page),
  // public (no auth)
  publicBio: (slug) => http(`/public/bio/${slug}`).then((d) => d.page),
  publicBioClick: (slug, linkId) =>
    http(`/public/bio/${slug}/click`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ linkId }) }),

  // Convert — conversion tracking centre
  getTracking: (workspaceId) => http(`/tracking?workspace=${encodeURIComponent(workspaceId)}`),
  sendTestEvent: (payload) =>
    http('/tracking/test-event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((d) => d.event),

  // Convert — follow-up automation
  listFollowups: (workspaceId) => http(`/followups?workspace=${encodeURIComponent(workspaceId)}`).then((d) => d.workflows),
  createFollowup: (payload) =>
    http('/followups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((d) => d.workflow),
  updateFollowup: (id, payload) =>
    http(`/followups/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((d) => d.workflow),
  followupRuns: (id) => http(`/followups/${id}/runs`).then((d) => d.runs),
  followupDryRun: (id, lead) =>
    http(`/followups/${id}/dry-run`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lead }) }).then((d) => d.log),
};
