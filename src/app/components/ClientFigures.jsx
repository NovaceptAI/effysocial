import React from 'react';
import { cn } from '../../lib/cn';

// Small pieces shared by the Clients table, the workspace chooser and the agency
// overview. Every value comes from /workspaces/summary (G21).

const HEALTH = {
  good: { dot: 'bg-success', label: 'Good' },
  attention: { dot: 'bg-warning', label: 'Needs attention' },
  poor: { dot: 'bg-error', label: 'Poor' },
  none: { dot: 'bg-line', label: 'No activity' },
};

export function HealthDot({ health, kind }) {
  const h = HEALTH[health?.level] || HEALTH.none;
  const text = `${kind}: ${h.label}${health?.reason ? ` — ${health.reason}` : ''}`;
  return <span role="img" aria-label={text} title={text} className={cn('inline-block w-2 h-2 rounded-full', h.dot)} />;
}

const CHANNEL_NAMES = {
  instagram: 'Instagram', facebook_page: 'Facebook Page', linkedin: 'LinkedIn', google_business: 'Google Business Profile',
  meta_ads: 'Meta Ads', google_ads: 'Google Ads', ga4: 'Google Analytics 4', whatsapp: 'WhatsApp',
};

export function channelList(channels = []) {
  return channels.map((c) => CHANNEL_NAMES[c] || c).join(', ');
}

export function sinceLabel(iso, now = new Date()) {
  if (!iso) return 'No activity yet';
  const then = new Date(iso);
  const days = Math.floor((now - then) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return then.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
