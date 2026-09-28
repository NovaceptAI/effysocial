import React, { useState } from 'react';
import { cn } from '../../lib/cn';

// A marketing plan on SOSTAC (launch plan 6.18, engine sostac.py), read-only. Six parts as
// steps along the top. The Situation's numbers and the weekly checks are counted by the
// engine — never written by the model — and each says where it comes from.
const CHANNEL_NAMES = {
  instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn', whatsapp: 'WhatsApp',
  google_business: 'Google Business Profile', youtube: 'YouTube', x: 'X', google: 'Google',
};
export const STEPS = [
  ['situation', 'Situation'], ['objectives', 'Objectives'], ['strategy', 'Strategy'],
  ['tactics', 'Tactics'], ['action', 'Action'], ['control', 'Control'],
];
const fmt = (n) => (n == null ? '—' : Number(n).toLocaleString('en-IN'));
const amount = (n) => (n.unit === '%' ? `${fmt(n.value)}%` : n.unit ? `${n.unit} ${fmt(n.value)}` : fmt(n.value));
const day = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '');

function Block({ title, children, className }) {
  return (
    <section aria-label={title} className={cn('rounded-xl border border-line bg-surface p-4', className)}>
      <h3 className="text-sm font-bold text-ink mb-3">{title}</h3>
      {children}
    </section>
  );
}

function Bullets({ items }) {
  if (!items?.length) return <p className="text-sm text-ink-faint">None given.</p>;
  return <ul className="list-disc pl-5 space-y-1 text-sm text-ink-soft">{items.map((x) => <li key={x}>{x}</li>)}</ul>;
}

export function ObjectiveLine({ objective }) {
  if (!objective) return null;
  const { label, unit, baseline, target, by, suggested, measured } = objective;
  return (
    <p className="text-sm text-ink">
      <span className="font-bold">{label}:</span>{' '}
      {target != null ? <>from {measured && baseline != null ? fmt(baseline) : 'not measured'} to <strong>{fmt(target)}</strong> {unit} by {day(by)}</> : <>set a target in the plan brief</>}
      {suggested && target != null && <span className="ml-2 text-[0.7rem] font-bold uppercase tracking-wide rounded bg-warning-soft text-warning px-1.5 py-0.5">Suggested</span>}
    </p>
  );
}

