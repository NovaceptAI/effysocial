import React from 'react';
import { CalendarDays, Lightbulb, ListChecks, Target, TrendingUp } from 'lucide-react';

// A generated marketing plan (onboarding.py normalize_plan shape), read-only.
const CHANNEL_NAMES = {
  instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn', whatsapp: 'WhatsApp',
  google_business: 'Google Business Profile', youtube: 'YouTube', x: 'X',
};

function Section({ icon: Icon, title, children }) {
  return (
    <section aria-label={title} className="rounded-xl border border-line bg-surface p-4">
      <h3 className="flex items-center gap-2 text-sm font-bold text-ink mb-3"><Icon className="w-4 h-4 text-coral-ink" /> {title}</h3>
      {children}
    </section>
  );
}

export default function PlanView({ plan: record }) {
  const plan = record?.plan || {};
  const created = record?.createdAt ? new Date(record.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-ink leading-relaxed">{plan.summary}</p>
        {created && <p className="text-xs text-ink-faint mt-1">Generated {created}{record.inputs?.goals?.length ? ` for: ${record.inputs.goals.join(', ')}` : ''}</p>}
      </div>

      <Section icon={Target} title="Content pillars">
        <ul className="space-y-2.5">
          {(plan.pillars || []).map((p) => (
            <li key={p.name}>
              <div className="flex items-center justify-between text-sm"><span className="font-semibold text-ink">{p.name}</span><span className="tabular-nums text-ink-soft">{p.share}%</span></div>
              <div className="h-1.5 rounded-full bg-surface2 mt-1"><div className="h-full rounded-full bg-coral" style={{ width: `${p.share}%` }} /></div>
              {p.why && <p className="text-xs text-ink-faint mt-1">{p.why}</p>}
            </li>
          ))}
        </ul>
      </Section>

      <div className="grid gap-4 md:grid-cols-2">
        <Section icon={CalendarDays} title="Channels and cadence">
          <ul className="space-y-2 text-sm">
            {(plan.channels || []).map((c) => (
              <li key={c.channel}>
                <span className="font-semibold text-ink">{CHANNEL_NAMES[c.channel] || c.channel}</span>
                <span className="text-ink-soft"> · {c.postsPerWeek} a week</span>
                {c.role && <span className="block text-xs text-ink-faint">{c.role}</span>}
              </li>
            ))}
          </ul>
        </Section>
        {plan.kpis?.length > 0 && (
          <Section icon={TrendingUp} title="What to aim for">
            <ul className="space-y-2 text-sm">
              {plan.kpis.map((k) => (
                <li key={k.metric}>
                  <span className="font-semibold text-ink">{k.metric}</span>{k.target && <span className="text-ink-soft"> · {k.target}</span>}
                  {k.why && <span className="block text-xs text-ink-faint">{k.why}</span>}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      <Section icon={Lightbulb} title={`${(plan.ideas || []).length} post ideas`}>
        <ol className="grid gap-2 sm:grid-cols-2 text-sm">
          {(plan.ideas || []).map((i, n) => (
            <li key={`${n}-${i.title}`} className="rounded-lg bg-surface2/60 px-3 py-2">
              <span className="block font-semibold text-ink">{i.title}</span>
              <span className="block text-xs text-ink-faint">{i.format} · {CHANNEL_NAMES[i.channel] || i.channel} · {i.pillar}</span>
            </li>
          ))}
        </ol>
      </Section>

      {(plan.funnel?.length > 0 || plan.firstWeek?.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {plan.funnel?.length > 0 && (
            <Section icon={TrendingUp} title="From post to customer">
              <ol className="list-decimal pl-5 space-y-1 text-sm text-ink-soft">{plan.funnel.map((f) => <li key={f}>{f}</li>)}</ol>
            </Section>
          )}
          {plan.firstWeek?.length > 0 && (
            <Section icon={ListChecks} title="This week">
              <ul className="list-disc pl-5 space-y-1 text-sm text-ink-soft">{plan.firstWeek.map((f) => <li key={f}>{f}</li>)}</ul>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}
