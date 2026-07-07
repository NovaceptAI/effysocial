import React from 'react';
import { cn } from '../lib/cn';

// Bright Studio UI primitives (Tailwind). The shared kit every app screen uses.

export function Button({ variant = 'primary', size = 'md', className, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-[12px] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas';
  const variants = {
    primary: 'bg-coral text-white shadow-coral hover:brightness-95',
    spark: 'bg-aurora text-white shadow-coral hover:brightness-95',
    secondary: 'bg-surface text-ink border border-line hover:bg-surface2',
    ghost: 'text-ink-soft hover:bg-surface2 hover:text-ink',
    railGhost: 'text-rail-ink/80 hover:bg-rail-soft hover:text-white',
  };
  const sizes = { sm: 'text-[0.8rem] px-3.5 py-1.5', md: 'text-[0.9rem] px-4 py-2.5', lg: 'text-[0.95rem] px-6 py-3.5' };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function Card({ className, ...props }) {
  return <div className={cn('bg-surface rounded-2xl shadow-e2', className)} {...props} />;
}

export function Badge({ tone = 'default', className, children }) {
  const tones = {
    default: 'bg-surface2 text-ink-soft',
    coral: 'bg-coral text-white',
    new: 'bg-coral-tint text-coral-ink',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    error: 'bg-error-soft text-error',
    info: 'bg-info-soft text-info',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 text-[0.7rem] font-semibold px-2.5 py-1 rounded-full tracking-wide', tones[tone], className)}>
      {children}
    </span>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="font-display text-[1.9rem] leading-[1.1] font-semibold tracking-tightest text-ink">{title}</h1>
        {subtitle && <p className="mt-2 text-[0.9rem] text-ink-soft leading-relaxed">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

const TREND_TONE = { up: 'text-success', down: 'text-error', flat: 'text-ink-faint' };

export function MetricCard({ label, value, delta, deltaDir = 'up', hint, phase }) {
  return (
    <Card className="p-6 flex flex-col gap-1 transition-shadow duration-200 hover:shadow-e2">
      <div className="flex items-center justify-between">
        <span className="text-[0.7rem] font-bold text-ink-faint uppercase tracking-[0.08em]">{label}</span>
        {phase && <Badge tone="new">{phase}</Badge>}
      </div>
      <span className="text-[2.15rem] font-extrabold tracking-tightest tabular-nums text-ink leading-none mt-1.5">{value}</span>
      <div className="flex items-center gap-2 mt-1.5">
        {delta != null && (
          <span className={cn('inline-flex items-center gap-0.5 text-[0.8rem] font-bold tabular-nums px-1.5 py-0.5 rounded-md',
            deltaDir === 'up' ? 'text-success bg-success-soft/60' : deltaDir === 'down' ? 'text-error bg-error-soft/60' : 'text-ink-faint bg-surface2')}>
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
    <div className="flex items-center gap-1 border-b border-hair mb-5 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors duration-200',
            active === t.id ? 'border-coral text-ink' : 'border-transparent text-ink-faint hover:text-ink-soft',
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
  const bar = {
    coral: 'bg-gradient-to-r from-coral-light to-coral',
    success: 'bg-gradient-to-r from-success/80 to-success',
    warning: 'bg-gradient-to-r from-warning/80 to-warning',
    error: 'bg-gradient-to-r from-error/80 to-error',
  }[tone];
  return (
    <div className="w-full h-2 rounded-full bg-surface2 overflow-hidden">
      <div className={cn('h-full rounded-full transition-all duration-500', bar)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({ icon, title, body, action }) {
  return (
    <div className="text-center py-20 px-6 bg-surface border border-line rounded-2xl flex flex-col items-center gap-2.5">
      {icon && (
        <div className="grid place-items-center w-16 h-16 rounded-2xl bg-coral-tint text-3xl mb-1.5">
          {icon}
        </div>
      )}
      <h4 className="font-display text-xl font-semibold tracking-tight text-ink">{title}</h4>
      {body && <p className="text-sm text-ink-soft max-w-sm leading-relaxed">{body}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
