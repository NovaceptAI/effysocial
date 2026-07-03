// Mock data for the Strategy module (Marketing Plan, Trends, Competitors,
// Social Listening). Workspace-derived so switching clients changes the story.

export function marketingPlan(ws) {
  return {
    pillars: [
      { name: 'Educational', pct: 30, actual: 34, color: 'var(--dv-3)' },
      { name: 'Product', pct: 25, actual: 22, color: 'var(--dv-2)' },
      { name: 'Engagement', pct: 20, actual: 18, color: 'var(--dv-5)' },
      { name: 'Customer proof', pct: 15, actual: 16, color: 'var(--dv-4)' },
      { name: 'Promotional', pct: 10, actual: 10, color: 'var(--dv-1)' },
    ],
    platforms: ws.channels,
    split: { organic: 65, paid: 35 },
    themes: ['Monsoon care series', 'Customer success stories', 'Behind-the-scenes', 'Festive offer ramp-up'],
    frequency: '5 posts/week + 2 reels',
    kpis: ['+18% qualified leads', 'CPL under ₹300', 'Engagement rate > 5%'],
    budget: ws.monthlySpend,
    risks: ['Ad costs rise near festive season', 'Limited creative variants may fatigue faster'],
  };
}

export function trends(ws) {
  const ind = ws.industry.toLowerCase();
  return {
    trending: [
      { topic: `Monsoon ${ind} tips`, heat: 'hot', why: 'Seasonal search spike this week.' },
      { topic: 'Short-form "myth vs fact" reels', heat: 'hot', why: 'Format outperforming static 3× in your niche.' },
      { topic: 'Customer transformation stories', heat: 'warm', why: 'High saves + shares across peers.' },
      { topic: 'Festive early-bird offers', heat: 'warm', why: 'Competitors ramping promos.' },
    ],
    hashtags: [`${ws.location.replace(/\s/g, '')}`, 'MonsoonCare', 'BeforeAfter', 'AskTheExpert', 'FestiveOffer'],
    formats: ['Reels (myth-busting)', 'Carousels (how-to)', 'Story polls', 'UGC testimonials'],
    gaps: ['No FAQ content this month', 'Zero video testimonials published', 'Underusing Story stickers'],
    seasonal: ['Monsoon (now)', 'Festive season (6 weeks out)', 'Year-end offers'],
  };
}

export function competitors(ws) {
  return [
    { name: 'Local Competitor A', freq: '6/week', platforms: ['instagram', 'facebook'], engagement: 4.1, sov: 34, topPost: 'Festival offer reel', offers: 'Flat 20% this month' },
    { name: 'Local Competitor B', freq: '9/week', platforms: ['instagram', 'youtube'], engagement: 5.6, sov: 41, topPost: 'Customer story carousel', offers: 'Free first consult' },
    { name: `${ws.name} (you)`, freq: '5/week', platforms: ws.channels, engagement: 5.4, sov: 25, topPost: 'Tip of the week', offers: 'No-cost EMI', you: true },
  ];
}

export function listening(ws) {
  return {
    stats: { positive: 62, neutral: 26, negative: 12 },
    sentimentSeries: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'].map((w, i) => ({
      week: w, positive: 40 + i * 3 + (i % 2) * 4, negative: 14 - i,
    })),
    keywords: ['pricing', 'appointment', 'friendly staff', 'wait time', 'EMI', 'recommend'],
    mentions: [
      { author: 'Priya K.', text: `Anyone been to ${ws.name}? Thinking of booking.`, sentiment: 'neutral', intent: 'purchase', source: 'twitter', time: '20m ago' },
      { author: 'Rahul M.', text: `Great experience at ${ws.name}, highly recommend!`, sentiment: 'positive', intent: 'advocacy', source: 'instagram', time: '2h ago' },
      { author: 'Anon', text: 'Waited too long past appointment time.', sentiment: 'negative', intent: 'complaint', source: 'google', time: '5h ago' },
      { author: 'Sneha D.', text: 'Do they offer EMI options?', sentiment: 'neutral', intent: 'purchase', source: 'facebook', time: '6h ago' },
    ],
  };
}
