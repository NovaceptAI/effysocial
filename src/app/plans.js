// What each plan includes, for the app shell (G22). The engine enforces the same split
// (novalab-engine app/tools/effy/plans.py); this decides what to show, not what's allowed.
export const FEATURES = {
  marketing: { label: 'Performance Marketing', plan: 'Growth' },
  conversion: { label: 'Ads, landing pages, forms and leads', plan: 'Pro' },
};

export const PLAN_SUMMARY = [
  { name: 'Creative', credits: 150, workspaces: 1, seats: 1, includes: 'AI Studio, Ad Films, Product Shots and Brand Brain' },
  { name: 'Growth', credits: 500, workspaces: 1, seats: 2, includes: 'Creative, plus campaigns, calendar and approvals, inbox and organic analytics' },
  { name: 'Pro', credits: 1500, workspaces: 3, seats: 5, includes: 'Growth, plus ads, landing pages and websites, forms, leads, follow-ups and full analytics' },
  { name: 'Agency', credits: 6000, workspaces: 15, seats: 20, includes: 'Pro, with room for 15 client workspaces and 20 seats' },
];

// App routes and the feature each needs; anything not listed is open on every plan.
const ROUTE_FEATURES = [
  ['conversion', ['/app/ads', '/app/creatives', '/app/audiences', '/app/budgets', '/app/rules', '/app/sites', '/app/landing',
    '/app/bio', '/app/forms', '/app/pipeline', '/app/followups', '/app/tracking', '/app/engage-leads',
    '/app/analytics/ads', '/app/analytics/leads', '/app/analytics/revenue', '/app/analytics/creative']],
  ['marketing', ['/app/home', '/app/plan', '/app/campaigns', '/app/workflows', '/app/launch', '/app/playbooks', '/app/trends',
    '/app/competitors', '/app/listening', '/app/calendar', '/app/scheduled', '/app/approvals', '/app/published', '/app/inbox',
    '/app/comments', '/app/reviews', '/app/analytics/organic', '/app/reports', '/app/google-business']],
];

export function featureForPath(pathname) {
  for (const [feature, prefixes] of ROUTE_FEATURES) {
    if (prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return feature;
  }
  return null;
}

// Without plan details (an older session payload), show everything; the engine still enforces.
export function hasFeature(planInfo, feature) {
  return !feature || !planInfo || planInfo.features.includes(feature);
}
