import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Sparkles, FileText, Target, Globe, FileInput, ChevronRight, Loader2, Plug, ExternalLink } from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { useAssistant } from '../context/AssistantContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, StatusBadge, Badge, Tabs, Pacing, MetricCard, EmptyState } from '../../ui';
import { ChannelIcon, PostStatus } from '../components/parts';
import CampaignDialog from '../components/CampaignDialog';
import PostDialog from '../components/PostDialog';
import { formatInZone, orgZone } from '../timezone';

const TABS = [
  { id: 'overview', label: 'Overview' }, { id: 'plan', label: 'Plan' },
  { id: 'content', label: 'Content' }, { id: 'ads', label: 'Ads' },
  { id: 'conversion', label: 'Conversion' }, { id: 'leads', label: 'Leads' },
  { id: 'analytics', label: 'Analytics' }, { id: 'activity', label: 'Activity' },
];

// The funnel a campaign really has: what its content reached, what its pages and forms
// caught, and what the pipeline did with it. Zeros until the work is there.
const campaignFunnel = (a) => [
  { stage: 'Reach', value: a.reach, color: 'var(--dv-6)' },
  { stage: 'Landing views', value: a.views, color: 'var(--dv-5)' },
  { stage: 'Form submissions', value: a.submissions, color: 'var(--dv-4)' },
  { stage: 'Leads', value: a.leads, color: 'var(--dv-3)' },
  { stage: 'Qualified', value: a.qualified, color: 'var(--dv-2)' },
  { stage: 'Won', value: a.won, color: 'var(--dv-1)' },
];

