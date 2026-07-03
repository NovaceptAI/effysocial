import React from 'react';
import { CHANNELS, POST_STATUS } from '../data/sampleData';
import { Badge } from '../../ui';

const LETTER = { instagram: 'Ig', facebook: 'f', linkedin: 'in', youtube: 'Yt', twitter: 'X' };

// Brand icons were removed from lucide-react (trademark) — we render a small
// colored letter badge per channel instead. Consistent + dependency-free.
export function ChannelIcon({ channel, className = 'w-5 h-5' }) {
  const c = CHANNELS[channel];
  return (
    <span
      className={`inline-grid place-items-center rounded-[6px] text-white font-bold leading-none ${className}`}
      style={{ background: c?.color || '#999', fontSize: '0.6rem' }}
      title={c?.label || channel}
    >
      {LETTER[channel] || (channel?.[0] || '?').toUpperCase()}
    </span>
  );
}

export function ChannelDot({ channel, className = 'w-2 h-2' }) {
  return <span className={`rounded-full ${className}`} style={{ background: CHANNELS[channel]?.color }} />;
}

export function PostStatus({ status }) {
  const s = POST_STATUS[status] || { label: status, tone: 'default' };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}
