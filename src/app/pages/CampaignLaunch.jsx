import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Rocket, Check, Circle, Wand2, Globe, FileInput, Megaphone, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useWorkspace, inr } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge, EmptyState } from '../../ui';
import { cn } from '../../lib/cn';

const OBJECTIVES = ['Lead generation', 'WhatsApp conversations', 'Website traffic', 'Awareness', 'Appointments'];

export default function CampaignLaunch() {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [campaign, setCampaign] = useState(null);
  const [busy, setBusy] = useState('');
  // step 1 form
  const [name, setName] = useState('');
  const [objective, setObjective] = useState(OBJECTIVES[0]);
  const [budget, setBudget] = useState(40000);

  const { data: assembly, refetch } = useQuery({
    queryKey: ['assembly', campaign?.id],
    queryFn: () => effyApi.campaignAssembly(campaign.id),
    enabled: !!campaign,
  });

  const createCampaign = async () => {
    if (!name.trim()) return;
    setBusy('campaign');
    try {
      const c = await effyApi.createCampaign({ workspace: workspace.id, name: name.trim(), objective, budget: Number(budget) });
      setCampaign(c);
      setStep(2);
    } finally { setBusy(''); }
  };

  const addForm = async () => {
    setBusy('form');
    try { await effyApi.createForm({ workspace: workspace.id, name: `${campaign.name} — enquiry`, campaignId: campaign.id }); await refetch(); }
    finally { setBusy(''); }
  };
  const addLanding = async () => {
    setBusy('landing');
    try { await effyApi.createLanding({ workspace: workspace.id, name: `${campaign.name} — landing`, campaignId: campaign.id }); await refetch(); }
    finally { setBusy(''); }
  };
  const addContent = async () => {
    setBusy('content');
    try { await effyApi.createPost({ workspace: workspace.id, title: `${campaign.name} — launch post`, campaignId: campaign.id, status: 'draft' }); await refetch(); }
    finally { setBusy(''); }
  };
  const generateInStudio = () => {
    const qs = new URLSearchParams({ topic: `${objective} for ${campaign.name}`, campaign: String(campaign.id) });
    navigate(`/app/studio?${qs.toString()}`);
  };
  const launch = async () => {
    setBusy('launch');
    try { await effyApi.updateCampaign(campaign.id, { status: 'live' }); navigate(`/app/campaigns/${campaign.id}`); }
    finally { setBusy(''); }
  };

  const STEPS = ['Basics', 'Content', 'Convert', 'Launch'];

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Launch a Campaign"
        subtitle="One guided flow: strategy → content → landing + form → launch. Everything links under one campaign."
      />

      {/* stepper */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((s, i) => {
          const n = i + 1;
          const done = step > n;
          return (
            <React.Fragment key={s}>
              <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold',
                step === n ? 'bg-coral-btn text-white shadow-coral' : done ? 'bg-success-soft text-success' : 'bg-surface2 text-ink-faint')}>
                <span className="grid place-items-center w-5 h-5 rounded-full bg-white/25 text-xs">{done ? <Check className="w-3 h-3" /> : n}</span>
                {s}
              </div>
              {i < STEPS.length - 1 && <div className={cn('flex-1 h-0.5 rounded', done ? 'bg-success/40' : 'bg-line')} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* STEP 1 — basics */}
      {step === 1 && (
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold tracking-tight mb-4 flex items-center gap-2"><Rocket className="w-5 h-5 text-coral-ink" /> Campaign basics</h3>
          <label className="block text-xs font-bold text-ink-soft mb-1">Campaign name</label>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Monsoon Checkup Drive"
            className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm mb-4" />
          <label className="block text-xs font-bold text-ink-soft mb-1">Objective</label>
          <select value={objective} onChange={(e) => setObjective(e.target.value)} className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm mb-4">
            {OBJECTIVES.map((o) => <option key={o}>{o}</option>)}
          </select>
          <label className="block text-xs font-bold text-ink-soft mb-1">Budget (₹)</label>
          <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm mb-5" />
          <Button className="w-full" onClick={createCampaign} disabled={busy === 'campaign' || !name.trim()}>
            {busy === 'campaign' ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create & continue <ArrowRight className="w-4 h-4" /></>}
          </Button>
        </Card>
      )}

      {/* STEP 2 — content */}
      {step === 2 && campaign && (
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold tracking-tight mb-1 flex items-center gap-2"><Wand2 className="w-5 h-5 text-coral-ink" /> Create content</h3>
          <p className="text-sm text-ink-soft mb-4">Generate on-brand posts (grounded in trends + your Brand Brain) or add a placeholder to fill later. All tagged to <strong>{campaign.name}</strong>.</p>
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            <button onClick={generateInStudio} className="text-left p-4 rounded-xl border border-line hover:border-coral bg-card-sheen transition">
              <Sparkles className="w-5 h-5 text-coral-ink mb-2" />
              <div className="font-bold text-sm text-ink">Generate in AI Studio</div>
              <div className="text-xs text-ink-faint">Trend-grounded copy + scores</div>
            </button>
            <button onClick={addContent} disabled={busy === 'content'} className="text-left p-4 rounded-xl border border-line hover:border-coral bg-card-sheen transition">
              <FileInput className="w-5 h-5 text-ink-soft mb-2" />
              <div className="font-bold text-sm text-ink">{busy === 'content' ? 'Adding…' : 'Add draft placeholder'}</div>
              <div className="text-xs text-ink-faint">Fill it in later</div>
            </button>
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4" /> Back</Button>
            <Button onClick={() => setStep(3)}>Next <ArrowRight className="w-4 h-4" /></Button>
          </div>
        </Card>
      )}

      {/* STEP 3 — convert */}
      {step === 3 && campaign && (
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold tracking-tight mb-1 flex items-center gap-2"><Globe className="w-5 h-5 text-coral-ink" /> Capture leads</h3>
          <p className="text-sm text-ink-soft mb-4">Add a landing page and a lead form — submissions flow straight into your pipeline with attribution to this campaign.</p>
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            <button onClick={addLanding} disabled={busy === 'landing'} className="text-left p-4 rounded-xl border border-line hover:border-coral bg-card-sheen transition">
              <Globe className="w-5 h-5 text-coral-ink mb-2" />
              <div className="font-bold text-sm text-ink">{busy === 'landing' ? 'Adding…' : 'Add landing page'}</div>
              <div className="text-xs text-ink-faint">{assembly?.counts.landing ? `${assembly.counts.landing} attached` : 'Brand-accented, hosted'}</div>
            </button>
            <button onClick={addForm} disabled={busy === 'form'} className="text-left p-4 rounded-xl border border-line hover:border-coral bg-card-sheen transition">
              <FileInput className="w-5 h-5 text-coral-ink mb-2" />
              <div className="font-bold text-sm text-ink">{busy === 'form' ? 'Adding…' : 'Add lead form'}</div>
              <div className="text-xs text-ink-faint">{assembly?.counts.forms ? `${assembly.counts.forms} attached` : 'UTM-tracked → pipeline'}</div>
            </button>
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4" /> Back</Button>
            <Button onClick={() => setStep(4)}>Review <ArrowRight className="w-4 h-4" /></Button>
          </div>
        </Card>
      )}

      {/* STEP 4 — launch */}
      {step === 4 && campaign && (
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold tracking-tight mb-1 flex items-center gap-2"><Megaphone className="w-5 h-5 text-coral-ink" /> Review & launch</h3>
          <p className="text-sm text-ink-soft mb-4"><strong>{campaign.name}</strong> · {objective} · {inr(Number(budget))} budget</p>
          <div className="space-y-2 mb-5">
            {(assembly?.checklist || []).map((s) => (
              <div key={s.key} className="flex items-center gap-2.5 text-sm">
                {s.done ? <Check className="w-4 h-4 text-success" /> : <Circle className="w-4 h-4 text-ink-faint" />}
                <span className={s.done ? 'text-ink' : 'text-ink-faint'}>{s.label}</span>
                {s.count != null && s.count > 0 && <Badge tone="success">{s.count}</Badge>}
              </div>
            ))}
          </div>
          {!assembly?.ready && (
            <div className="text-xs text-ink-soft bg-warning-soft/60 rounded-lg px-3 py-2 mb-4">
              You can launch now and complete the rest later — or go back and finish the checklist.
            </div>
          )}
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(3)}><ArrowLeft className="w-4 h-4" /> Back</Button>
            <Button variant="spark" onClick={launch} disabled={busy === 'launch'}>
              {busy === 'launch' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Rocket className="w-4 h-4" /> Launch campaign</>}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