function Situation({ plan }) {
  const s = plan.situation || {};
  const swot = s.swot || {};
  return (
    <div className="space-y-4">
      <Block title="Where things stand">
        <table className="w-full text-sm">
          <tbody>
            {(s.numbers || []).map((n) => (
              <tr key={n.key} className="border-b border-line/60 last:border-0">
                <td className="py-1.5 pr-3 text-ink-soft">
                  {n.label}
                  <span className="block sm:hidden text-xs text-ink-faint">{n.value == null ? n.why : n.source}</span>
                </td>
                <td className="py-1.5 pr-3 font-semibold text-ink tabular-nums whitespace-nowrap align-top sm:align-middle">{n.value == null ? 'Not measured' : amount(n)}</td>
                <td className="hidden sm:table-cell py-1.5 text-xs text-ink-faint">{n.value == null ? n.why : n.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[0.7rem] text-ink-faint mt-2">Counted by EffySocial when the plan was written, not estimated.</p>
      </Block>
      {s.reading?.length > 0 && <Block title="What the numbers say"><Bullets items={s.reading} /></Block>}
      <div className="grid gap-4 md:grid-cols-2">
        {[['strengths', 'Strengths'], ['weaknesses', 'Weaknesses'], ['opportunities', 'Opportunities'], ['threats', 'Threats']].map(([k, t]) => (
          <Block key={k} title={t}><Bullets items={swot[k]} /></Block>
        ))}
      </div>
      {s.gaps?.length > 0 && <Block title="What's missing"><Bullets items={s.gaps} /></Block>}
    </div>
  );
}

function Objectives({ plan }) {
  const o = plan.objective || {};
  return (
    <Block title="One measurable goal">
      <ObjectiveLine objective={o} />
      <p className="text-xs text-ink-faint mt-2">
        Starting point: {o.baseline != null ? `${fmt(o.baseline)} — ${o.baselineSource}` : o.baselineSource || 'not measured yet'}.
        {o.suggested ? ' The target was suggested because the plan brief has none; set your own in the brief.' : ' The target is the one in the plan brief.'}
      </p>
      {o.why && <p className="text-sm text-ink-soft mt-3">{o.why}</p>}
    </Block>
  );
}

function Strategy({ plan }) {
  const s = plan.strategy || {};
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Block title="Who it's for"><p className="text-sm text-ink-soft">{s.audience || '—'}</p></Block>
        <Block title="How it stands out"><p className="text-sm text-ink-soft">{s.positioning || '—'}</p></Block>
      </div>
      <Block title="Content pillars">
        <ul className="space-y-2.5">
          {(s.pillars || []).map((p) => (
            <li key={p.name}>
              <div className="flex items-center justify-between text-sm"><span className="font-semibold text-ink">{p.name}</span><span className="tabular-nums text-ink-soft">{p.share}%</span></div>
              <div className="h-1.5 rounded-full bg-surface2 mt-1"><div className="h-full rounded-full bg-coral" style={{ width: `${p.share}%` }} /></div>
              {p.why && <p className="text-xs text-ink-faint mt-1">{p.why}</p>}
            </li>
          ))}
        </ul>
      </Block>
      {s.funnel?.length > 0 && (
        <Block title="From post to customer"><ol className="list-decimal pl-5 space-y-1 text-sm text-ink-soft">{s.funnel.map((f) => <li key={f}>{f}</li>)}</ol></Block>
      )}
    </div>
  );
}

function Tactics({ plan }) {
  const t = plan.tactics || {};
  const b = t.budget || {};
  const posts = (t.channels || []).reduce((a, c) => a + (c.postsPerWeek || 0), 0);
  return (
    <div className="space-y-4">
      <Block title="Channels and cadence">
        <ul className="space-y-2 text-sm">
          {(t.channels || []).map((c) => (
            <li key={c.channel}>
              <span className="font-semibold text-ink">{CHANNEL_NAMES[c.channel] || c.channel}</span>
              <span className="text-ink-soft"> · {c.postsPerWeek ? `${c.postsPerWeek} a week` : 'no set cadence'}</span>
              {c.role && <span className="block text-xs text-ink-faint">{c.role}</span>}
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink-faint mt-2">{posts} posts a week in all{plan.capacity ? `, within the ${plan.capacity} the team can make` : ''}.</p>
      </Block>
      <Block title="Budget split">
        {b.split?.length ? (
          <table className="w-full text-sm">
            <tbody>
              {b.split.map((r) => (
                <tr key={r.area} className="border-b border-line/60 last:border-0">
                  <td className="py-1.5 pr-3 font-semibold text-ink">{r.area}</td>
                  <td className="py-1.5 pr-3 tabular-nums text-ink whitespace-nowrap">{b.currency} {fmt(r.amount)}</td>
                  <td className="py-1.5 text-xs text-ink-faint">{r.why}</td>
                </tr>
              ))}
              <tr><td className="pt-2 text-xs font-bold text-ink-soft">Total</td><td className="pt-2 text-xs font-bold tabular-nums text-ink-soft">{b.currency} {fmt(b.total)}</td><td /></tr>
            </tbody>
          </table>
        ) : <p className="text-sm text-ink-soft">{b.note || 'No budget split.'}</p>}
      </Block>
      <Block title="Campaigns">
        {t.campaigns?.length ? (
          <ul className="space-y-3 text-sm">
            {t.campaigns.map((c) => (
              <li key={c.name}>
                <span className="block font-semibold text-ink">{c.name}</span>
                <span className="block text-xs text-ink-faint">
                  {c.objective} · {c.channels.map((x) => CHANNEL_NAMES[x] || x).join(', ')} · weeks {c.startWeek}{c.endWeek !== c.startWeek ? `–${c.endWeek}` : ''}{c.budget ? ` · ${b.currency} ${fmt(c.budget)}` : ''}
                </span>
                {c.why && <span className="block text-xs text-ink-soft mt-0.5">{c.why}</span>}
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-ink-faint">No campaigns proposed.</p>}
      </Block>
      <Block title={`${(t.ideas || []).length} post ideas`}>
        <ol className="grid gap-2 sm:grid-cols-2 text-sm">
          {(t.ideas || []).map((i, n) => (
            <li key={`${n}-${i.title}`} className="rounded-lg bg-surface2/60 px-3 py-2">
              <span className="block font-semibold text-ink">{i.title}</span>
              <span className="block text-xs text-ink-faint">{i.format} · {CHANNEL_NAMES[i.channel] || i.channel} · {i.pillar}</span>
            </li>
          ))}
        </ol>
      </Block>
    </div>
  );
}

function Action({ plan }) {
  const weeks = plan.action?.weeks || [];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {weeks.map((w) => {
        const planned = (plan.control?.weekly || []).find((x) => x.week === w.week);
        return (
          <Block key={w.week} title={`Week ${w.week}${planned ? ` · ${day(planned.start)}–${day(planned.end)}` : ''}`}>
            {w.focus && <p className="text-sm font-semibold text-ink mb-2">{w.focus}</p>}
            <Bullets items={w.tasks} />
          </Block>
        );
      })}
    </div>
  );
}

export function Control({ plan, progress }) {
  // Actuals come from GET /marketing-plan; without them (onboarding) only the plan shows.
  const counted = Array.isArray(progress);
  const rows = counted ? progress : plan.control?.weekly || [];
  const o = plan.objective || {};
  return (
    <div className="space-y-4">
      <Block title="Planned against actual">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-faint">
              <th className="pb-2 font-semibold">Week</th><th className="pb-2 font-semibold">Posts</th>
              <th className="pb-2 font-semibold">{o.label || 'Goal'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.week} aria-current={w.status === 'current' ? 'true' : undefined}
                className={cn('border-t border-line/60', w.status === 'current' && 'bg-coral-soft/30')}>
                <td className="py-1.5 pr-3 whitespace-nowrap">{w.week} · {day(w.start)}–{day(w.end)}</td>
                <td className="py-1.5 pr-3 tabular-nums">{w.actualPosts == null ? '—' : fmt(w.actualPosts)} of {fmt(w.plannedPosts)}</td>
                <td className="py-1.5 tabular-nums">
                  {w.actualGoal != null ? fmt(w.actualGoal) : counted && w.status !== 'ahead' ? 'not measured' : '—'}
                  {w.plannedGoal != null && <> of {fmt(w.plannedGoal)}</>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[0.7rem] text-ink-faint mt-2">
          {counted ? 'Actuals are counted from posts published through EffySocial, the lead pipeline, lead outcomes and Instagram when this page opens.'
            : 'Each week’s actuals are counted on Marketing Plan as the weeks go by.'}
        </p>
      </Block>
      <Block title="What to aim for">
        <ul className="space-y-2 text-sm">
          {(plan.control?.kpis || []).map((k) => (
            <li key={k.metric}><span className="font-semibold text-ink">{k.metric}</span>{k.target && <span className="text-ink-soft"> · {k.target}</span>}
              {k.why && <span className="block text-xs text-ink-faint">{k.why}</span>}</li>
          ))}
        </ul>
      </Block>
    </div>
  );
}

export default function SostacView({ plan: record, progress }) {
  const plan = record?.plan || {};
  const [step, setStep] = useState('situation');
  const created = record?.createdAt ? new Date(record.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const View = { situation: Situation, objectives: Objectives, strategy: Strategy, tactics: Tactics, action: Action, control: Control }[step];
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-ink leading-relaxed">{plan.summary}</p>
        <div className="mt-2"><ObjectiveLine objective={plan.objective} /></div>
        {created && <p className="text-xs text-ink-faint mt-1">Written {created} · {day(plan.startsOn)}–{day(plan.endsOn)}{plan.accepted ? ' · accepted' : ''}</p>}
      </div>
      <div role="tablist" aria-label="Plan steps" className="flex flex-wrap gap-1 border-b border-line">
        {STEPS.map(([key, label], i) => (
          <button key={key} type="button" role="tab" aria-selected={step === key} onClick={() => setStep(key)}
            className={cn('px-3 py-2 text-sm font-semibold border-b-2 -mb-px transition bg-transparent',
              step === key ? 'border-coral text-ink' : 'border-transparent text-ink-soft hover:text-ink')}>
            <span aria-hidden="true" className="text-coral-ink mr-1">{'SOSTAC'[i]}</span>{label}
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-label={STEPS.find(([k]) => k === step)[1]}><View plan={plan} progress={progress} /></div>
    </div>
  );
}