function Funnel({ steps }) {
  const max = steps.find((s) => s.value > 0)?.value || 1;
  return (
    <div className="space-y-2.5">
      {steps.map((s, i) => {
        const pct = (s.value / max) * 100;
        const previous = steps[i - 1]?.value;
        const conv = i > 0 && previous ? ((s.value / previous) * 100).toFixed(1) : null;
        return (
          <div key={s.stage}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-semibold text-ink">{s.stage}</span>
              <span className="tabular-nums text-ink-soft">
                {num(s.value)}{conv && <span className="text-ink-faint ml-2 text-xs">{conv}% ↓</span>}
              </span>
            </div>
            <div className="h-7 rounded-md bg-surface2 overflow-hidden">
              <div className="h-full rounded-md flex items-center" style={{ width: `${Math.max(pct, 4)}%`, background: s.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ConnectedObjects({ analytics, conversion, content }) {
  const items = [
    { icon: FileText, label: 'Content items', count: content.length, to: '/app/calendar' },
    { icon: Target, label: 'Published', count: analytics.published, to: '/app/published' },
    { icon: Globe, label: 'Landing pages', count: conversion.landing.length, to: '/app/landing' },
    { icon: FileInput, label: 'Lead forms', count: conversion.forms.length, to: '/app/forms' },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((it) => (
        <Link key={it.label} to={it.to} className="flex items-center gap-3 p-3 rounded-lg border border-line hover:border-coral hover:bg-surface2/50 transition">
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-coral-soft text-coral-ink"><it.icon className="w-[18px] h-[18px]" /></span>
          <span className="flex-1"><span className="block text-lg font-extrabold tabular-nums leading-none">{it.count}</span><span className="text-xs text-ink-faint">{it.label}</span></span>
          <ChevronRight className="w-4 h-4 text-ink-faint" />
        </Link>
      ))}
    </div>
  );
}

const Section = ({ title, children, action }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between gap-3 mb-3">
      <h3 className="font-bold text-ink">{title}</h3>
      {action}
    </div>
    {children}
  </Card>
);

export default function CampaignWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canWrite, org } = useWorkspace();
  const { askEffy } = useAssistant();
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [post, setPost] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['campaign-workspace', id],
    queryFn: () => effyApi.campaignWorkspace(id),
  });

  if (isLoading) {
    return <Card className="p-10 flex items-center justify-center gap-2 text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Loading campaign…</Card>;
  }
  if (isError || !data) {
    return <EmptyState icon="🔍" title="Campaign not found" body="It may have been archived or belongs to another workspace." action={<Button onClick={() => navigate('/app/campaigns')}>Back to campaigns</Button>} />;
  }

  const { campaign: c, plan, content, conversion, leads, analytics, activity } = data;
  const dates = [c.start, c.end].filter(Boolean).join(' → ') || 'No dates set';
  const studio = () => navigate(`/app/studio?campaign=${c.id}&topic=${encodeURIComponent(`${c.objective} for ${c.name}`)}`);
  const published = content.filter((p) => p.status === 'published');

  return (
    <div>
      <button onClick={() => navigate('/app/campaigns')} className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink mb-3">
        <ArrowLeft className="w-4 h-4" /> Campaigns
      </button>

      <PageHeader
        title={c.name}
        subtitle={`${c.objective} · ${dates}${c.owner ? ` · ${c.owner}` : ''}`}
        actions={
          <>
            <StatusBadge status={c.status} />
            {canWrite && <Button variant="secondary" onClick={() => setEditing(true)}>Edit</Button>}
            <Button variant="spark" onClick={() => askEffy(`How is the campaign “${c.name}” doing, and what should I change?`)}>
              <Sparkles className="w-4 h-4" /> Ask Effy
            </Button>
          </>
        }
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Leads" value={num(analytics.leads)} hint={`${num(analytics.qualified)} qualified`} />
            <MetricCard label="Revenue" value={inr(analytics.revenue)} hint={`${num(analytics.won)} won`} />
            <MetricCard label="CPL" value={analytics.cpl ? inr(analytics.cpl, { compact: false }) : '—'} hint={analytics.leads ? `${num(analytics.leads)} leads` : 'no leads yet'} />
            <MetricCard label="ROAS" value={analytics.roas ? `${analytics.roas}×` : '—'} hint={analytics.spend ? `${inr(analytics.spend)} spent` : 'no spend recorded'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 p-5">
              <h3 className="font-bold text-ink mb-4">Funnel — content to revenue</h3>
              <Funnel steps={campaignFunnel(analytics)} />
            </Card>
            <div className="space-y-4">
              <Card className="p-5">
                <h3 className="font-bold text-ink mb-3">Budget</h3>
                <Pacing value={analytics.spend} max={Math.max(c.budget, 1)} tone={c.budget && analytics.spend / c.budget > 0.9 ? 'warning' : 'coral'} />
                <div className="flex justify-between text-sm mt-2 tabular-nums">
                  <span className="text-ink-soft">{inr(analytics.spend)} spent</span>
                  <span className="text-ink-faint">of {inr(c.budget)}</span>
                </div>
                {!c.budget && <p className="text-xs text-ink-faint mt-2">No budget set — add one in Edit.</p>}
              </Card>
            </div>
          </div>

          <Section title="Connected objects">
            <ConnectedObjects analytics={analytics} conversion={conversion} content={content} />
          </Section>
        </div>
      )}

      {tab === 'plan' && (
        <div className="space-y-4">
          <Section title="What this campaign is for">
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[['Objective', c.objective], ['Pillar', c.pillar || 'Not set'], ['Runs', dates],
                ['Budget', c.budget ? inr(c.budget) : 'Not set'], ['Owner', c.owner || 'Unassigned'],
                ['Channels', (c.channels || []).join(', ') || 'None chosen']].map(([label, value]) => (
                  <div key={label}><dt className="text-xs font-semibold text-ink-faint">{label}</dt><dd className="text-ink capitalize">{value}</dd></div>
                ))}
            </dl>
            {plan.pillar && (
              <p className="mt-4 text-sm text-ink-soft">
                <strong className="text-ink">{plan.pillar.name}</strong> is {plan.pillar.share}% of your marketing plan — {plan.pillar.why}
              </p>
            )}
          </Section>
          {plan.channels.length > 0 && (
            <Section title="Cadence from your marketing plan">
              <ul className="divide-y divide-line/70">
                {plan.channels.map((ch) => (
                  <li key={ch.channel} className="py-2.5 flex items-center gap-3 text-sm">
                    <ChannelIcon channel={ch.channel} className="w-5 h-5" />
                    <span className="font-semibold text-ink capitalize">{ch.channel}</span>
                    <span className="text-ink-soft">{ch.postsPerWeek} a week</span>
                    <span className="text-ink-faint text-xs flex-1 truncate">{ch.role}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {plan.kpis.length > 0 && (
            <Section title="What the plan is aiming for">
              <ul className="space-y-2">
                {plan.kpis.map((k) => (
                  <li key={k.metric} className="text-sm"><strong className="text-ink">{k.metric}:</strong> <span className="text-ink-soft">{k.target}</span>
                    {k.why && <span className="text-ink-faint text-xs"> — {k.why}</span>}</li>
                ))}
              </ul>
            </Section>
          )}
          {!plan.hasPlan && (
            <EmptyState icon="🧭" title="No marketing plan yet" body="A plan sets the pillars, channels and cadence this campaign works within."
              action={<Button onClick={() => navigate('/app/plan')}>Open Marketing Plan</Button>} />
          )}
        </div>
      )}

      {tab === 'content' && (
        content.length ? (
          <Section title={`${content.length} content item${content.length === 1 ? '' : 's'}`}
            action={canWrite && <Button size="sm" variant="secondary" onClick={studio}><Sparkles className="w-3.5 h-3.5" /> Create in AI Studio</Button>}>
            <ul className="divide-y divide-line/70">
              {content.map((p) => (
                <li key={p.id}>
                  <button onClick={() => setPost(p)} className="w-full py-2.5 flex items-center gap-3 text-left hover:bg-surface2/50 rounded-lg px-1">
                    <ChannelIcon channel={p.channel} className="w-5 h-5 shrink-0" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-ink truncate">{p.title}</span>
                      <span className="block text-xs text-ink-faint">{p.date ? `${p.date}${p.time ? ` · ${p.time}` : ''}` : 'No date'} · {p.type}</span>
                    </span>
                    <PostStatus status={p.status} />
                  </button>
                </li>
              ))}
            </ul>
          </Section>
        ) : (
          <EmptyState icon="📝" title="No content in this campaign yet" body="Everything you create from here is tagged to the campaign."
            action={canWrite && <Button onClick={studio}>Create in AI Studio</Button>} />
        )
      )}

      {tab === 'ads' && (
        <div className="space-y-4">
          <Section title="Spend">
            <Pacing value={analytics.spend} max={Math.max(c.budget, 1)} tone="coral" />
            <div className="flex justify-between text-sm mt-2 tabular-nums">
              <span className="text-ink-soft">{inr(analytics.spend)} spent</span><span className="text-ink-faint">of {inr(c.budget)}</span>
            </div>
            <p className="text-xs text-ink-soft mt-3 flex items-start gap-2">
              <Plug className="w-4 h-4 shrink-0 text-ink-faint" />
              EffySocial doesn’t run ads yet: connect Meta Ads in <Link to="/app/integrations" className="font-bold underline">Integrations</Link> and this campaign’s spend and results come from your ad account.
            </p>
          </Section>
          <Section title="Creatives ready to promote">
            {published.length ? (
              <ul className="grid sm:grid-cols-2 gap-3">
                {published.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 rounded-lg border border-line p-2">
                    <span className="w-14 h-14 rounded-md overflow-hidden bg-aurora shrink-0">
                      {p.mediaUrl && (p.mediaKind === 'video'
                        ? <video src={p.mediaUrl} muted preload="metadata" className="w-full h-full object-cover" aria-label={`${p.title} video`} />
                        : <img src={p.mediaUrl} alt="" className="w-full h-full object-cover" />)}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-ink truncate">{p.title}</span>
                      <span className="block text-xs text-ink-faint">{p.metrics ? `${num(p.metrics.reach)} reach · ${p.metrics.engagement}% engagement` : 'No numbers yet'}</span>
                    </span>
                    {p.permalink && (
                      <a href={p.permalink} target="_blank" rel="noreferrer" className="text-coral-ink" aria-label={`View ${p.title} on Instagram`}>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-ink-faint">Published posts from this campaign appear here, ready to put money behind.</p>}
          </Section>
        </div>
      )}

      {tab === 'conversion' && (
        <div className="space-y-4">
          <Section title="Landing pages" action={canWrite && <Button size="sm" variant="secondary" onClick={() => navigate('/app/landing')}>Landing pages</Button>}>
            {conversion.landing.length ? (
              <ul className="divide-y divide-line/70">
                {conversion.landing.map((p) => (
                  <li key={p.id} className="py-2.5 flex items-center gap-3 text-sm">
                    <span className="flex-1 font-semibold text-ink truncate">{p.name}</span>
                    <Badge tone={p.status === 'published' ? 'success' : 'default'}>{p.status}</Badge>
                    <span className="text-ink-faint tabular-nums w-20 text-right">{num(p.views)} views</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-ink-faint">No landing page attached to this campaign yet.</p>}
          </Section>
          <Section title="Lead forms" action={canWrite && <Button size="sm" variant="secondary" onClick={() => navigate('/app/forms')}>Forms</Button>}>
            {conversion.forms.length ? (
              <ul className="divide-y divide-line/70">
                {conversion.forms.map((f) => (
                  <li key={f.id} className="py-2.5 flex items-center gap-3 text-sm">
                    <span className="flex-1 font-semibold text-ink truncate">{f.name}</span>
                    <Badge tone={f.status === 'published' ? 'success' : 'default'}>{f.status}</Badge>
                    <span className="text-ink-faint tabular-nums w-28 text-right">{num(f.submissions)} submissions</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-ink-faint">No lead form attached to this campaign yet.</p>}
          </Section>
        </div>
      )}

      {tab === 'leads' && (
        leads.length ? (
          <Section title={`${leads.length} lead${leads.length === 1 ? '' : 's'} from this campaign`}
            action={<Button size="sm" variant="secondary" onClick={() => navigate('/app/pipeline')}>Open pipeline</Button>}>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-ink-faint border-b border-line">
                {['Lead', 'Stage', 'Quality', 'Value', 'Source', 'Added'].map((h) => <th key={h} className="font-semibold py-2 pr-3">{h}</th>)}
              </tr></thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} onClick={() => navigate(`/app/pipeline/${l.id}`)} className="border-b border-line/70 last:border-0 hover:bg-surface2/60 cursor-pointer">
                    <td className="py-2.5 pr-3 font-semibold text-ink">{l.name}</td>
                    <td className="py-2.5 pr-3 capitalize text-ink-soft">{l.stage}</td>
                    <td className="py-2.5 pr-3"><Badge tone={l.quality === 'hot' ? 'error' : l.quality === 'cold' ? 'default' : 'warning'}>{l.quality}</Badge></td>
                    <td className="py-2.5 pr-3 tabular-nums">{l.value ? inr(l.value) : '—'}</td>
                    <td className="py-2.5 pr-3 capitalize text-ink-soft">{l.source}</td>
                    <td className="py-2.5 pr-3 text-ink-faint tabular-nums">{l.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        ) : <EmptyState icon="🧲" title="No leads yet" body="Leads captured by this campaign's forms, landing pages and chats land here." />
      )}

      {tab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Published posts" value={num(analytics.published)} hint={`${num(analytics.scheduled)} scheduled`} />
            <MetricCard label="Reach" value={num(analytics.reach)} hint={analytics.engagement ? `${analytics.engagement}% engagement` : 'from post reports'} />
            <MetricCard label="Form submissions" value={num(analytics.submissions)} hint={`${num(analytics.views)} landing views`} />
            <MetricCard label="Revenue" value={inr(analytics.revenue)} hint={analytics.roas ? `${analytics.roas}× on spend` : 'no spend recorded'} />
          </div>
          <Section title="Funnel — content to revenue"><Funnel steps={campaignFunnel(analytics)} /></Section>
          <Section title="Leads by stage">
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(analytics.byStage).map(([stage, count]) => (
                <li key={stage} className="rounded-xl bg-surface2/70 px-3 py-2.5">
                  <span className="block text-[0.68rem] font-semibold text-ink-faint capitalize">{stage}</span>
                  <span className="block text-lg font-extrabold tabular-nums text-ink">{num(count)}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-ink-faint mt-3">Reach and engagement come from the reports you pull on published posts; spend is what’s recorded on the campaign.</p>
          </Section>
        </div>
      )}

      {tab === 'activity' && (
        <Section title="What happened">
          <ol className="relative border-l border-line ml-2">
            {activity.map((a, i) => (
              <li key={`${a.at}-${i}`} className="ml-4 pb-4 last:pb-0">
                <span className="absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full bg-coral" />
                <p className="text-sm text-ink">{a.text}</p>
                <p className="text-xs text-ink-faint">{formatInZone(a.at, orgZone(org))}</p>
              </li>
            ))}
          </ol>
        </Section>
      )}

      <CampaignDialog open={editing} campaign={c} onClose={() => setEditing(false)} />
      <PostDialog open={!!post} post={post} onClose={() => setPost(null)} />
    </div>
  );
}
