import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Link2, Check, Trash2, Globe, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import { useWorkspace, num } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { useInvalidatingMutation } from '../api/hooks';
import { Card, PageHeader, Button, Badge, EmptyState } from '../../ui';
import { cn } from '../../lib/cn';

const TOGGLES = [
  ['features', 'Features'], ['testimonial', 'Testimonial'],
  ['form', 'Lead form'], ['whatsapp', 'WhatsApp CTA'], ['call', 'Call CTA'],
];

const Field = ({ label, ...props }) => (
  <label className="block">
    <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">{label}</span>
    <input {...props} className="mt-1 w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm" />
  </label>
);

/* Quick microsite — Lovable-style: brief → 3 styled options → publish.
   Copy comes from the backend grounded in Brand Brain; no fake testimonials. */
function QuickSite({ workspace, onPublished }) {
  const [brief, setBrief] = useState('');
  const [options, setOptions] = useState(null);
  const [busy, setBusy] = useState('');
  const [live, setLive] = useState(null);   // {slug, name}

  const generate = async () => {
    setBusy('gen'); setLive(null);
    try {
      const d = await effyApi.quickSite({ workspace: workspace.id, brief: brief.trim() });
      setOptions(d.options || []);
    } finally { setBusy(''); }
  };
  const publish = async (opt) => {
    setBusy(opt.key);
    try {
      const page = await effyApi.createLanding({
        workspace: workspace.id,
        name: brief.trim().slice(0, 60) || 'Quick microsite',
        sections: opt.sections,
      });
      const pub = await effyApi.updateLanding(page.id, { status: 'published', sections: opt.sections });
      setLive({ slug: pub.slug, name: pub.name });
      onPublished();
    } finally { setBusy(''); }
  };

  return (
    <Card className="p-5 mb-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="grid place-items-center w-8 h-8 rounded-xl bg-aurora text-white"><Sparkles className="w-4 h-4" /></span>
        <h3 className="font-bold text-ink">Quick microsite</h3>
      </div>
      <p className="text-xs text-ink-faint mb-3">One line in → three styled options → pick one and it's live. Perfect for partner-retailer pages.</p>
      <div className="flex gap-2 mb-4">
        <input value={brief} onChange={(e) => setBrief(e.target.value)}
          placeholder="e.g. Diwali offer page for Sharma Electronics — 20% off + free installation"
          className="flex-1 rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
        <Button onClick={generate} disabled={!brief.trim() || busy === 'gen'}>
          {busy === 'gen' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate
        </Button>
      </div>

      {options && (
        <div className="grid sm:grid-cols-3 gap-3">
          {options.map((o) => (
            <div key={o.key} className="rounded-2xl bg-surface2/60 overflow-hidden flex flex-col">
              {/* mini preview */}
              <div className="p-4 text-center"
                style={o.theme.hero === 'tint' ? { background: `${o.theme.accent}14` }
                  : o.theme.hero === 'dark' ? { background: '#1d1917' } : { background: '#fff' }}>
                <p className={`text-sm font-extrabold leading-snug line-clamp-2 ${o.theme.hero === 'dark' ? 'text-white' : 'text-ink'}`}>
                  {o.sections.hero.headline}
                </p>
                <span className="inline-block mt-2.5 rounded-lg text-white text-[0.65rem] font-bold px-3 py-1.5"
                  style={{ background: o.theme.accent }}>{o.sections.hero.cta}</span>
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-ink">{o.name}</span>
                <Button size="sm" onClick={() => publish(o)} disabled={!!busy}>
                  {busy === o.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />} Publish
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {live && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-success-soft/60 px-3.5 py-2.5 text-sm">
          <Check className="w-4 h-4 text-success shrink-0" />
          <span className="font-semibold text-ink flex-1">Live!</span>
          <a href={`/p/${live.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-coral-ink">
            /p/{live.slug} <ExternalLink className="w-3 h-3" />
          </a>
          <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/p/${live.slug}`)}
            className="text-xs font-bold text-ink-soft hover:text-ink">Copy link</button>
        </div>
      )}
    </Card>
  );
}

// Message match — the ad promise vs what the page actually says. Shown only
// when the page is campaign-linked; reads live editor values, no fake numbers.
function MessageMatch({ page, forms }) {
  const { data: campaign } = useQuery({
    queryKey: ['campaign', page.campaignId],
    queryFn: () => effyApi.getCampaign(page.campaignId),
    enabled: !!page.campaignId,
  });
  if (!campaign) return null;
  const form = forms.find((f) => f.slug === page.formSlug);
  const rows = [
    { label: 'Campaign promise', value: `${campaign.name} — ${campaign.objective || 'no objective set'}`, ok: true },
    { label: 'Page headline', value: page.sections?.hero?.headline || '', ok: !!page.sections?.hero?.headline },
    { label: 'CTA', value: page.sections?.hero?.cta || '', ok: !!page.sections?.hero?.cta },
    { label: 'Attached form', value: form?.name || '', ok: !!form },
  ];
  return (
    <div className="mb-4 rounded-xl bg-coral-tint/40 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-coral-ink mb-2">Message match — {campaign.name}</p>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-2 text-sm">
            {r.ok ? <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" /> : <span className="w-3.5 h-3.5 shrink-0 mt-0.5 rounded-full border-2 border-warning" />}
            <span className="text-ink-faint whitespace-nowrap">{r.label}:</span>
            <span className={cn('font-semibold min-w-0 truncate', r.ok ? 'text-ink' : 'text-warning')}>{r.value || 'missing'}</span>
          </div>
        ))}
      </div>
      <p className="text-[0.7rem] text-ink-faint mt-2">Keep the headline and CTA aligned with the ad promise — mismatch is the #1 conversion killer.</p>
    </div>
  );
}

function SectionEditor({ page, setPage, forms }) {
  const s = page.sections;
  const set = (key, patch) => setPage({ ...page, sections: { ...s, [key]: { ...s[key], ...patch } } });
  const setItem = (i, v) => set('features', { items: s.features.items.map((x, j) => (j === i ? v : x)) });
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wide text-ink-faint">Hero</h4>
        <Field label="Headline" value={s.hero.headline} onChange={(e) => set('hero', { headline: e.target.value })} />
        <Field label="Sub-headline" value={s.hero.sub} onChange={(e) => set('hero', { sub: e.target.value })} />
        <Field label="CTA button" value={s.hero.cta} onChange={(e) => set('hero', { cta: e.target.value })} />

        <h4 className="text-xs font-bold uppercase tracking-wide text-ink-faint pt-2">Features</h4>
        <Field label="Section title" value={s.features.title} onChange={(e) => set('features', { title: e.target.value })} />
        {s.features.items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={item} onChange={(e) => setItem(i, e.target.value)}
              className="flex-1 rounded-sm border border-line bg-surface px-2.5 py-1.5 text-sm" />
            <button onClick={() => set('features', { items: s.features.items.filter((_, j) => j !== i) })}
              className="text-ink-faint hover:text-error"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <button onClick={() => set('features', { items: [...s.features.items, ''] })}
          className="flex items-center gap-1.5 text-sm font-bold text-coral-ink"><Plus className="w-4 h-4" /> Add feature</button>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wide text-ink-faint">Sections shown</h4>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {TOGGLES.map(([key, label]) => (
            <label key={key} className="flex items-center gap-1.5 text-sm text-ink-soft whitespace-nowrap cursor-pointer">
              <input type="checkbox" checked={!!s.enabled[key]} className="accent-coral"
                onChange={(e) => set('enabled', { [key]: e.target.checked })} /> {label}
            </label>
          ))}
        </div>

        <h4 className="text-xs font-bold uppercase tracking-wide text-ink-faint pt-2">Testimonial</h4>
        <Field label="Quote" value={s.testimonial.quote} onChange={(e) => set('testimonial', { quote: e.target.value })} />
        <Field label="Author" value={s.testimonial.author} onChange={(e) => set('testimonial', { author: e.target.value })} />

        <h4 className="text-xs font-bold uppercase tracking-wide text-ink-faint pt-2">Lead capture & contact</h4>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">Embedded form (published only)</span>
          <select value={page.formSlug || ''} onChange={(e) => setPage({ ...page, formSlug: e.target.value })}
            className="mt-1 w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm">
            <option value="">— none —</option>
            {forms.filter((f) => f.status === 'published').map((f) => <option key={f.id} value={f.slug}>{f.name}</option>)}
          </select>
        </label>
        <Field label="WhatsApp number" placeholder="+91 98765 43210" value={page.whatsapp || ''}
          onChange={(e) => setPage({ ...page, whatsapp: e.target.value })} />
        <Field label="Phone (call CTA)" placeholder="+91 98765 43210" value={page.phone || ''}
          onChange={(e) => setPage({ ...page, phone: e.target.value })} />
      </div>
    </div>
  );
}

