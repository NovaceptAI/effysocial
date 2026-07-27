import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowRight, X } from 'lucide-react';

// Cross-sell nudge shown right after a creative deliverable is finished —
// the moment someone has something worth publishing is the moment to point
// them at Performance Marketing (schedule, publish, run ads, track leads).
export default function GrowNudge({ text, to = '/app/home', cta = 'Open Performance Marketing' }) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-coral-tint text-sm">
      <span className="grid place-items-center w-8 h-8 rounded-lg bg-coral text-white shrink-0"><TrendingUp className="w-4 h-4" /></span>
      <span className="flex-1 text-coral-ink font-medium">{text}</span>
      <button type="button" onClick={() => navigate(to)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-coral-ink bg-white/60 hover:bg-white rounded-full px-3 py-1.5 transition shrink-0">
        {cta} <ArrowRight className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={() => setDismissed(true)} title="Dismiss" className="text-coral-ink/50 hover:text-coral-ink bg-transparent shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
