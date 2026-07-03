// Seeded sample data for the mock-first build. Realistic Indian SMB/agency
// clients so the product looks operational. Swapped for live API data later
// via the integration-adapter layer.

export const ORG = {
  id: 'org_effybiz',
  name: 'EffyBiz Digital',
  type: 'agency', // 'agency' | 'business' | 'freelancer'
  plan: 'Agency Growth',
};

export const WORKSPACES = [
  {
    id: 'ws_brightsmile', name: 'BrightSmile Dental', industry: 'Dental clinic',
    logo: '🦷', accent: '#0f766e', manager: 'Aarti Shah', location: 'Pune',
    channels: ['instagram', 'facebook', 'google'], organicHealth: 'good', paidHealth: 'attention',
    monthlySpend: 45000, leads: 128, approvals: 3, alerts: 1, lastReport: '2026-06-01',
  },
  {
    id: 'ws_sahakaar', name: 'Sahakaar Co-op Bank', industry: 'Cooperative bank',
    logo: '🏦', accent: '#b45309', manager: 'Rohan Mehta', location: 'Nagpur',
    channels: ['instagram', 'facebook', 'linkedin'], organicHealth: 'good', paidHealth: 'good',
    monthlySpend: 82000, leads: 214, approvals: 6, alerts: 0, lastReport: '2026-06-02',
  },
  {
    id: 'ws_pawsome', name: 'Pawsome Pet Care', industry: 'Pet-care brand',
    logo: '🐾', accent: '#db2777', manager: 'Aarti Shah', location: 'Mumbai',
    channels: ['instagram', 'facebook', 'youtube'], organicHealth: 'attention', paidHealth: 'good',
    monthlySpend: 38000, leads: 96, approvals: 2, alerts: 2, lastReport: '2026-05-28',
  },
  {
    id: 'ws_urbannest', name: 'UrbanNest Realty', industry: 'Real-estate broker',
    logo: '🏠', accent: '#e84a33', manager: 'Rohan Mehta', location: 'Pune',
    channels: ['instagram', 'facebook', 'google'], organicHealth: 'good', paidHealth: 'attention',
    monthlySpend: 120000, leads: 342, approvals: 9, alerts: 1, lastReport: '2026-06-03',
  },
  {
    id: 'ws_tadka', name: 'Tadka House', industry: 'Restaurant',
    logo: '🍛', accent: '#f59e0b', manager: 'Neha Verma', location: 'Indore',
    channels: ['instagram', 'facebook'], organicHealth: 'good', paidHealth: 'good',
    monthlySpend: 28000, leads: 64, approvals: 1, alerts: 0, lastReport: '2026-05-30',
  },
  {
    id: 'ws_lumira', name: 'Lumira Skincare', industry: 'D2C ecommerce',
    logo: '✨', accent: '#7c3aed', manager: 'Neha Verma', location: 'Bengaluru',
    channels: ['instagram', 'facebook', 'youtube', 'google'], organicHealth: 'good', paidHealth: 'good',
    monthlySpend: 175000, leads: 488, approvals: 4, alerts: 1, lastReport: '2026-06-01',
  },
];

export const CURRENT_USER = {
  id: 'u_aarti', name: 'Aarti Shah', email: 'aarti@effybiz.in',
  role: 'Account manager', avatar: 'AS',
};

// ---- Overview sample metrics (per workspace, business view) ----
export function overviewMetrics(ws) {
  const cpl = Math.round((ws.monthlySpend / Math.max(ws.leads, 1)));
  return {
    revenue: ws.monthlySpend * (3.2 + (ws.id.length % 3) * 0.4),
    spend: ws.monthlySpend,
    leads: ws.leads,
    qualified: Math.round(ws.leads * 0.42),
    customers: Math.round(ws.leads * 0.12),
    cpl,
    roas: +(3.2 + (ws.id.length % 3) * 0.4).toFixed(1),
    bestChannel: ws.channels[0],
  };
}

// 8-week trend series for the overview chart
export function trendSeries(ws) {
  const base = ws.leads / 8;
  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
  let seedLeads = base * 0.7, seedSpend = ws.monthlySpend / 8 * 0.8;
  return weeks.map((w, i) => {
    seedLeads += base * (0.04 + (Math.sin(i * 1.3) + 1) * 0.12);
    seedSpend += (ws.monthlySpend / 8) * (0.02 + (Math.cos(i) + 1) * 0.05);
    return {
      week: w,
      leads: Math.round(seedLeads),
      spend: Math.round(seedSpend),
      revenue: Math.round(seedSpend * (2.8 + Math.sin(i) * 0.6)),
    };
  });
}

