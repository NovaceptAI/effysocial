import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clapperboard, Palette, FileText, Image as ImageIcon, Film, Mic, Layers,
  Send, Plus, RefreshCw, Trash2, Play, ArrowRight, Download, Link as LinkIcon,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge } from '../../ui';

// The 7 stages of the production room. Each card carries its cost behavior and
// reveals what actually happens inside on hover — the user should understand
// the whole journey AND where money is spent before clicking anything.
const STEPS = [
  { icon: Palette, title: 'Assets & Direction', tag: 'Your brand, read by AI', cost: 'free',
    details: ['Upload logo, pack shots, reference films', 'Palette extracted from your real assets', 'Audience, setting & concept options built from them'] },
  { icon: FileText, title: 'Brief & Script', tag: 'Beats written to the second', cost: 'free',
    details: ['English, Hinglish or Hindi', 'You choose scenes & seconds per scene', 'Every line stays editable in a full-width editor'] },
  { icon: ImageIcon, title: 'Stills', tag: 'The approval gate', cost: '~$0.07 / image',
    details: ['One matched frame per scene, seed-chained', 'Regenerate & edit until every frame is right', 'Nothing animates until you approve them all'] },
  { icon: Film, title: 'Animate', tag: 'Veo brings frames alive', cost: '$0.15 / second',
    details: ['Image-to-video from your approved stills', 'Every clip auto-checked for stray voices', 'Failed renders refunded automatically'] },
  { icon: Mic, title: 'Voice', tag: 'Cast your narrator', cost: 'free',
    details: ['Search 5,000+ library voices, audition free', 'Lines measured against each scene window', 'Long or short reads flagged before the mix'] },
  { icon: Layers, title: 'Assemble', tag: 'The final cut', cost: 'free',
    details: ['Beat-timed voiceover over scene ambience', 'Brand end card with your real logo', 'Final AI audio QA on the mix'] },
  { icon: Send, title: 'Deliver', tag: 'Every format, every dealer', cost: 'free',
    details: ['Master, 9:16 reel, WhatsApp exports', 'Per-dealer versions at zero extra AI spend', 'Auto-filed into your Media Library'] },
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

      {/* The journey — a dark cinematic band; each card lifts and reveals its
          craft details on hover. This is the shop window, not a checklist. */}
      <div className="rounded-3xl mb-8 p-6 md:p-8" style={{ background: 'linear-gradient(135deg, #0D0E12 0%, #16181D 55%, #1a141a 100%)' }}>
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <div className="text-[11px] font-extrabold tracking-[0.22em] text-[#FF6A5C] mb-1.5">THE PRODUCTION ROOM</div>
            <h2 className="font-display text-2xl md:text-[1.7rem] font-semibold tracking-tight text-white">
              From brief to broadcast-ready, in seven acts
            </h2>
          </div>
          <p className="text-[13px] text-white/50 max-w-xs leading-snug">
            Money only moves at two gates — and never before you've approved every frame.
          </p>
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {STEPS.map((s, i) => (
            <div key={s.title}
              className="group relative rounded-2xl p-5 cursor-default transition-all duration-300 hover:-translate-y-1.5"
              style={{ background: '#16181D', border: '1px solid #2A2E36' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF6A5C66'; e.currentTarget.style.boxShadow = '0 18px 40px -18px rgba(255,106,92,0.35)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2E36'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div className="flex items-start justify-between mb-4">
                <span className="grid place-items-center w-11 h-11 rounded-xl text-white transition-transform duration-300 group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, #FF6A5C, #E5484D)' }}>
                  <s.icon className="w-5 h-5" />
                </span>
                <span className="font-display text-3xl font-bold leading-none select-none transition-colors duration-300 text-white/10 group-hover:text-[#FF6A5C]/40">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="font-display font-semibold text-[15px] text-white leading-tight">{s.title}</div>
              <div className="text-[11.5px] text-white/40 mt-1 mb-3">{s.tag}</div>
              <ul className="space-y-1.5 mb-3">
                {s.details.map((dd) => (
                  <li key={dd} className="flex items-start gap-2 text-[11.5px] leading-snug text-white/60">
                    <span className="mt-[5px] w-1 h-1 rounded-full shrink-0 bg-[#FF6A5C]/70" />
                    {dd}
                  </li>
                ))}
              </ul>
              <div className={`inline-block text-[10.5px] font-bold tracking-wide px-2.5 py-1 rounded-full ${s.cost === 'free'
                ? 'bg-white/5 text-white/45'
                : 'text-[#FFB020]'}`}
                style={s.cost !== 'free' ? { background: 'rgba(255,176,32,0.12)' } : undefined}>
                {s.cost === 'free' ? 'INCLUDED' : s.cost.toUpperCase()}
              </div>
              {i < STEPS.length - 1 && (
                <span className="hidden xl:block absolute top-1/2 -right-[13px] w-[10px] border-t border-dashed border-white/15" />
              )}
            </div>
          ))}
        </div>
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
                    <>
                      <a href={master} download className="inline-flex items-center gap-1 text-xs font-semibold text-ink-soft hover:text-ink">
                        <Download className="w-3.5 h-3.5" /> Master
                      </a>
                      <button type="button" onClick={() => navigator.clipboard?.writeText(master)}
                        className="bg-transparent inline-flex items-center gap-1 text-xs font-semibold text-ink-soft hover:text-ink">
                        <LinkIcon className="w-3.5 h-3.5" /> Copy link
                      </button>
                    </>
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