export default function LandingPages() {
  const { workspace } = useWorkspace();
  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['landing', workspace?.id],
    queryFn: () => effyApi.listLanding(workspace.id),
    enabled: !!workspace,
  });
  const { data: forms = [] } = useQuery({
    queryKey: ['forms', workspace?.id],
    queryFn: () => effyApi.listForms(workspace.id),
    enabled: !!workspace,
  });
  const qc = useQueryClient();
  const invalidate = () => ['landing', workspace?.id];
  const refresh = () => qc.invalidateQueries({ queryKey: invalidate() });
  const create = useInvalidatingMutation((p) => effyApi.createLanding(p), invalidate);
  const update = useInvalidatingMutation(({ id, ...p }) => effyApi.updateLanding(id, p), invalidate);

  const [editing, setEditing] = useState(null); // page object being edited
  const [copied, setCopied] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');

  const startCreate = async () => {
    const page = await create.mutateAsync({ workspace: workspace.id, name: 'New landing page' });
    setEditing(page);
  };
  const copyLink = (p) => {
    navigator.clipboard?.writeText(`${window.location.origin}/p/${p.slug}`);
    setCopied(p.id);
    setTimeout(() => setCopied(null), 1500);
  };
  const saveEditing = async () => {
    await update.mutateAsync({
      id: editing.id, name: editing.name, sections: editing.sections,
      formSlug: editing.formSlug || '', whatsapp: editing.whatsapp || '', phone: editing.phone || '',
    });
    setEditing(null);
  };
  const aiCopy = async () => {
    setAiBusy(true);
    setAiError('');
    try {
      const d = await effyApi.landingAiCopy(editing.id, editing.name);
      setEditing({
        ...editing,
        sections: {
          ...editing.sections,
          hero: { headline: d.headline, sub: d.sub, cta: d.cta || editing.sections.hero.cta },
          features: { ...editing.sections.features, items: d.features || [] },
        },
      });
    } catch (err) {
      setAiError(err.message || 'Generation failed.');
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Landing Pages"
        subtitle="Hosted pages with lead capture — visits and submissions flow into your pipeline with UTM attribution."
        actions={<Button onClick={startCreate} disabled={create.isPending}><Plus className="w-4 h-4" /> New page</Button>}
      />

      <QuickSite workspace={workspace} onPublished={refresh} />

      {editing && (
        <Card className="p-5 mb-5 border-coral">
          <div className="flex items-center justify-between mb-4">
            <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className="text-lg font-extrabold text-ink bg-transparent border-b border-dashed border-line focus:border-coral outline-none" />
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={aiCopy} disabled={aiBusy}>
                {aiBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} AI copy
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button size="sm" onClick={saveEditing} disabled={update.isPending}><Check className="w-3.5 h-3.5" /> Save</Button>
            </div>
          </div>
          {aiError && <div className="mb-3 text-sm rounded-lg bg-error-soft text-error px-3.5 py-2.5">{aiError}</div>}
          {editing.campaignId && <MessageMatch page={editing} forms={forms} />}
          <SectionEditor page={editing} setPage={setEditing} forms={forms} />
        </Card>
      )}

      {isLoading ? (
        <Card className="p-10 text-center text-ink-soft">Loading pages…</Card>
      ) : !pages.length ? (
        <EmptyState icon="🌐" title="No landing pages yet" body="Compose a page from sections, generate on-brand copy with AI, publish, and share the link — leads land in your pipeline." action={<Button onClick={startCreate}>Create page</Button>} />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-ink-faint border-b border-line">{['Page', 'Status', 'Views', 'Lead form', 'Share', ''].map((h) => <th key={h} className="font-semibold px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id} className="border-b border-line/70 last:border-0 hover:bg-surface2/60">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-semibold text-ink"><Globe className="w-4 h-4 text-ink-faint" /> {p.name}</span>
                    <span className="block text-xs text-ink-faint ml-6">{p.created}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => update.mutate({ id: p.id, status: p.status === 'published' ? 'draft' : 'published' })}
                      className={cn('text-xs font-bold px-3 py-1.5 rounded-full', p.status === 'published' ? 'bg-success-soft text-success' : 'bg-surface2 text-ink-soft hover:text-ink')}>
                      {p.status === 'published' ? '● Published' : 'Publish'}
                    </button>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{num(p.views || 0)}</td>
                  <td className="px-4 py-3">
                    {p.formSlug
                      ? <Badge>{forms.find((f) => f.slug === p.formSlug)?.name || 'Form'}</Badge>
                      : <span className="text-xs text-ink-faint">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => copyLink(p)} disabled={p.status !== 'published'}>
                        {copied === p.id ? <><Check className="w-3.5 h-3.5 text-success" /> Copied</> : <><Link2 className="w-3.5 h-3.5" /> Copy link</>}
                      </Button>
                      {p.status === 'published' && (
                        <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className="text-ink-faint hover:text-coral-ink"><ExternalLink className="w-4 h-4" /></a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost" onClick={() => setEditing(p)}>Edit</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