export const UPCOMING_CONTENT = [
  { id: 1, title: 'Monsoon dental-care reel', channel: 'instagram', when: 'Today · 6:00 PM', status: 'scheduled' },
  { id: 2, title: 'Patient testimonial carousel', channel: 'facebook', when: 'Tomorrow · 11:00 AM', status: 'approval' },
  { id: 3, title: 'Free check-up week — offer post', channel: 'instagram', when: 'Fri · 9:00 AM', status: 'draft' },
];

export const ATTENTION_LEADS = [
  { id: 'l1', name: 'Priya Kulkarni', source: 'Click-to-WhatsApp', interest: 'Braces consult', age: '12m ago', heat: 'hot' },
  { id: 'l2', name: 'Sameer Joshi', source: 'Lead form', interest: 'Root canal', age: '2h ago', heat: 'warm' },
  { id: 'l3', name: 'Anonymous', source: 'Instagram DM', interest: 'Whitening price', age: '4h ago', heat: 'warm' },
];

// ---- Campaigns (the hub object) ----
export const CAMPAIGNS = [
  {
    id: 'cmp_braces', workspaceId: 'ws_brightsmile', name: 'Braces Consult — Monsoon', objective: 'Lead generation',
    status: 'live', owner: 'Aarti Shah', pillar: 'Promotional', channels: ['instagram', 'facebook'],
    start: '2026-06-01', end: '2026-06-30', budget: 60000, spent: 41200,
    kpis: { impressions: 184000, clicks: 5200, leads: 128, qualified: 54, customers: 16, revenue: 384000, cpl: 322, roas: 3.6, ctr: 2.8 },
    counts: { content: 9, ads: 4, landingPages: 1, forms: 1 },
    recommendations: 2,
  },
  {
    id: 'cmp_whitening', workspaceId: 'ws_brightsmile', name: 'Teeth Whitening Offer', objective: 'WhatsApp conversations',
    status: 'scheduled', owner: 'Aarti Shah', pillar: 'Promotional', channels: ['instagram'],
    start: '2026-07-01', end: '2026-07-15', budget: 30000, spent: 0,
    kpis: { impressions: 0, clicks: 0, leads: 0, qualified: 0, customers: 0, revenue: 0, cpl: 0, roas: 0, ctr: 0 },
    counts: { content: 5, ads: 2, landingPages: 1, forms: 1 },
    recommendations: 0,
  },
  {
    id: 'cmp_diwali', workspaceId: 'ws_urbannest', name: 'Diwali Home Buying', objective: 'Lead generation',
    status: 'live', owner: 'Rohan Mehta', pillar: 'Promotional', channels: ['instagram', 'facebook', 'google'],
    start: '2026-06-10', end: '2026-07-10', budget: 200000, spent: 138500,
    kpis: { impressions: 612000, clicks: 18400, leads: 342, qualified: 141, customers: 22, revenue: 4400000, cpl: 405, roas: 4.2, ctr: 3.0 },
    counts: { content: 14, ads: 8, landingPages: 2, forms: 2 },
    recommendations: 3,
  },
  {
    id: 'cmp_glow', workspaceId: 'ws_lumira', name: 'Glow Serum Launch', objective: 'Online sales',
    status: 'live', owner: 'Neha Verma', pillar: 'Product', channels: ['instagram', 'facebook', 'youtube'],
    start: '2026-05-20', end: '2026-06-20', budget: 175000, spent: 161000,
    kpis: { impressions: 980000, clicks: 31200, leads: 488, qualified: 205, customers: 138, revenue: 690000, cpl: 330, roas: 4.3, ctr: 3.2 },
    counts: { content: 22, ads: 11, landingPages: 3, forms: 1 },
    recommendations: 1,
  },
];

export function campaignsFor(workspaceId) {
  return CAMPAIGNS.filter((c) => c.workspaceId === workspaceId);
}
export function getCampaign(id) {
  return CAMPAIGNS.find((c) => c.id === id);
}
export function campaignFunnel(c) {
  const k = c.kpis;
  return [
    { stage: 'Impressions', value: k.impressions, color: 'var(--dv-6)' },
    { stage: 'Clicks', value: k.clicks, color: 'var(--dv-5)' },
    { stage: 'Leads', value: k.leads, color: 'var(--dv-3)' },
    { stage: 'Qualified', value: k.qualified, color: 'var(--dv-2)' },
    { stage: 'Customers', value: k.customers, color: 'var(--dv-1)' },
  ];
}

