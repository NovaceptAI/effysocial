import React from 'react';
import { Info } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { formatInZone, orgZone } from '../timezone';

// What a section is based on (launch plan 5.11, G43): its source, as of when, what it
// covered and what it is not. Every strategy section shows one, so a suggestion is
// never mistaken for measured data.
const DAY = { day: 'numeric', month: 'short', year: 'numeric' };

export default function SourceNote({ basis, className = '' }) {
  const { org } = useWorkspace();
  if (!basis) return null;
  // A plain date is already the organisation's day; a moment is shown in its time zone.
  const day = (iso) => (iso.length === 10
    ? new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { ...DAY, timeZone: 'UTC' })
    : formatInZone(iso, orgZone(org), DAY));
  return (
    <p className={`mt-3 flex items-start gap-1.5 text-[0.7rem] leading-relaxed text-ink-faint ${className}`} aria-label="Source">
      <Info className="w-3.5 h-3.5 shrink-0 mt-px" />
      <span>
        <span className="font-semibold text-ink-soft">Source:</span> {basis.source}
        {basis.asOf && <> · as of {day(basis.asOf)}</>}
        {basis.covers && <> · covers {basis.covers.charAt(0).toLowerCase() + basis.covers.slice(1)}</>}
        {basis.limits && <>. {basis.limits}</>}
      </span>
    </p>
  );
}
