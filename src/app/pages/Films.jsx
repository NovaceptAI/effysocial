import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clapperboard, Palette, FileText, Image as ImageIcon, Film, Mic, Layers,
  Send, Plus, RefreshCw, Trash2, Play, ArrowRight, Download,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge } from '../../ui';

// The 7 stages, each with its cost behavior — the user should understand the
// whole journey AND where money is spent before clicking anything.
const STEPS = [
  { icon: Palette, title: 'Assets & Direction', text: 'Upload logo, pack shots, references. AI reads your brand colors and suggests audience, setting and concept.', cost: 'free' },
  { icon: FileText, title: 'Brief & Script', text: 'AI drafts the beat map in English, Hinglish or Hindi. Every line editable.', cost: 'free' },
  { icon: ImageIcon, title: 'Stills', text: 'One matched still per scene. Regenerate and edit until every frame is right — this is the cheap zone.', cost: '~$0.05 / image' },
  { icon: Film, title: 'Animate', text: 'Approved stills come alive with Veo. Locked until every still is approved. Each clip is auto-checked for stray voices.', cost: '~$0.60 / scene' },
  { icon: Mic, title: 'Voice', text: 'Pick the narrator, generate every line, catch overruns before the mix.', cost: 'free' },
  { icon: Layers, title: 'Assemble', text: 'Beat-timed voiceover over scene ambience, brand end card, final audio QA.', cost: 'free' },
  { icon: Send, title: 'Deliver', text: 'Master, 9:16 reel and WhatsApp exports — auto-filed to your Media Library.', cost: 'free' },
];

const LANGS = ['Hinglish', 'English', 'Hindi'];

const STATUS_BADGE = {
  draft: { label: 'Draft', tone: 'default' },
  production: { label: 'In production', tone: 'new' },
  delivered: { label: 'Delivered', tone: 'success' },
};

export default function Films() {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [product, setProduct] = useState('');
  const [language, setLanguage] = useState('Hinglish');

  const { data: films = [], isLoading } = useQuery({
    queryKey: ['films', workspace?.id],
    queryFn: () => effyApi.listFilms(workspace.id),
    enabled: !!workspace,
  });

  const create = useMutation({
    mutationFn: () => effyApi.createFilm({
      workspace: workspace.id, title: title.trim(), client: client.trim(),
      product: product.trim(), language,
    }),
    onSuccess: (film) => {
      qc.invalidateQueries({ queryKey: ['films', workspace?.id] });
      navigate(`/app/films/${film.id}`);
    },
  });

  const remove = useMutation({
    mutationFn: (id) => effyApi.deleteFilm(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['films', workspace?.id] }),
  });

  return (
    <div>
      <PageHeader
        title="Ad Films"
        subtitle="Create your own ad film — a guided production room, from brief to delivered film."
      />

      {/* The journey, cost behavior included */}
      <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        {STEPS.map((s, i) => (
          <Card key={s.title} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="grid place-items-center w-8 h-8 rounded-lg bg-aurora text-white shadow-coral shrink-0">
                <s.icon className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold text-ink-faint">STEP {i + 1}</span>
            </div>
            <div className="font-semibold text-sm leading-tight">{s.title}</div>
            <p className="text-xs text-ink-soft mt-1.5 leading-snug">{s.text}</p>
            <div className={`mt-2 inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${s.cost === 'free' ? 'bg-surface2 text-ink-faint' : 'bg-amber-100 text-amber-800'}`}>
              {s.cost}
            </div>
          </Card>
        ))}
      </div>

      {/* Create */}
      <Card className="p-6 mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-aurora text-white shadow-coral"><Clapperboard className="w-5 h-5" /></span>
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight">Start a new film</h2>
              <p className="text-sm text-ink-soft mt-0.5">The lights go down, the room goes quiet — everything autosaves, exit anytime.</p>
            </div>
          </div>
          {!creating && (
            <Button variant="spark" onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> Create your film</Button>
          )}
        </div>
        {creating && (
          <div className="mt-5 pt-5 border-t border-hair grid sm:grid-cols-[1fr_1fr_1fr_auto_auto] gap-2.5 items-end">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-1.5">Film title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Roof Ka Rakshak"
                className="w-full rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-1.5">Client</label>
              <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="e.g. Pidilite"
                className="w-full rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-1.5">Product</label>
              <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="e.g. Roofseal Classic"
                className="w-full rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-1.5">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-xl bg-surface2 px-3 py-2.5 text-sm font-medium">
                {LANGS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <Button onClick={() => create.mutate()} disabled={!title.trim() || create.isPending}>
              {create.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />} Enter the room
            </Button>
          </div>
        )}
      </Card>

      {/* Your films */}
      <h3 className="font-display text-lg font-semibold tracking-tight mb-3">Your films</h3>
      {isLoading ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : films.length === 0 ? (
        <Card className="p-8 text-center text-sm text-ink-soft">
          No films yet. Your first production starts with “Create your film”.
        </Card>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {films.map((f) => {
            const badge = STATUS_BADGE[f.status] || STATUS_BADGE.draft;
            const master = f.renders?.master;
            return (
              <Card key={f.id} className="overflow-hidden group">
                <button type="button" onClick={() => navigate(`/app/films/${f.id}`)}
                  className="block w-full text-left bg-transparent">
                  <div className="relative h-36 bg-[#0D0E12] grid place-items-center overflow-hidden">
                    {f.posterUrl ? (
                      <img src={f.posterUrl} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <Clapperboard className="w-8 h-8 text-white/25" />
                    )}
                    {f.status === 'delivered' && master && (
                      <span className="absolute inset-0 grid place-items-center bg-black/30">
                        <span className="grid place-items-center w-11 h-11 rounded-full bg-white/90"><Play className="w-5 h-5 ml-0.5 text-ink" /></span>
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-sm truncate">{f.title}</div>
                      <Badge tone={badge.tone}>{badge.label}</Badge>
                    </div>
                    <p className="text-xs text-ink-soft mt-1 truncate">{f.client || '—'}{f.product ? ` · ${f.product}` : ''}</p>
                    <p className="text-[11px] text-ink-faint mt-2">
                      {f.status === 'delivered' ? `Delivered · ${f.durationS}s` : `Stage ${f.stage} of 7`}
                      {f.spendUsd > 0 && ` · $${f.spendUsd.toFixed(2)} spent`}
                    </p>
                  </div>
                </button>
                <div className="px-4 pb-3 flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/app/films/${f.id}`)}>
                    {f.status === 'delivered' ? 'Open' : 'Resume'}
                  </Button>
                  {f.status === 'delivered' && master && (
                    <a href={master} download className="inline-flex items-center gap-1 text-xs font-semibold text-ink-soft hover:text-ink">
                      <Download className="w-3.5 h-3.5" /> Master
                    </a>
                  )}
                  <button type="button" title="Delete film"
                    onClick={() => window.confirm(`Delete "${f.title}"? Renders already paid for will be removed from this list.`) && remove.mutate(f.id)}
                    className="ml-auto bg-transparent text-ink-faint hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
