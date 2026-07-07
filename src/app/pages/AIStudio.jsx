import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles, Wand2, Image as ImageIcon, Type, Smartphone, Monitor, RefreshCw,
  Plus, Check, AlertTriangle, FileText, Video, Scissors, Crop, CalendarPlus, Send,
  Flame, Swords, X, ArrowRight,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { brandBrainFor } from '../data/brandBrain';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge, Tabs, Pacing } from '../../ui';
import { cn } from '../../lib/cn';

const TYPES = [
  { id: 'ig_post', label: 'Instagram Post', platform: 'instagram' },
  { id: 'ig_carousel', label: 'Carousel', platform: 'instagram' },
  { id: 'ig_reel', label: 'Reel', platform: 'instagram' },
  { id: 'fb_post', label: 'Facebook Post', platform: 'facebook' },
  { id: 'li_post', label: 'LinkedIn Post', platform: 'linkedin' },
  { id: 'x_post', label: 'X Post', platform: 'twitter' },
  { id: 'yt_short', label: 'YouTube Short', platform: 'youtube' },
  { id: 'wa_promo', label: 'WhatsApp', platform: 'whatsapp' },
];
const MODES = ['From brief', 'From campaign', 'From trend', 'From product', 'From URL', 'Repurpose'];
const LANGS = ['English', 'Hindi', 'Hinglish', 'Marathi'];
const COPY_TOOLS = ['Rewrite', 'Shorten', 'Expand', 'Change tone', 'Add CTA', 'Hooks', 'Hashtags', 'Translate', 'Hinglish'];
const VISUAL_TOOLS = [
  { label: 'AI image', icon: ImageIcon }, { label: 'Background removal', icon: Scissors },
  { label: 'Resize / aspect', icon: Crop }, { label: 'Text overlay', icon: Type },
  { label: 'Lip Sync', icon: Video, href: '/lipsync' }, { label: 'Leadership Photo', icon: ImageIcon, href: '/photo' },
];

function sampleCopy(ws, topic) {
  const t = topic || 'a high-engagement post';
  return {
    caption: `${ws.name} ☀️ ${t.charAt(0).toUpperCase() + t.slice(1)} is here.\n\nBook your slot today — gentle, transparent and trusted by ${ws.location}. No-cost EMI available. Tap the link to reserve your spot. 👇`,
    hashtags: ['EffySocial', ws.location.replace(/\s/g, ''), 'BookNow', 'TrustedCare', 'LimitedSlots'],
  };
}
function sampleScores() {
  return [
    { label: 'Brand alignment', value: 92, note: 'Uses approved tone + words. Matches Brand Brain voice.' },
    { label: 'Hook strength', value: 71, note: 'First line is clear; try a question hook to lift it.' },
    { label: 'CTA strength', value: 84, note: 'Single, action-led CTA present.' },
    { label: 'Platform fit', value: 88, note: 'Length + emoji density good for Instagram.' },
    { label: 'Readability', value: 90, note: 'Short sentences, scannable.' },
    { label: 'Ad-policy risk', value: 18, note: 'Low. No prohibited claims detected.', invert: true },
  ];
}

function scoreTone(v, invert) {
  const good = invert ? v < 30 : v >= 80;
  const mid = invert ? v < 60 : v >= 60;
  return good ? 'success' : mid ? 'warning' : 'error';
}

