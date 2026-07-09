import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles, Smartphone, Monitor, RefreshCw, Image as ImageIcon,
  Check, FileText, Film, Images, Square, MessageCircle, Video, Briefcase,
  CalendarPlus, Send, Flame, Swords, X, ArrowRight, ArrowLeft, PenLine, Palette,
  SlidersHorizontal, Search, Clapperboard,
} from 'lucide-react';
import Storyboard from '../components/Storyboard';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Button, Badge, Pacing } from '../../ui';
import { cn } from '../../lib/cn';

// Format catalogue — Canva-style cards with a real aspect thumbnail.
const FORMATS = [
  { id: 'ig_post', label: 'Instagram Post', platform: 'instagram', icon: Square, aspect: '4 / 5', size: '1080 × 1350', group: 'Instagram' },
  { id: 'ig_reel', label: 'Instagram Reel', platform: 'instagram', icon: Film, aspect: '9 / 16', size: '1080 × 1920', group: 'Instagram', video: true },
  { id: 'ig_carousel', label: 'Carousel', platform: 'instagram', icon: Images, aspect: '1 / 1', size: '1080 × 1080', group: 'Instagram' },
  { id: 'fb_post', label: 'Facebook Post', platform: 'facebook', icon: Square, aspect: '1 / 1', size: '1200 × 1200', group: 'Facebook' },
  { id: 'li_post', label: 'LinkedIn Post', platform: 'linkedin', icon: Briefcase, aspect: '1 / 1', size: '1200 × 1200', group: 'LinkedIn' },
  { id: 'x_post', label: 'X Post', platform: 'twitter', icon: Square, aspect: '16 / 9', size: '1600 × 900', group: 'X' },
  { id: 'yt_short', label: 'YouTube Short', platform: 'youtube', icon: Video, aspect: '9 / 16', size: '1080 × 1920', group: 'YouTube', video: true },
  { id: 'yt_story', label: 'YouTube Story', platform: 'youtube', icon: Clapperboard, aspect: '16 / 9', size: 'Multi-scene story', group: 'YouTube', storyboard: true, thumb: 'yt_short' },
  { id: 'wa_promo', label: 'WhatsApp', platform: 'whatsapp', icon: MessageCircle, aspect: '1 / 1', size: '1080 × 1080', group: 'WhatsApp' },
];
const FILTERS = ['Popular', 'Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'WhatsApp'];
const LANGS = ['English', 'Hindi', 'Hinglish', 'Marathi'];
const COPY_TOOLS = ['Rewrite', 'Shorten', 'Expand', 'Change tone', 'Add CTA', 'More hooks', 'Hashtags', 'Translate'];

function scoreTone(v, invert) {
  const good = invert ? v < 30 : v >= 80;
  const mid = invert ? v < 60 : v >= 60;
  return good ? 'success' : mid ? 'warning' : 'error';
}

/* ───────────────────────── Format chooser ───────────────────────── */
function FormatChooser({ onPick }) {
  const [filter, setFilter] = useState('Popular');
  const [q, setQ] = useState('');
  const shown = FORMATS.filter((f) =>
    (filter === 'Popular' || f.group === filter) &&
    (!q || f.label.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display text-[2.2rem] font-semibold tracking-tightest mb-1.5">Create a post</h1>
      <p className="text-ink-soft mb-6">Pick a format to start — you can change it later.</p>

      <div className="relative mb-5">
        <Search className="w-4 h-4 text-ink-faint absolute left-4 top-1/2 -translate-y-1/2" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="What would you like to create?"
          className="w-full rounded-2xl bg-surface2 pl-11 pr-4 py-3.5 text-sm shadow-e1" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-4 py-1.5 rounded-full text-sm font-semibold transition',
              filter === f ? 'bg-ink text-white' : 'bg-surface2 text-ink-soft hover:text-ink')}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {shown.map((f) => (
          <button key={f.id} onClick={() => onPick(f)}
            className="group text-left rounded-2xl p-4 bg-surface shadow-e1 hover:shadow-e3 hover:-translate-y-0.5 transition-all">
            <div className="grid place-items-center h-36 rounded-xl bg-surface2 mb-3 overflow-hidden">
              <div className="relative rounded-lg shadow-e2 overflow-hidden"
                style={{ aspectRatio: f.aspect, height: f.aspect.startsWith('9') ? '86%' : '62%' }}>
                <img src={`/formats/${f.thumb || f.id}.jpg`} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 grid place-items-center w-5 h-5 rounded-md bg-ink/45 text-white backdrop-blur-sm"><f.icon className="w-3 h-3" /></span>
              </div>
            </div>
            <div className="font-bold text-sm text-ink">{f.label}</div>
            <div className="text-xs text-ink-faint mt-0.5">{f.size} px</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Studio workspace ───────────────────────── */
const TOOLS = [
  { id: 'brief', label: 'Brief', icon: PenLine },
  { id: 'trends', label: 'Trends', icon: Flame },
  { id: 'brand', label: 'Brand', icon: Palette },
  { id: 'refine', label: 'Refine', icon: SlidersHorizontal },
];

export default function AIStudio() {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Deep-linked from a playbook? Skip the chooser and open the composer.
  const seeded = params.get('trend') || params.get('angle') || params.get('topic');
  const [format, setFormat] = useState(seeded ? FORMATS[0] : null);

  const [panel, setPanel] = useState('brief');   // open tool panel (or null)
  const [topic, setTopic] = useState(params.get('topic') || '');
  const [lang, setLang] = useState('English');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState('mobile');
  const [trend, setTrend] = useState(params.get('trend') || '');
  const [angle, setAngle] = useState(params.get('angle') || '');
  const [sent, setSent] = useState(false);
  const [showScores, setShowScores] = useState(true);
  const [image, setImage] = useState('');       // generated visual URL
  const [imgBusy, setImgBusy] = useState(false);
  const [video, setVideo] = useState('');       // generated video URL (Veo)
  const [vidBusy, setVidBusy] = useState(false);
  const [vidMsg, setVidMsg] = useState('');     // progress/error line for video
  const [refining, setRefining] = useState('');  // which tool is running
  const captionRef = useRef(null);

  const { data: ctx } = useQuery({
    queryKey: ['studio-context', workspace?.id],
    queryFn: () => effyApi.studioContext(workspace.id),
    enabled: !!workspace,
  });

  const generate = async () => {
    if (!workspace || !format) return;
    setBusy(true); setResult(null); setSent(false);
    try {
      const d = await effyApi.generateStudio({ workspace: workspace.id, type: format.id, topic, language: lang, trend, angle });
      setResult({ caption: d.caption, hashtags: d.hashtags || [], scores: d.scores || [], hook: d.hook, cta: d.cta, cited: d.cited || [] });
      setPanel(null);   // collapse the tool panel so the result gets full room
    } catch (e) {
      setResult({ caption: `Generation failed: ${e.message || 'try again'}`, hashtags: [], scores: [] });
    } finally { setBusy(false); }
  };
  const sendToApproval = async () => {
    if (!result) return;
    await effyApi.sendToApproval({ workspace: workspace.id, hook: result.hook, caption: result.caption, channel: format.platform, type: format.id.split('_')[1] || 'post' });
    setSent(true);
  };
  const refine = async (tool) => {
    const current = captionRef.current?.value ?? result?.caption;
    if (!current) return;
    setRefining(tool);
    try {
      const d = await effyApi.studioRefine({ workspace: workspace.id, type: format.id, tool, caption: current, language: lang });
      setResult((r) => ({ ...r, caption: d.caption ?? r.caption, hashtags: d.hashtags ?? r.hashtags, scores: d.scores ?? r.scores, hook: d.hook ?? r.hook }));
    } finally { setRefining(''); }
  };
  const genImage = async () => {
    if (!workspace || !format) return;
    setImgBusy(true);
    try {
      const d = await effyApi.studioImage({ workspace: workspace.id, topic: topic || trend || angle, aspect: format.aspect });
      if (d.imageUrl) setImage(d.imageUrl);
    } finally { setImgBusy(false); }
  };
  // Veo video — long-running: start, then poll every 8s (Veo takes ~1–3 min).
  const genVideo = async () => {
    if (!workspace || !format) return;
    setVidBusy(true); setVideo(''); setVidMsg('Starting render…');
    try {
      const { op } = await effyApi.studioVideoStart({ workspace: workspace.id, topic: topic || trend || angle, trend, aspect: format.aspect });
      setVidMsg('Rendering video…');
      for (let i = 0; i < 60; i += 1) {
        const st = await effyApi.studioVideoStatus({ workspace: workspace.id, op });
        if (st.status === 'ready') { setVideo(st.videoUrl); setVidMsg(''); return; }
        setVidMsg('Rendering video — this can take up to a few minutes…');
        await new Promise((r) => setTimeout(r, 8000));
      }
      setVidMsg('Still rendering — try again in a moment.');
    } catch (e) {
      setVidMsg(e.message || 'Video generation failed.');
    } finally { setVidBusy(false); }
  };

  if (!format) {
    return <FormatChooser onPick={(f) => { setFormat(f); setPanel('brief'); }} />;
  }

  // Storyboard formats get a dedicated multi-scene experience.
  if (format.storyboard) {
    return <Storyboard format={format} onBack={() => setFormat(null)} initialBrief={topic} />;
  }

  const chip = (label, val, clear, tone) => (
    <div className={cn('flex items-center gap-1.5 text-[0.7rem] rounded-lg px-2 py-1', tone)}>
      {label}<button onClick={clear} className="ml-auto"><X className="w-3 h-3" /></button>
    </div>
  );

  return (
    <div className="-mt-1">
      {/* Contextual top bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button onClick={() => { setFormat(null); setResult(null); setImage(''); setVideo(''); setVidMsg(''); }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
          <ArrowLeft className="w-4 h-4" /> Formats
        </button>
        <div className="h-5 w-px bg-line" />
        <span className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <format.icon className="w-4 h-4 text-coral-ink" /> {format.label}
        </span>
        <span className="text-xs text-ink-faint hidden sm:inline">{format.size} px</span>
        <div className="flex-1" />
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="rounded-lg bg-surface2 px-3 py-2 text-sm font-medium">
          {LANGS.map((l) => <option key={l}>{l}</option>)}
        </select>
        <Button variant="secondary" disabled={!result} onClick={() => navigate('/app/calendar')}><CalendarPlus className="w-4 h-4" /> Calendar</Button>
        <Button disabled={!result || sent} onClick={sendToApproval}>
          {sent ? <><Check className="w-4 h-4" /> Sent</> : <><Send className="w-4 h-4" /> Send to approval</>}
        </Button>
      </div>

      {/* Editor: slim icon rail · optional panel · big canvas · scores */}
      <div className="flex gap-4 items-start">
        {/* icon rail */}
        <div className="shrink-0 flex flex-col gap-1 bg-surface rounded-2xl shadow-e1 p-1.5">
          {TOOLS.map((t) => (
            <button key={t.id} onClick={() => setPanel(panel === t.id ? null : t.id)} title={t.label}
              className={cn('grid place-items-center w-11 h-11 rounded-xl transition',
                panel === t.id ? 'bg-coral text-white' : 'text-ink-soft hover:bg-surface2')}>
              <t.icon className="w-[18px] h-[18px]" />
            </button>
          ))}
        </div>

        {/* tool panel (on demand) */}
        {panel && (
          <div className="shrink-0 w-72 bg-surface rounded-2xl shadow-e1 p-4 max-h-[76vh] overflow-y-auto">
            {panel === 'brief' && (
              <>
                <h3 className="font-bold text-ink text-sm mb-3">Brief</h3>
                <label className="block text-xs font-semibold text-ink-soft mb-1">What's this post about?</label>
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={4}
                  placeholder="e.g. monsoon dental check-up offer" className="w-full rounded-xl bg-surface2 px-3.5 py-2.5 text-sm mb-3" />
                {(trend || angle) && (
                  <div className="space-y-1.5 mb-3">
                    {trend && chip(<><Flame className="w-3 h-3" /> {trend}</>, trend, () => setTrend(''), 'bg-coral-tint text-coral-ink')}
                    {angle && chip(<><Swords className="w-3 h-3" /> {angle}</>, angle, () => setAngle(''), 'bg-info-soft text-info')}
                  </div>
                )}
                <Button variant="spark" className="w-full" onClick={generate} disabled={busy}>
                  <Sparkles className="w-4 h-4" /> {busy ? 'Generating…' : result ? 'Regenerate' : 'Generate'}
                </Button>
              </>
            )}
            {panel === 'trends' && (
              <>
                <h3 className="font-bold text-ink text-sm mb-1 flex items-center gap-1.5"><Flame className="w-4 h-4 text-error" /> Trending</h3>
                <p className="text-xs text-ink-faint mb-3">Tap to write with this theme.</p>
                <div className="space-y-2 mb-5">
                  {(ctx?.trends || []).map((t) => (
                    <button key={t.topic} onClick={() => setTrend(t.topic)}
                      className={cn('group w-full flex items-center gap-2.5 text-left text-xs px-2.5 py-2.5 rounded-xl transition-all',
                        trend === t.topic ? 'bg-coral-tint text-coral-ink shadow-e1' : 'bg-surface2/60 text-ink-soft hover:bg-coral-tint/60')}>
                      <span className={cn('grid place-items-center w-6 h-6 rounded-lg shrink-0', t.heat === 'hot' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning')}><Flame className="w-3 h-3" /></span>
                      <span className="flex-1 font-medium leading-snug">{t.topic}</span>
                      {trend === t.topic ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-coral-ink" />}
                    </button>
                  ))}
                </div>
                <h3 className="font-bold text-ink text-sm mb-1 flex items-center gap-1.5"><Swords className="w-4 h-4 text-coral-ink" /> Competitor angles</h3>
                <p className="text-xs text-ink-faint mb-3">Differentiate — tap to set the angle.</p>
                <div className="space-y-2">
                  {(ctx?.competitorAngles || []).map((a) => (
                    <button key={a} onClick={() => setAngle(a)}
                      className={cn('w-full flex items-start gap-2.5 text-left text-xs px-2.5 py-2.5 rounded-xl transition-all leading-snug',
                        angle === a ? 'bg-info-soft text-info shadow-e1' : 'bg-surface2/60 text-ink-soft hover:bg-info-soft/50')}>
                      <span className="grid place-items-center w-6 h-6 rounded-lg shrink-0 bg-info/10 text-info"><Swords className="w-3 h-3" /></span>
                      <span className="flex-1 font-medium">{a}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {panel === 'brand' && (
              <>
                <h3 className="font-bold text-ink text-sm mb-1 flex items-center gap-1.5"><Palette className="w-4 h-4 text-coral-ink" /> Brand context</h3>
                <p className="text-xs text-ink-faint mb-3">From Brand Brain — shapes every generation.</p>
                <div className="text-xs font-semibold text-ink-soft mb-1.5">Tone</div>
                <div className="flex flex-wrap gap-1.5 mb-4">{(ctx?.brand?.tone || []).slice(0, 6).map((t) => <Badge key={t}>{t}</Badge>)}</div>
                <div className="text-xs font-semibold text-ink-soft mb-1.5">Approved words</div>
                <div className="flex flex-wrap gap-1.5">{(ctx?.brand?.approved || []).slice(0, 6).map((t) => <Badge key={t} tone="success">{t}</Badge>)}</div>
              </>
            )}
            {panel === 'refine' && (
              <>
                <h3 className="font-bold text-ink text-sm mb-1 flex items-center gap-1.5"><SlidersHorizontal className="w-4 h-4 text-coral-ink" /> Refine copy</h3>
                <p className="text-xs text-ink-faint mb-3">{result ? 'Transforms your current caption.' : 'Generate a draft first.'}</p>
                <div className="flex flex-wrap gap-1.5">
                  {COPY_TOOLS.map((tool) => (
                    <button key={tool} disabled={!result || !!refining} onClick={() => refine(tool.toLowerCase())}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-surface2 text-ink-soft hover:bg-coral-tint hover:text-coral-ink disabled:opacity-40 transition">
                      {refining === tool.toLowerCase() && <RefreshCw className="w-3 h-3 animate-spin" />}{tool}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* CANVAS — the calm centre */}
        <div className="flex-1 min-w-0 bg-surface rounded-2xl shadow-e1 min-h-[76vh] flex flex-col">
          {busy ? (
            <div className="flex-1 grid place-items-center">
              <div className="flex items-center gap-2 text-ink-soft text-sm"><RefreshCw className="w-4 h-4 animate-spin" /> Drafting your {format.label.toLowerCase()}…</div>
            </div>
          ) : result ? (
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              <div className={cn('mx-auto w-full flex flex-col items-center', preview === 'mobile' ? 'max-w-[380px]' : 'max-w-[480px]')}>
                {/* preview device toggle */}
                <div className="flex items-center justify-end w-full mb-3">
                  <div className="flex rounded-lg bg-surface2 p-0.5">
                    <button onClick={() => setPreview('mobile')} className={cn('p-1.5 rounded-md', preview === 'mobile' && 'bg-surface shadow-e1 text-coral-ink')}><Smartphone className="w-4 h-4" /></button>
                    <button onClick={() => setPreview('desktop')} className={cn('p-1.5 rounded-md', preview === 'desktop' && 'bg-surface shadow-e1 text-coral-ink')}><Monitor className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* MEDIA — the hero (visual only) */}
                <div className="rounded-2xl overflow-hidden bg-surface shadow-e3 w-full">
                  <div className="flex items-center gap-2 p-3.5">
                    <span className="grid place-items-center w-7 h-7 rounded-full text-xs" style={{ background: workspace.accent + '22' }}>{workspace.logo}</span>
                    <span className="text-sm font-bold">{workspace.name.toLowerCase().replace(/\s/g, '')}</span>
                  </div>
                  <div className="relative bg-surface2" style={{ aspectRatio: format.aspect }}>
                    {video
                      ? <video src={video} controls autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                      : image
                        ? <img src={image} alt="Generated visual" className="absolute inset-0 w-full h-full object-cover" />
                        : <div className="absolute inset-0 bg-aurora" />}
                    {(imgBusy || vidBusy) && (
                      <div className="absolute inset-0 grid place-items-center bg-ink/40 backdrop-blur-sm text-white text-xs font-semibold px-4 text-center">
                        <span className="inline-flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> {vidBusy ? (vidMsg || 'Rendering video…') : 'Painting…'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* generate media */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                  <Button variant="secondary" onClick={genImage} disabled={imgBusy || vidBusy}>
                    <ImageIcon className="w-4 h-4" /> {imgBusy ? 'Generating…' : image ? 'Regenerate image' : 'Generate image'}
                  </Button>
                  {format.video && (
                    <Button variant="secondary" onClick={genVideo} disabled={vidBusy || imgBusy}>
                      <Film className="w-4 h-4" /> {vidBusy ? 'Rendering…' : video ? 'Regenerate video' : 'Generate video'}
                    </Button>
                  )}
                </div>
                {vidMsg && !vidBusy && <p className="mt-2 text-xs text-ink-faint text-center">{vidMsg}</p>}

                {/* CAPTION — compact, directly below the media */}
                <div className="w-full mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">Caption</span>
                    <button onClick={() => setPanel(panel === 'refine' ? null : 'refine')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-coral-ink">
                      <SlidersHorizontal className="w-3.5 h-3.5" /> Refine
                    </button>
                  </div>
                  <textarea ref={captionRef} key={result.caption} defaultValue={result.caption} rows={5}
                    className="w-full rounded-xl bg-surface2 px-3.5 py-3 text-sm leading-relaxed resize-y max-h-72" />
                  {result.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">{result.hashtags.map((h) => <Badge key={h} tone="new">#{h}</Badge>)}</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 grid place-items-center text-center px-6">
              <div className="max-w-sm">
                <div className="grid place-items-center w-14 h-14 rounded-2xl bg-coral-tint text-coral-ink mx-auto mb-4"><FileText className="w-6 h-6" /></div>
                <h3 className="font-display text-xl font-semibold tracking-tight mb-1.5">A blank canvas for your {format.label.toLowerCase()}</h3>
                <p className="text-sm text-ink-soft leading-relaxed mb-5">Add a brief, pick a trend or just hit generate — grounded in your brand voice and scored before you post.</p>
                <Button variant="spark" onClick={() => { setPanel('brief'); generate(); }} disabled={busy}>
                  <Sparkles className="w-4 h-4" /> Generate
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Scores — condensed, only after a draft */}
        {result && showScores && (
          <div className="shrink-0 w-64 bg-surface rounded-2xl shadow-e1 p-4 max-h-[76vh] overflow-y-auto hidden xl:block">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-ink text-sm">Creative scores</h3>
              <button onClick={() => setShowScores(false)} className="text-ink-faint hover:text-ink"><X className="w-4 h-4" /></button>
            </div>
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
          </div>
        )}
      </div>
    </div>
  );
}