// ---- Administration: integrations + team ----
// state: connected | partial | expired | available
export const INTEGRATIONS = [
  { name: 'Instagram', category: 'Social publishing', state: 'connected', account: '@brightsmile.dental', lastSync: '5 min ago' },
  { name: 'Facebook Page', category: 'Social publishing', state: 'connected', account: 'BrightSmile Dental', lastSync: '5 min ago' },
  { name: 'LinkedIn', category: 'Social publishing', state: 'expired', account: 'BrightSmile', lastSync: '4 days ago' },
  { name: 'YouTube', category: 'Social publishing', state: 'available', account: null, lastSync: null },
  { name: 'Google Business Profile', category: 'Social publishing', state: 'partial', account: 'BrightSmile Dental', lastSync: '1 hr ago' },
  { name: 'Meta Ads', category: 'Advertising', state: 'connected', account: 'act_4471', lastSync: '12 min ago' },
  { name: 'Google Ads', category: 'Advertising', state: 'available', account: null, lastSync: null },
  { name: 'Google Analytics 4', category: 'Analytics', state: 'connected', account: 'GA4 · 318xxx', lastSync: '20 min ago' },
  { name: 'WhatsApp Cloud API', category: 'Messaging', state: 'partial', account: '+91 98xxx', lastSync: '2 hr ago' },
  { name: 'HubSpot CRM', category: 'CRM', state: 'available', account: null, lastSync: null },
  { name: 'Razorpay', category: 'Payments', state: 'connected', account: 'EffyBiz', lastSync: '1 day ago' },
  { name: 'Google Drive', category: 'Storage', state: 'available', account: null, lastSync: null },
];

export const ROLES = [
  'Agency owner', 'Workspace admin', 'Account manager', 'Strategist', 'Copywriter',
  'Designer', 'Performance marketer', 'Analyst', 'Client approver', 'View-only',
];

export const TEAM = [
  { name: 'Aarti Shah', email: 'aarti@effybiz.in', role: 'Account manager', status: 'active', workspaces: 'All', avatar: 'AS', lastActive: 'Online' },
  { name: 'Rohan Mehta', email: 'rohan@effybiz.in', role: 'Account manager', status: 'active', workspaces: 4, avatar: 'RM', lastActive: '2h ago' },
  { name: 'Neha Verma', email: 'neha@effybiz.in', role: 'Strategist', status: 'active', workspaces: 3, avatar: 'NV', lastActive: '1d ago' },
  { name: 'Karan Patel', email: 'karan@effybiz.in', role: 'Designer', status: 'active', workspaces: 5, avatar: 'KP', lastActive: '3h ago' },
  { name: 'Dr. Mehta', email: 'owner@brightsmile.in', role: 'Client approver', status: 'invited', workspaces: 1, avatar: 'DM', lastActive: '—' },
];

// ---- Reports ----
export const REPORT_TEMPLATES = [
  'Executive summary', 'Organic', 'Advertising', 'Lead', 'Revenue', 'Campaign', 'Client monthly', 'Custom',
];
export function savedReports(ws) {
  return [
    { id: `${ws.id}_rep1`, name: `Monthly Client Report — June`, type: 'Client monthly', period: 'Jun 2026', status: 'shared', generated: '2026-06-30' },
    { id: `${ws.id}_rep2`, name: `Organic Performance — June`, type: 'Organic', period: 'Jun 2026', status: 'draft', generated: '—' },
    { id: `${ws.id}_rep3`, name: `Executive Summary — Q2`, type: 'Executive summary', period: 'Apr–Jun 2026', status: 'scheduled', generated: '2026-07-01' },
  ];
}
export const REPORT_SECTIONS = [
  { id: 'summary', label: 'Executive summary', on: true },
  { id: 'organic', label: 'Organic performance', on: true },
  { id: 'leads', label: 'Leads & enquiries', on: true },
  { id: 'revenue', label: 'Revenue & ROAS', on: true },
  { id: 'ads', label: 'Advertising', on: false },
  { id: 'creative', label: 'Creative performance', on: false },
];

