import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Brain, Sparkles, Check, Loader2, Globe, ShieldCheck } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge, Pacing } from '../../ui';

const csv = (s) => s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
const lines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean).map((l) => {
  const [title, ...rest] = l.split(/[-—:]/);
  return { title: title.trim(), desc: rest.join('-').trim() };
});

// Setup questionnaire — everything saved becomes a REAL brand fact that grounds
// every AI generation. (Auto-extraction from website/socials + AI persona with
// admin approval is the next slice; this form is the foundation it feeds.)
function Questionnaire({ workspace, onDone }) {
  const [f, setF] = useState({ summary: '', tone: '', approved: '', prohibited: '', products: '', offers: '', personas: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async () => {
    setBusy(true);
    try {
      const facts = [];
      if (f.summary.trim()) facts.push({ section: 'summary', data: f.summary.trim() });
      if (f.tone.trim()) facts.push({ section: 'tone', data: csv(f.tone) });
      if (f.approved.trim()) facts.push({ section: 'approved', data: csv(f.approved) });
      if (f.prohibited.trim()) facts.push({ section: 'prohibited', data: csv(f.prohibited) });
      if (f.products.trim()) facts.push({ section: 'products', data: lines(f.products) });
      if (f.offers.trim()) facts.push({ section: 'offers', data: lines(f.offers) });
      if (f.personas.trim()) facts.push({ section: 'personas', data: lines(f.personas).map((p) => ({ name: p.title, motivation: p.desc })) });
      for (const fact of facts) {
        await effyApi.saveBrandFact({ workspace: workspace.id, section: fact.section, data: fact.data, status: 'good', sources: ['Questionnaire'] });
      }
      onDone();
    } finally { setBusy(false); }
  };

  const Field = ({ label, hint, k, rows = 2, placeholder }) => (
    <div>
      <label className="block text-sm font-semibold text-ink mb-1">{label}</label>
      {hint && <p className="text-xs text-ink-faint mb-1.5">{hint}</p>}
      <textarea rows={rows} value={f[k]} onChange={set(k)} placeholder={placeholder}
        className="w-full rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
    </div>
  );

  return (
    <Card className="p-6 max-w-2xl">
      <div className="flex items-center gap-2.5 mb-1">
        <span className="grid place-items-center w-9 h-9 rounded-xl bg-aurora text-white"><Brain className="w-5 h-5" /></span>
        <h2 className="font-display text-xl font-semibold tracking-tight">Tell Effy about your brand</h2>
      </div>
      <p className="text-sm text-ink-soft mb-6">Everything you enter grounds every AI generation — captions, images, landing copy and replies. You can refine it anytime.</p>
      <div className="space-y-4">
        <Field label="What does your business do?" hint="One or two sentences — who you serve and what makes you different." k="summary" rows={3}
          placeholder="e.g. We're a family dental clinic in Pune known for gentle, transparent care…" />
        <Field label="Brand tone" hint="Comma-separated words." k="tone" placeholder="warm, professional, reassuring" />
        <Field label="Words to use" hint="Phrases you like in your marketing (comma-separated)." k="approved" placeholder="trusted, transparent, book now" />
        <Field label="Words to avoid" hint="Never say these (comma-separated)." k="prohibited" placeholder="cheapest, guaranteed, #1" />
        <Field label="Products / services" hint="One per line: Name — short description." k="products" rows={3}
          placeholder={"Root canal — single-sitting RCT\nTeeth whitening — in-clinic & take-home"} />
        <Field label="Current offers" hint="One per line (optional)." k="offers" placeholder="Free first consultation — for new patients" />
        <Field label="Target customers" hint="One per line: Who — what they want (optional)." k="personas"
          placeholder="Young parents — safe, painless care for kids" />
      </div>
      <Button variant="spark" className="mt-6 w-full" onClick={save} disabled={busy}>
        {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Sparkles className="w-4 h-4" /> Build my Brand Brain</>}
      </Button>
      <p className="text-xs text-ink-faint mt-3 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Next up: auto-extraction from your website &amp; social pages, with an AI brand persona you approve.</p>
    </Card>
  );
}

const CHIP_SECTIONS = [
  ['tone', 'Tone', 'default'], ['approved', 'Words to use', 'success'], ['prohibited', 'Words to avoid', 'error'],
];
const LIST_SECTIONS = [['products', 'Products / services'], ['offers', 'Offers'], ['personas', 'Target customers']];

export default function BrandBrain() {
  const { workspace } = useWorkspace();
  const qc = useQueryClient();
  const { data: brain, isLoading } = useQuery({
    queryKey: ['brand', workspace?.id],
    queryFn: () => effyApi.getBrand(workspace.id),
    enabled: !!workspace,
  });
  const refetch = () => qc.invalidateQueries({ queryKey: ['brand', workspace?.id] });

  if (isLoading || !brain) return <div className="p-10 text-sm text-ink-soft">Loading Brand Brain…</div>;

  if (!brain.completeness) {
    return (
      <div>
        <PageHeader title="Brand Brain" subtitle="The knowledge that makes every AI output sound like you." />
        <Questionnaire workspace={workspace} onDone={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Brand Brain"
        subtitle="The knowledge grounding every AI generation."
        actions={<Badge tone="success"><ShieldCheck className="w-3 h-3" /> {brain.completeness}% complete</Badge>}
      />
      <div className="max-w-xl mb-6"><Pacing value={brain.completeness} max={100} tone="success" /></div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <Card className="p-5">
          <h3 className="font-bold text-ink mb-2">About the brand</h3>
          <p className="text-sm text-ink-soft leading-relaxed">{brain.summary?.data || <span className="text-ink-faint">Not set yet.</span>}</p>
          <div className="mt-4 space-y-3">
            {CHIP_SECTIONS.map(([key, label, tone]) => (
              <div key={key}>
                <div className="text-xs font-semibold text-ink-soft mb-1.5">{label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {(brain[key]?.data || []).length
                    ? brain[key].data.map((t) => <Badge key={t} tone={tone}>{t}</Badge>)
                    : <span className="text-xs text-ink-faint">—</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-4">
          {LIST_SECTIONS.map(([key, label]) => (
            <Card key={key} className="p-5">
              <h3 className="font-bold text-ink mb-2">{label}</h3>
              {(brain[key]?.data || []).length ? (
                <ul className="space-y-2">
                  {brain[key].data.map((it, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-semibold text-ink">{it.title || it.name}</span>
                      {(it.desc || it.motivation) && <span className="text-ink-soft"> — {it.desc || it.motivation}</span>}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-ink-faint">Not set yet.</p>}
            </Card>
          ))}
          <Card className="p-5 bg-coral-tint/60">
            <h3 className="font-bold text-ink mb-1 flex items-center gap-2"><Check className="w-4 h-4 text-coral-ink" /> Grounding is live</h3>
            <p className="text-sm text-ink-soft">AI Studio, landing copy and Effy replies now use these facts. Coming next: auto-extraction from your website &amp; socials with an approval step.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
