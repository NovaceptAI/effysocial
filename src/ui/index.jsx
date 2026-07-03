import React from 'react';
import { cn } from '../lib/cn';

// Bright Studio UI primitives (Tailwind). The shared kit every app screen uses.

export function Button({ variant = 'primary', size = 'md', className, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-sm transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/40';
  const variants = {
    primary: 'bg-coral text-white shadow-[0_8px_20px_rgba(232,74,51,0.24)] hover:-translate-y-0.5',
    spark: 'bg-aurora text-white shadow-[0_8px_20px_rgba(255,107,94,0.3)] hover:-translate-y-0.5',
    secondary: 'bg-surface2 text-ink border border-line hover:border-coral',
    ghost: 'text-ink hover:bg-surface2',
    railGhost: 'text-rail-ink/80 hover:bg-rail-soft hover:text-white',
  };
  const sizes = { sm: 'text-sm px-3 py-1.5', md: 'text-[0.95rem] px-4 py-2.5', lg: 'text-base px-6 py-3.5' };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function Card({ className, ...props }) {
  return <div className={cn('bg-surface border border-line rounded-2xl shadow-e2', className)} {...props} />;
}

export function Badge({ tone = 'default', className, children }) {
  const tones = {
    default: 'bg-surface2 text-ink-soft border border-line',
    coral: 'bg-aurora text-white',
    new: 'bg-coral-soft text-coral-ink',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    error: 'bg-error-soft text-error',
    info: 'bg-info-soft text-info',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full', tones[tone], className)}>
      {children}
    </span>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

const TREND_TONE = { up: 'text-success', down: 'text-error', flat: 'text-ink-faint' };

export function MetricCard({ label, value, delta, deltaDir = 'up', hint, phase }) {
  return (
    <Card className="p-5 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-faint uppercase tracking-wide">{label}</span>
        {phase && <Badge tone="new">{phase}</Badge>}
      </div>
      <span className="text-[2rem] font-extrabold tracking-tight tabular-nums text-ink leading-none mt-1">{value}</span>
      <div className="flex items-center gap-2 mt-1">
        {delta != null && (
          <span className={cn('text-sm font-bold tabular-nums', TREND_TONE[deltaDir])}>
            {deltaDir === 'up' ? '↑' : deltaDir === 'down' ? '↓' : '→'} {delta}
          </span>
        )}
        {hint && <span className="text-xs text-ink-faint">{hint}</span>}
      </div>
    </Card>
  );
}

const STATUS_TONE = {
  live: 'success', scheduled: 'info', draft: 'default', paused: 'warning', completed: 'default',
  good: 'success', attention: 'warning', poor: 'error',
};
export function StatusBadge({ status }) {
  return <Badge tone={STATUS_TONE[status] || 'default'}>{status}</Badge>;
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-1 border-b border-line mb-5 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition',
            active === t.id ? 'border-coral text-coral-ink' : 'border-transparent text-ink-soft hover:text-ink',
          )}
        >
          {t.label}{t.count != null && <span className="ml-1.5 text-xs text-ink-faint">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Pacing({ value, max, tone = 'coral' }) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
  const bar = { coral: 'bg-coral', success: 'bg-success', warning: 'bg-warning', error: 'bg-error' }[tone];
  return (
    <div className="w-full h-2 rounded-full bg-surface2 overflow-hidden">
      <div className={cn('h-full rounded-full', bar)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({ icon, title, body, action }) {
  return (
    <div className="text-center py-14 px-6 bg-surface border border-dashed border-line rounded-2xl flex flex-col items-center gap-2">
      {icon && <div className="grid place-items-center w-14 h-14 rounded-full bg-aurora text-white text-2xl mb-1">{icon}</div>}
      <h4 className="text-lg font-bold text-ink">{title}</h4>
      {body && <p className="text-sm text-ink-soft max-w-sm">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