// ---- Organic analytics ----
export function organicAnalytics(ws) {
  const base = ws.leads * 40; // pseudo follower base
  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
  let f = base;
  const followerSeries = weeks.map((w, i) => { f += Math.round(base * (0.01 + (Math.sin(i) + 1) * 0.006)); return { week: w, followers: f }; });
  const reachSeries = weeks.map((w, i) => ({
    week: w,
    reach: Math.round(base * (0.8 + (Math.sin(i * 1.2) + 1) * 0.5)),
    engagement: +(3 + Math.sin(i) * 1.4 + 2).toFixed(1),
  }));
  const topPosts = postsFor(ws).filter((p) => p.status === 'published' && p.metrics)
    .sort((a, b) => b.metrics.reach - a.metrics.reach);
  const demographics = [
    { label: '18–24', value: 22 }, { label: '25–34', value: 41 },
    { label: '35–44', value: 24 }, { label: '45–54', value: 9 }, { label: '55+', value: 4 },
  ];
  // 7 days x 4 dayparts intensity 0–100
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const parts = ['Morning', 'Noon', 'Evening', 'Night'];
  const bestTimes = days.map((d, di) => ({
    day: d,
    cells: parts.map((p, pi) => Math.round(30 + (Math.sin(di + pi * 1.7) + 1) * 35)),
  }));
  return {
    kpis: {
      followers: f, growth: 6.2, reach: reachSeries.at(-1).reach * 8,
      engagementRate: 5.4, profileVisits: Math.round(base * 0.18), linkClicks: Math.round(base * 0.05),
    },
    followerSeries, reachSeries, topPosts, demographics, bestTimes, parts,
    insights: {
      bestPost: topPosts[0]?.title || '—',
      bestFormat: 'Carousel', bestTime: 'Wed evening', bestPillar: 'Educational',
    },
  };
}

// ---- Engage: conversations + reviews ----
const CONVO_TEMPLATES = [
  { kind: 'dm', channel: 'instagram', person: 'Priya Kulkarni', sentiment: 'positive', intent: 'sales', priority: 'high', unread: true,
    msgs: [{ from: 'them', text: 'Hi, what does a braces consult cost? Do you have EMI?', time: '12m ago' }],
    reply: 'Hi Priya! 😊 A consult is free, and yes — we offer no-cost EMI on braces. Want me to hold a slot this week?' },
  { kind: 'comment', channel: 'instagram', person: 'Sameer J.', sentiment: 'neutral', intent: 'question', priority: 'normal', unread: true,
    msgs: [{ from: 'them', text: 'Is the monsoon offer valid on weekends?', time: '40m ago' }],
    reply: 'Yes, the offer is valid all week including weekends. Shall we book you in?' },
  { kind: 'comment', channel: 'facebook', person: 'Rakesh M.', sentiment: 'negative', intent: 'complaint', priority: 'high', unread: true,
    msgs: [{ from: 'them', text: 'Waited 40 mins past my appointment time. Not happy.', time: '1h ago' }],
    reply: '(Routed to a human — complaint) Hi Rakesh, I’m really sorry about the wait. Could you DM your appointment details so we can make this right?' },
  { kind: 'mention', channel: 'twitter', person: '@anita_writes', sentiment: 'positive', intent: 'question', priority: 'normal', unread: false,
    msgs: [{ from: 'them', text: 'Loved my visit today, thank you team! Highly recommend.', time: '3h ago' }],
    reply: 'Thank you so much, Anita! 💙 We loved having you — see you at the next check-up!' },
  { kind: 'dm', channel: 'instagram', person: 'Unknown', sentiment: 'neutral', intent: 'spam', priority: 'low', unread: false,
    msgs: [{ from: 'them', text: 'Earn $$$ from home, click here…', time: '5h ago' }], reply: '' },
];

export function conversationsFor(ws) {
  return CONVO_TEMPLATES.map((c, i) => ({
    id: `${ws.id}_c${i}`, workspaceId: ws.id,
    channel: ws.channels.includes(c.channel) ? c.channel : ws.channels[0],
    kind: c.kind, person: c.person, sentiment: c.sentiment, intent: c.intent,
    priority: c.priority, unread: c.unread, status: 'open', assignee: ws.manager,
    messages: c.msgs, suggestedReply: c.reply,
  }));
}

const REVIEW_TEMPLATES = [
  { source: 'google', author: 'Meera D.', rating: 5, sentiment: 'positive', responded: true, text: 'Very professional and gentle. Explained everything clearly.' },
  { source: 'google', author: 'Karan S.', rating: 4, sentiment: 'positive', responded: false, text: 'Good experience overall, slightly long wait.', reply: 'Thanks Karan! We’re working on reducing wait times — appreciate the feedback.' },
  { source: 'facebook', author: 'Divya R.', rating: 2, sentiment: 'negative', responded: false, text: 'Booking process was confusing.', reply: 'Sorry about that, Divya. We’ve simplified online booking — can we help you reschedule?' },
  { source: 'google', author: 'Aman T.', rating: 5, sentiment: 'positive', responded: true, text: 'Best clinic in the area. Highly recommend!' },
];