export default function AIStudio() {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const brain = brandBrainFor(workspace);
  const [type, setType] = useState(TYPES[0]);
  const [mode, setMode] = useState(MODES[0]);
  const [topic, setTopic] = useState(params.get('topic') || '');
  const [lang, setLang] = useState('English');
  const [tab, setTab] = useState('copy');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState('mobile');
  const [trend, setTrend] = useState(params.get('trend') || '');   // strategy context → generation (from Playbook or rail)
  const [angle, setAngle] = useState(params.get('angle') || '');
  const [sent, setSent] = useState(false);

  // Live strategy context — trends + competitor angles, right beside the composer.
  const { data: ctx } = useQuery({
    queryKey: ['studio-context', workspace?.id],
    queryFn: () => effyApi.studioContext(workspace.id),
    enabled: !!workspace,
  });

  const generate = async () => {
    if (!workspace) return;
    setBusy(true);
    setResult(null);
    setSent(false);
    try {
      const d = await effyApi.generateStudio({ workspace: workspace.id, type: type.id, topic, language: lang, trend, angle });
      setResult({ caption: d.caption, hashtags: d.hashtags || [], scores: d.scores || [], hook: d.hook, cta: d.cta, cited: d.cited || [] });
    } catch (e) {
      setResult({ caption: `Generation failed: ${e.message || 'try again'}`, hashtags: [], scores: [] });
    } finally {
      setBusy(false);
    }
  };

  const sendToApproval = async () => {
    if (!result) return;
    await effyApi.sendToApproval({
      workspace: workspace.id, hook: result.hook, caption: result.caption,
      channel: type.platform, type: type.id.split('_')[1] || 'post',
    });
    setSent(true);
  };

  return (
    <div>
      <PageHeader
        title="AI Studio"
        subtitle="Create brand-aware copy and visuals, scored and preview-ready."
        actions={
          <>
            <Button variant="secondary" disabled={!result} onClick={() => navigate('/app/calendar')}><CalendarPlus className="w-4 h-4" /> Add to calendar</Button>
            <Button disabled={!result || sent} onClick={sendToApproval}>
              {sent ? <><Check className="w-4 h-4" /> Sent</> : <><Send className="w-4 h-4" /> Send to approval</>}
            </Button>
          </>
        }
      />

      {/* type + mode bar */}
      <Card className="p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map((t) => (
            <button key={t.id} onClick={() => setType(t)}
              className={cn('px-3 py-1.5 rounded-full text-sm font-semibold transition',
                type.id === t.id ? 'bg-coral text-white' : 'bg-surface2 text-ink-soft hover:text-ink')}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <select value={mode} onChange={(e) => setMode(e.target.value)} className="rounded-lg border-0 bg-surface2 px-3 py-1.5 text-sm font-medium">
          {MODES.map((m) => <option key={m}>{m}</option>)}
        </select>
      </Card>

      {/* 3 panels */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-4">
        {/* LEFT — brief + brand context */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-bold text-ink mb-3 text-sm">Brief</h3>
            <label className="block text-xs font-semibold text-ink-soft mb-1">Topic / message</label>
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3}
              placeholder="e.g. monsoon dental check-up offer" className="w-full rounded-xl border-0 bg-surface2 px-3.5 py-2.5 text-sm mb-3" />
            <label className="block text-xs font-semibold text-ink-soft mb-1">Language</label>
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full rounded-xl border-0 bg-surface2 px-3.5 py-2.5 text-sm mb-3 font-medium">
              {LANGS.map((l) => <option key={l}>{l}</option>)}
            </select>
            {(trend || angle) && (
              <div className="mb-3 space-y-1">
                {trend && <div className="flex items-center gap-1.5 text-[0.7rem] bg-coral-tint text-coral-ink ring-1 ring-inset ring-coral/20 rounded-md px-2 py-1"><Flame className="w-3 h-3" /> Trend: {trend}<button onClick={() => setTrend('')} className="ml-auto"><X className="w-3 h-3" /></button></div>}
                {angle && <div className="flex items-center gap-1.5 text-[0.7rem] bg-info-soft text-info ring-1 ring-inset ring-info/20 rounded-md px-2 py-1"><Swords className="w-3 h-3" /> Angle: {angle}<button onClick={() => setAngle('')} className="ml-auto"><X className="w-3 h-3" /></button></div>}
              </div>
            )}
            <Button variant="spark" className="w-full" onClick={generate} disabled={busy}>
              <Sparkles className="w-4 h-4" /> {busy ? 'Generating…' : 'Generate'}
            </Button>
          </Card>

          {/* Strategy context rail — trends + competitor angles, inline */}
          <Card className="p-4">
            <h3 className="font-bold text-ink mb-1 text-sm flex items-center gap-1.5"><Flame className="w-4 h-4 text-error" /> What's trending</h3>
            <p className="text-xs text-ink-faint mb-2.5">Tap to write with this theme.</p>
            <div className="space-y-2 mb-5">
              {(ctx?.trends || []).map((t) => (
                <button key={t.topic} onClick={() => setTrend(t.topic)}
                  className={cn('group w-full flex items-center gap-2.5 text-left text-xs px-2.5 py-2.5 rounded-xl transition-all',
                    trend === t.topic ? 'bg-coral-tint text-coral-ink shadow-e1' : 'bg-surface2/60 text-ink-soft hover:bg-coral-tint/60')}>
                  <span className={cn('grid place-items-center w-6 h-6 rounded-lg shrink-0', t.heat === 'hot' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning')}>
                    <Flame className="w-3 h-3" />
                  </span>
                  <span className="flex-1 font-medium leading-snug">{t.topic}</span>
                  {trend === t.topic
                    ? <Check className="w-3.5 h-3.5 shrink-0" />
                    : <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-coral-ink" />}
                </button>
              ))}
            </div>
            <h3 className="font-bold text-ink mb-1 text-sm flex items-center gap-1.5"><Swords className="w-4 h-4 text-coral-ink" /> Competitor angles</h3>
            <p className="text-xs text-ink-faint mb-2.5">Differentiate — tap to set the angle.</p>
            <div className="space-y-2">
              {(ctx?.competitorAngles || []).map((a) => (
                <button key={a} onClick={() => setAngle(a)}
                  className={cn('group w-full flex items-start gap-2.5 text-left text-xs px-2.5 py-2.5 rounded-xl transition-all leading-snug',
                    angle === a ? 'bg-info-soft text-info shadow-e1' : 'bg-surface2/60 text-ink-soft hover:bg-info-soft/50')}>
                  <span className="grid place-items-center w-6 h-6 rounded-lg shrink-0 bg-info/10 text-info"><Swords className="w-3 h-3" /></span>
                  <span className="flex-1 font-medium">{a}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-bold text-ink mb-2 text-sm flex items-center gap-1.5"><Wand2 className="w-4 h-4 text-coral-ink" /> Brand context</h3>
            <p className="text-xs text-ink-faint mb-2">Pulled from Brand Brain — shapes every generation.</p>
            <div className="text-xs font-semibold text-ink-soft mb-1">Tone</div>
            <div className="flex flex-wrap gap-1.5 mb-3">{brain.tone.data.slice(0, 5).map((t) => <Badge key={t}>{t}</Badge>)}</div>
            <div className="text-xs font-semibold text-ink-soft mb-1">Approved words</div>
            <div className="flex flex-wrap gap-1.5">{brain.approved.data.slice(0, 5).map((t) => <Badge key={t} tone="success">{t}</Badge>)}</div>
          </Card>
        </div>

        {/* CENTRE — editor */}
        <Card className="p-5">
          <div className="inline-flex items-center gap-1 bg-surface2 rounded-full p-1 mb-5">
            {[{ id: 'copy', label: 'Copy' }, { id: 'visual', label: 'Visual' }].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn('px-5 py-1.5 rounded-full text-sm font-semibold transition-all',
                  tab === t.id ? 'bg-surface text-ink shadow-e1' : 'text-ink-faint hover:text-ink')}>
                {t.label}
              </button>
            ))}
          </div>
          {tab === 'copy' ? (
            <div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {COPY_TOOLS.map((tool) => (
                  <button key={tool} disabled={!result} onClick={generate}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-surface2 text-ink-soft hover:bg-coral-tint hover:text-coral-ink disabled:opacity-40 transition">
                    {tool}
                  </button>
                ))}
              </div>
              {busy ? (
                <div className="h-48 rounded-lg bg-surface2 animate-pulse" />
              ) : result ? (
                <>
                  <textarea key={result.caption} defaultValue={result.caption} rows={9}
                    className="w-full rounded-lg border border-line bg-surface px-3.5 py-3 text-sm leading-relaxed" />
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {result.hashtags.map((h) => <Badge key={h} tone="new">#{h}</Badge>)}
                  </div>
                </>
              ) : (
                <div className="h-48 grid place-items-center text-center text-ink-faint">
                  <div>
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Add a brief and hit <strong>Generate</strong> to draft {type.label} copy.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {VISUAL_TOOLS.map((v) => (
                  <a key={v.label} href={v.href || undefined} target={v.href ? '_blank' : undefined} rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border border-line text-ink-soft hover:border-coral hover:text-coral-ink">
                    <v.icon className="w-3.5 h-3.5" /> {v.label}
                  </a>
                ))}
              </div>
              <div className="aspect-square max-w-sm mx-auto rounded-xl bg-aurora grid place-items-center text-white">
                <div className="text-center"><ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-80" /><p className="text-sm font-semibold">Generate a visual</p></div>
              </div>
            </div>
          )}
        </Card>

        {/* RIGHT — scores + preview */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-ink text-sm">Creative scores</h3>
              {result && <button onClick={generate} className="text-ink-faint hover:text-ink"><RefreshCw className="w-4 h-4" /></button>}
            </div>
            {result ? (
              <div className="space-y-3">
                {result.scores.map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-ink">{s.label}</span>
                      <span className="tabular-nums text-ink-soft">{s.value}{s.invert ? ' risk' : '%'}</span>
                    </div>
                    <Pacing value={s.value} max={100} tone={scoreTone(s.value, s.invert)} />
                    <p className="text-[0.7rem] text-ink-faint mt-1 leading-snug">{s.note}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-ink-faint">Scores appear after generation, each with an explanation.</p>}
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-ink text-sm">Preview</h3>
              <div className="flex rounded-md border border-line p-0.5">
                <button onClick={() => setPreview('mobile')} className={cn('p-1 rounded', preview === 'mobile' && 'bg-surface2 text-coral-ink')}><Smartphone className="w-4 h-4" /></button>
                <button onClick={() => setPreview('desktop')} className={cn('p-1 rounded', preview === 'desktop' && 'bg-surface2 text-coral-ink')}><Monitor className="w-4 h-4" /></button>
              </div>
            </div>
            <div className={cn('mx-auto rounded-xl border border-line overflow-hidden bg-surface', preview === 'mobile' ? 'max-w-[220px]' : 'w-full')}>
              <div className="flex items-center gap-2 p-2.5 border-b border-line">
                <span className="grid place-items-center w-6 h-6 rounded-full text-xs" style={{ background: workspace.accent + '22' }}>{workspace.logo}</span>
                <span className="text-xs font-bold">{workspace.name.toLowerCase().replace(/\s/g, '')}</span>
              </div>
              <div className="aspect-square bg-aurora" />
              <div className="p-2.5 text-[0.72rem] text-ink-soft line-clamp-3 whitespace-pre-wrap">
                {result?.caption || 'Your caption preview will appear here.'}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
