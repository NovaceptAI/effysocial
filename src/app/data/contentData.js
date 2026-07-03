// Mock data for the Content module (Ideas, Media Library, Templates).

export const IDEA_STAGES = ['Captured', 'Researching', 'Ready', 'In production', 'Scheduled'];

export function ideasFor(ws) {
  return [
    { id: 'i1', title: 'Myth vs fact reel series', note: 'From Trends — format outperforming 3×.', stage: 'Captured', source: 'trend', assignee: ws.manager, due: 'Jul 8' },
    { id: 'i2', title: 'EMI explainer carousel', note: 'Frequent question in DMs.', stage: 'Captured', source: 'mention', assignee: ws.manager, due: 'Jul 10' },
    { id: 'i3', title: 'Customer story — Priya', note: 'Consent received; shoot pending.', stage: 'Researching', source: 'manual', assignee: 'Karan Patel', due: 'Jul 12', campaign: 'Monsoon' },
    { id: 'i4', title: 'Behind-the-scenes day', note: 'Script drafted.', stage: 'Ready', source: 'manual', assignee: 'Neha Verma', due: 'Jul 6' },
    { id: 'i5', title: 'Festive teaser', note: 'Waiting on offer confirmation.', stage: 'Ready', source: 'trend', assignee: ws.manager, due: 'Jul 20', campaign: 'Festive' },
    { id: 'i6', title: 'FAQ story series', note: 'Recording tomorrow.', stage: 'In production', source: 'mention', assignee: 'Karan Patel', due: 'Jul 4' },
    { id: 'i7', title: 'Monsoon offer reel', note: 'Approved — scheduling.', stage: 'Scheduled', source: 'trend', assignee: ws.manager, due: 'Jul 2', campaign: 'Monsoon' },
  ];
}

export function mediaFor(ws) {
  const t = (h) => ({ thumbHue: h });
  return [
    { id: 'm1', name: 'clinic-exterior.jpg', type: 'image', tags: ['brand', 'location'], uses: 6, rights: 'owned', ...t(18) },
    { id: 'm2', name: 'team-photo-2026.jpg', type: 'image', tags: ['team'], uses: 12, rights: 'owned', ...t(150) },
    { id: 'm3', name: 'testimonial-priya.mp4', type: 'video', tags: ['testimonial', 'approved'], uses: 3, rights: 'consent', ...t(260) },
    { id: 'm4', name: 'logo-primary.png', type: 'logo', tags: ['brand'], uses: 48, rights: 'owned', ...t(8) },
    { id: 'm5', name: 'monsoon-campaign-hero.png', type: 'image', tags: ['campaign', 'approved'], uses: 4, rights: 'owned', ...t(200) },
    { id: 'm6', name: 'stock-smile-01.jpg', type: 'image', tags: ['stock'], uses: 2, rights: 'expires Sep 2026', expiring: true, ...t(40) },
    { id: 'm7', name: 'festive-teaser.mp4', type: 'video', tags: ['campaign'], uses: 0, rights: 'owned', ...t(320) },
    { id: 'm8', name: 'price-card-template.png', type: 'image', tags: ['template'], uses: 9, rights: 'owned', ...t(90) },
  ];
}

export const TEMPLATE_CATEGORIES = ['All', 'Industry', 'Channel', 'Campaign', 'Brand'];

export function templatesFor(ws) {
  return [
    { id: 't1', name: 'Offer announcement', category: 'Campaign', channel: 'instagram', locked: true, fields: ['offer', 'price', 'date'] },
    { id: 't2', name: 'Tip of the week', category: 'Industry', channel: 'instagram', locked: false, fields: ['tip', 'cta'] },
    { id: 't3', name: 'Customer testimonial', category: 'Brand', channel: 'facebook', locked: true, fields: ['quote', 'name'] },
    { id: 't4', name: 'Festival greeting', category: 'Campaign', channel: 'instagram', locked: false, fields: ['festival', 'offer'] },
    { id: 't5', name: 'Team spotlight', category: 'Brand', channel: 'linkedin', locked: false, fields: ['name', 'role'] },
    { id: 't6', name: 'Before / After', category: 'Industry', channel: 'instagram', locked: true, fields: ['service', 'duration'] },
  ];
}