export function reviewsFor(ws) {
  return REVIEW_TEMPLATES.map((r, i) => ({ id: `${ws.id}_r${i}`, workspaceId: ws.id, ...r }));
}

// ---- Publish: channels, statuses, posts ----
export const CHANNELS = {
  instagram: { label: 'Instagram', color: '#E1306C' },
  facebook: { label: 'Facebook', color: '#1877F2' },
  linkedin: { label: 'LinkedIn', color: '#0A66C2' },
  youtube: { label: 'YouTube', color: '#FF0000' },
  twitter: { label: 'X', color: '#0f1419' },
};

export const POST_STATUS = {
  idea: { label: 'Idea', tone: 'default' },
  draft: { label: 'Draft', tone: 'default' },
  internal_review: { label: 'Internal review', tone: 'warning' },
  client_review: { label: 'Client review', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  scheduled: { label: 'Scheduled', tone: 'info' },
  published: { label: 'Published', tone: 'success' },
  failed: { label: 'Failed', tone: 'error' },
};

// Reference "today" for the mock calendar.
export const TODAY = '2026-06-29';

// Generic-but-plausible content that reads well for any client.
const POST_TEMPLATES = [
  // published (past)
  { d: '2026-06-20', t: '09:00', ch: 'instagram', type: 'reel', status: 'published', title: 'Behind-the-scenes reel', m: { reach: 12400, engagement: 4.8, likes: 540, comments: 32 } },
  { d: '2026-06-22', t: '18:30', ch: 'facebook', type: 'post', status: 'published', title: 'Customer testimonial', m: { reach: 8800, engagement: 3.6, likes: 210, comments: 18 } },
  { d: '2026-06-24', t: '11:00', ch: 'instagram', type: 'carousel', status: 'published', title: 'Tip of the week carousel', m: { reach: 15600, engagement: 6.1, likes: 720, comments: 41 } },
  { d: '2026-06-26', t: '20:00', ch: 'linkedin', type: 'post', status: 'published', title: 'Industry insight post', m: { reach: 5400, engagement: 5.2, likes: 160, comments: 12 } },
  { d: '2026-06-27', t: '10:00', ch: 'instagram', type: 'story', status: 'failed', title: 'Flash offer story', m: null },
  // in review
  { d: '2026-06-29', t: '17:00', ch: 'instagram', type: 'reel', status: 'client_review', title: 'Monsoon offer reel' },
  { d: '2026-06-30', t: '12:00', ch: 'facebook', type: 'post', status: 'internal_review', title: 'Festive announcement' },
  { d: '2026-07-01', t: '09:30', ch: 'instagram', type: 'carousel', status: 'client_review', title: 'FAQ carousel' },
  // scheduled / approved (future)
  { d: '2026-06-29', t: '19:00', ch: 'facebook', type: 'post', status: 'scheduled', title: 'Weekend special' },
  { d: '2026-07-02', t: '11:00', ch: 'instagram', type: 'post', status: 'scheduled', title: 'New service launch' },
  { d: '2026-07-03', t: '18:00', ch: 'youtube', type: 'short', status: 'approved', title: 'Quick how-to short' },
  { d: '2026-07-05', t: '10:30', ch: 'linkedin', type: 'post', status: 'scheduled', title: 'Team spotlight' },
  // drafts
  { d: '2026-07-06', t: '09:00', ch: 'instagram', type: 'reel', status: 'draft', title: 'Trend remix reel' },
  { d: '2026-07-08', t: '16:00', ch: 'instagram', type: 'carousel', status: 'draft', title: 'Pricing explainer' },
];

export function postsFor(ws) {
  // Only keep channels this workspace actually uses; fall back to instagram.
  return POST_TEMPLATES.map((p, i) => ({
    id: `${ws.id}_p${i}`,
    workspaceId: ws.id,
    channel: ws.channels.includes(p.ch) ? p.ch : ws.channels[0],
    type: p.type,
    status: p.status,
    title: p.title,
    date: p.d,
    time: p.t,
    assignee: ws.manager,
    metrics: p.m || null,
    comments: p.status.includes('review')
      ? [{ author: 'Aarti Shah', text: 'Looks good — tighten the first line?', when: '1h ago', internal: true }]
      : [],
  }));
}

export const ALERTS = [
  { id: 'a1', severity: 'warning', title: 'CPL above target', detail: 'Braces campaign CPL ₹420 vs ₹300 target (last 3 days).', module: 'Advertise' },
  { id: 'a2', severity: 'error', title: 'Instagram token expiring', detail: 'Reconnect BrightSmile Instagram within 4 days to avoid publish failures.', module: 'Integrations' },
];
