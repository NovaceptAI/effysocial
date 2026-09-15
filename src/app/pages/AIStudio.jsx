import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles, Smartphone, Monitor, RefreshCw, Image as ImageIcon,
  Check, FileText, Film, Images, Square, MessageCircle, Video, Briefcase,
  CalendarPlus, Send, Flame, Swords, X, ArrowRight, ArrowLeft, PenLine, Palette,
  SlidersHorizontal, Search, Clapperboard, Mic, Layers, UserSquare, Users, Package,
  UserRoundPlus, AlertTriangle,
} from 'lucide-react';
import Storyboard from '../components/Storyboard';
import ShareRow from '../components/ShareRow';
import PostDialog from '../components/PostDialog';
import { withHashtags } from '../publishing';
import AvatarStudio from '../components/AvatarStudio';
import DealerAvatarStudio from '../components/DealerAvatarStudio';
import CharactersStudio from '../components/CharactersStudio';
import ProductShotStudio from '../components/ProductShotStudio';
import GrowNudge from '../components/GrowNudge';
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
  { id: 'avatar_video', label: 'AI Avatar Video', platform: 'instagram', icon: UserSquare, aspect: '9 / 16', size: 'Talking-head lipsync', group: 'Avatar', avatar: true, thumb: 'ig_reel' },
  { id: 'dealer_avatar', label: 'Personalized Avatar Video', platform: 'whatsapp', icon: Users, aspect: '16 / 9', size: 'Identity-locked dealers', group: 'Avatar', dealer: true, thumb: 'fb_post' },
  { id: 'characters', label: 'EffyCharacters', platform: 'instagram', icon: UserSquare, aspect: '9 / 16', size: 'Lip-sync speakers', group: 'Avatar', characters: true, thumb: 'ig_reel' },
  { id: 'product_shot', label: 'Product Shots', platform: 'instagram', icon: Package, aspect: '9 / 16', size: 'Beauty product video', group: 'Product', product: true, thumb: 'ig_carousel' },
];
const FILTERS = ['Popular', 'Instagram', 'Facebook', 'LinkedIn', 'X', 'YouTube', 'WhatsApp', 'Avatar', 'Product'];
const LANGS = ['English', 'Hindi', 'Hinglish', 'Marathi'];
const COPY_TOOLS = ['Rewrite', 'Shorten', 'Expand', 'Change tone', 'Add CTA', 'More hooks', 'Hashtags', 'Translate'];

// Creative-testing variants: each is a distinct strategic angle so the set is
// genuinely different (hook / CTA / contrarian / story), not four rewrites.
const VARIANT_ANGLES = [
  { key: 'hook', label: 'Different hook', angle: 'A completely different, bold scroll-stopping first line — change the opening approach entirely' },
  { key: 'cta', label: 'CTA-led', angle: 'Make the call-to-action the hero — urgency-driven, action-first copy' },
  { key: 'contrarian', label: 'Contrarian angle', angle: 'Take a contrarian or unexpected angle on the same topic — challenge a common assumption' },
  { key: 'story', label: 'Story-driven', angle: 'Open with a tiny relatable customer story, then land the message' },
];

function scoreTone(v, invert) {
  const good = invert ? v < 30 : v >= 80;
  const mid = invert ? v < 60 : v >= 60;
  return good ? 'success' : mid ? 'warning' : 'error';
}

function SocialPlatformIcon({ platform, className = 'w-4 h-4' }) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    'aria-hidden': true,
  };

  if (platform === 'instagram') {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (platform === 'facebook') {
    return <svg {...common}><path d="M13.7 22v-9h3l.45-3.5H13.7V7.26c0-1.01.28-1.7 1.74-1.7h1.86V2.43c-.32-.04-1.43-.14-2.72-.14-2.7 0-4.55 1.65-4.55 4.68V9.5H7v3.5h3.03v9h3.67Z" /></svg>;
  }
  if (platform === 'linkedin') {
    return <svg {...common}><path d="M5.34 7.67H2.13V22h3.21V7.67ZM3.73 2A1.87 1.87 0 1 0 3.73 5.74 1.87 1.87 0 0 0 3.73 2ZM22 13.78c0-4.31-2.3-6.32-5.37-6.32-2.47 0-3.58 1.36-4.2 2.32V7.67H9.22V22h3.21v-7.1c0-1.87.36-3.69 2.68-3.69 2.29 0 2.32 2.14 2.32 3.81V22h3.21v-7.87L22 13.78Z" /></svg>;
  }
  if (platform === 'twitter') {
    return <svg {...common}><path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.26-8.3L2.98 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.84h1.72L8.44 4.05H6.6L17.8 19.84Z" /></svg>;
  }
  if (platform === 'youtube') {
    return <svg {...common}><path d="M23.5 6.2a3.02 3.02 0 0 0-2.13-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.37.51A3.02 3.02 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.13 2.14c1.87.51 9.37.51 9.37.51s7.5 0 9.37-.51a3.02 3.02 0 0 0 2.13-2.14A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.23 3.6-6.23 3.6Z" /></svg>;
  }
  if (platform === 'whatsapp') {
    return <svg {...common}><path d="M20.52 3.48A11.8 11.8 0 0 0 1.96 17.71L.29 23.8l6.23-1.63A11.78 11.78 0 0 0 12 23.57h.01A11.8 11.8 0 0 0 20.52 3.48ZM12 21.58a9.75 9.75 0 0 1-4.97-1.36l-.36-.21-3.7.97.99-3.61-.23-.37A9.8 9.8 0 1 1 12 21.58Zm5.38-7.34c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.07-1.74-.87-2.88-1.55-4.03-3.53-.3-.52.3-.48.87-1.6.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.08 1.75-.72 2-1.41.24-.7.24-1.3.17-1.42-.07-.12-.27-.2-.56-.35Z" /></svg>;
  }
  return <Sparkles className={className} aria-hidden="true" />;
}

/* ───────────────────────── Format chooser ───────────────────────── */
function FormatChooser({ onPick, repurposing }) {
  const [filter, setFilter] = useState('Popular');
  const [q, setQ] = useState('');
  const shown = FORMATS.filter((f) =>
    (filter === 'Popular' || f.group === filter) &&
    (!q || f.label.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-display text-[2.2rem] font-semibold tracking-tightest mb-1.5">{repurposing ? 'Repurpose a post' : 'Create a post'}</h1>
      <p className="text-ink-soft mb-6">
        {repurposing ? 'Pick the format to turn it into. Its caption is already in your brief.' : 'Pick a format to start — you can change it later.'}
      </p>

      <div className="relative mb-5">
        <Search className="w-4 h-4 text-ink-faint absolute left-4 top-1/2 -translate-y-1/2" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="What would you like to create?"
          className="w-full rounded-2xl bg-surface2 pl-11 pr-4 py-3.5 text-sm shadow-e1" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-4 py-1.5 rounded-full text-sm font-semibold transition',
              filter === f ? 'bg-rail-active text-rail-active-ink' : 'bg-surface2 text-ink-soft hover:text-ink')}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {shown.map((f) => (
          <button key={f.id} onClick={() => onPick(f)}
            className="group relative h-56 overflow-hidden rounded-2xl bg-neutral-900 text-left shadow-e1 hover:shadow-e3 hover:-translate-y-0.5 transition-all">
            <img src={`/formats/${f.thumb || f.id}.jpg`} alt="" loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            {/* Fixed dark scrim (not `ink`, which inverts on dark) so the white
                label stays legible over pale photos in either theme. */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
              <span className="rounded-full bg-black/35 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-white backdrop-blur-md">
                {f.group}
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-black/35 text-white backdrop-blur-md">
                <SocialPlatformIcon platform={f.platform} className="w-4 h-4" />
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="font-bold text-sm text-white drop-shadow-sm">{f.label}</div>
              <div className="text-xs text-white/75 mt-0.5">
                {f.size.includes('×') ? `${f.size} px` : f.size}
              </div>
            </div>
            <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-white/25 transition" />
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
  const [params] = useSearchParams();

  // Deep-linked from a playbook, workflow or Media Library? Skip the chooser.
  const reusedImage = params.get('image') || '';
  const reusedVideo = params.get('video') || '';
  const campaignId = params.get('campaign') ? Number(params.get('campaign')) : null;
  // Repurposing a published post starts at the format chooser, with its caption as the brief.
  const repurposing = !!params.get('repurpose');
  const seeded = !repurposing && (params.get('trend') || params.get('angle') || params.get('topic') || reusedImage || reusedVideo || campaignId);
  // Opened from Home's recent sessions: go straight into that Product Shot project.
  const productShotId = Number(params.get('productShot')) || null;
  const [format, setFormat] = useState(productShotId ? FORMATS.find((f) => f.product)
    : seeded ? (reusedVideo ? FORMATS.find((f) => f.video) || FORMATS[0] : FORMATS[0]) : null);

  const [panel, setPanel] = useState('brief');   // open tool panel (or null)
  const [topic, setTopic] = useState(params.get('topic') || '');
  const [lang, setLang] = useState('English');
  const [busy, setBusy] = useState(false);
  const [genErr, setGenErr] = useState('');   // why the last generation failed; never written into the draft
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);            // blocks a second send before the first re-render
  // One acceptance-record job per format session: every draft, refine, image, video
  // and send-to-approval made while this format is open is counted under it.
  const jobRef = useRef(null);
  useEffect(() => {
    jobRef.current = format ? `st_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}` : null;
  }, [format]);
  const [sendErr, setSendErr] = useState('');
  const [refineErr, setRefineErr] = useState('');
  const [imgErr, setImgErr] = useState('');
  // A reused asset opens straight into the preview with an empty draft to fill.
  const [result, setResult] = useState((reusedImage || reusedVideo) ? { caption: '', hashtags: [], scores: [], hook: '', cta: '', cited: [] } : null);
  const [preview, setPreview] = useState('mobile');
  const [trend, setTrend] = useState(params.get('trend') || '');
  const [angle, setAngle] = useState(params.get('angle') || '');
  const [sent, setSent] = useState(false);
  const [showScores, setShowScores] = useState(true);
  const [image, setImage] = useState(reusedImage);       // generated/reused visual URL
  const [imgBusy, setImgBusy] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [agentFile, setAgentFile] = useState(null);
  const [agentPlacement, setAgentPlacement] = useState('right side');
  const [agentDirection, setAgentDirection] = useState('');
  const [embedBusy, setEmbedBusy] = useState(false);
  const [embedMsg, setEmbedMsg] = useState('');
  const [video, setVideo] = useState(reusedVideo); // generated/reused video URL
  const [vidBusy, setVidBusy] = useState(false);
  const [vidMsg, setVidMsg] = useState('');     // progress/error line for video
  const [vidPrompt, setVidPrompt] = useState(''); // shot description sent to Veo
  const [outroOpen, setOutroOpen] = useState(false);
  const [outroMode, setOutroMode] = useState('existing');
  const [outroCharacter, setOutroCharacter] = useState('');
  const [outroPhoto, setOutroPhoto] = useState(null);
  const [outroName, setOutroName] = useState('My agent');
  const [outroScript, setOutroScript] = useState('Ready to grow? Talk to our team today.');
  const [outroBusy, setOutroBusy] = useState(false);
  const [outroMsg, setOutroMsg] = useState('');
  const [voiceOn, setVoiceOn] = useState(false);
  const [voice, setVoice] = useState('');
  const [music, setMusic] = useState('');
  const [variants, setVariants] = useState([]);   // creative-testing set
  const [varSel, setVarSel] = useState({});       // idx → selected for approval
  const [varSending, setVarSending] = useState(false);
  const [varSent, setVarSent] = useState(false);
  const [refining, setRefining] = useState('');  // which tool is running
  const captionRef = useRef(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { data: ctx } = useQuery({
    queryKey: ['studio-context', workspace?.id],
    queryFn: () => effyApi.studioContext(workspace.id),
    enabled: !!workspace,
  });
  const { data: audioOpts } = useQuery({ queryKey: ['studio-voices'], queryFn: () => effyApi.studioVoices() });
  const { data: characterData, refetch: refetchCharacters } = useQuery({
    queryKey: ['characters', workspace?.id],
    queryFn: () => effyApi.listCharacters(workspace.id),
    enabled: !!workspace && !!video,
  });
  const voices = audioOpts?.voices || [];
  const musicOpts = audioOpts?.music || [{ key: '', name: 'None' }];

  const generate = async () => {
    if (!workspace || !format) return;
    setBusy(true); setResult(null); setSent(false); setGenErr(''); setSendErr(''); setRefineErr('');
    try {
      const d = await effyApi.generateStudio({ workspace: workspace.id, type: format.id, topic, language: lang, trend, angle, job: jobRef.current });
      setResult({ caption: d.caption, hashtags: d.hashtags || [], scores: d.scores || [], hook: d.hook, cta: d.cta, cited: d.cited || [] });
      setPanel(null);   // collapse the tool panel so the result gets full room
    } catch (e) {
      // Keep the failure out of `result`: anything there can be sent to approval,
      // refined, narrated in a video or published as a caption.
      setGenErr(e.message || 'Generation failed — try again.');
    } finally { setBusy(false); }
  };
  const sendToApproval = async () => {
    if (!result || sent || sendingRef.current) return;
    sendingRef.current = true; setSending(true); setSendErr('');
    try {
      await effyApi.sendToApproval({ workspace: workspace.id, hook: result.hook, caption: withHashtags(result.caption, result.hashtags), mediaUrl: video || image || undefined, channel: format.platform, type: format.id.split('_')[1] || 'post', campaignId, topic, job: jobRef.current });
      setSent(true);
    } catch (e) {
      setSendErr(e.message || 'Could not send to approval — try again.');
    } finally { sendingRef.current = false; setSending(false); }
  };
  const refine = async (tool) => {
    const current = captionRef.current?.value ?? result?.caption;
    if (!current) return;
    setRefining(tool); setRefineErr('');
    try {
      const d = await effyApi.studioRefine({ workspace: workspace.id, type: format.id, tool, caption: current, language: lang, topic, job: jobRef.current });
      setResult((r) => ({ ...r, caption: d.caption ?? r.caption, hashtags: d.hashtags ?? r.hashtags, scores: d.scores ?? r.scores, hook: d.hook ?? r.hook }));
    } catch (e) {
      setRefineErr(e.message || 'Could not refine the caption — try again.');
    } finally { setRefining(''); }
  };
  // Creative-testing set: N strategically different takes via the existing
  // generate endpoint (each with a distinct `angle`) — no new backend needed.
  const genVariants = async () => {
    setVariants(VARIANT_ANGLES.map((v) => ({ ...v, status: 'busy' })));
    setVarSel({}); setVarSent(false);
    await Promise.all(VARIANT_ANGLES.map(async (v, i) => {
      try {
        const d = await effyApi.generateStudio({ workspace: workspace.id, type: format.id, topic, language: lang, trend, angle: v.angle, job: jobRef.current });
        setVariants((prev) => prev.map((x, j) => (j === i
          ? { ...x, status: 'ok', caption: d.caption, hook: d.hook, cta: d.cta, hashtags: d.hashtags || [] } : x)));
      } catch (e) {
        setVariants((prev) => prev.map((x, j) => (j === i ? { ...x, status: 'error', error: e.message } : x)));
      }
    }));
  };
  const sendVariants = async () => {
    const picked = variants.filter((v, i) => varSel[i] && v.status === 'ok');
    if (!picked.length) return;
    setVarSending(true);
    try {
      for (const v of picked) {
        // eslint-disable-next-line no-await-in-loop
        await effyApi.sendToApproval({
          workspace: workspace.id, hook: v.hook, caption: withHashtags(v.caption, v.hashtags), mediaUrl: video || image || undefined,
          channel: format.platform, type: format.id.split('_')[1] || 'post', campaignId, topic, job: jobRef.current,
          title: `[${v.label}] ${(v.hook || v.caption || '').slice(0, 80)}`,
        });
      }
      setVarSent(true);
    } finally { setVarSending(false); }
  };

  const genImage = async () => {
    if (!workspace || !format) return;
    setImgBusy(true); setImgErr('');
    try {
      const d = await effyApi.studioImage({ workspace: workspace.id, topic: topic || trend || angle, aspect: format.aspect, type: format.id, job: jobRef.current });
      if (d.imageUrl) setImage(d.imageUrl);
      else setImgErr('No image came back — try again.');
    } catch (e) {
      setImgErr(e.message || 'Could not generate the image — try again.');
    } finally { setImgBusy(false); }
  };
  const embedAgent = async () => {
    if (!workspace || !image || !agentFile) return;
    const baseName = decodeURIComponent(image.split('?')[0].split('/').pop() || '');
    setEmbedBusy(true); setEmbedMsg('Blending your agent into the creative…');
    try {
      const d = await effyApi.studioEmbedImage(workspace.id, {
        baseName, agent: agentFile, placement: agentPlacement, direction: agentDirection,
      });
      setImage(d.imageUrl); setEmbedOpen(false); setAgentFile(null); setAgentDirection('');
      setEmbedMsg('Agent added — the final image is saved in Media Library.');
    } catch (e) {
      setEmbedMsg(e.message || 'Could not add the agent to this image.');
    } finally { setEmbedBusy(false); }
  };
  // Veo video — long-running: start, then poll every 8s (Veo takes ~1–3 min).
  const genVideo = async () => {
    if (!workspace || !format) return;
    setVidBusy(true); setVideo(''); setVidMsg('Starting render…'); setVidPrompt('');
    try {
      const { op, prompt } = await effyApi.studioVideoStart({
        workspace: workspace.id, topic: topic || trend || angle, trend, aspect: format.aspect,
        voiceover: voiceOn, voice, music, language: lang, script: result?.caption || topic || trend || angle,
        type: format.id, job: jobRef.current,
      });
      if (prompt) setVidPrompt(prompt);
      setVidMsg('Rendering video…');
      for (let i = 0; i < 60; i += 1) {
        const st = await effyApi.studioVideoStatus({ workspace: workspace.id, op, job: jobRef.current });
        if (st.status === 'ready') { setVideo(st.videoUrl); setVidMsg(''); return; }
        setVidMsg('Rendering video — this can take up to a few minutes…');
        await new Promise((r) => setTimeout(r, 8000));
      }
      setVidMsg('Still rendering — try again in a moment.');
    } catch (e) {
      setVidMsg(e.message || 'Video generation failed.');
    } finally { setVidBusy(false); }
  };
  const addAgentOutro = async () => {
    const words = outroScript.trim().split(/\s+/).filter(Boolean);
    if (!workspace || !video || !words.length || words.length > 16) return;
    if (outroMode === 'upload' && !outroPhoto) return;
    if (outroMode === 'existing' && !outroCharacter) return;
    setOutroBusy(true); setOutroMsg('Preparing your EffyCharacter…');
    try {
      let character = outroCharacter;
      if (outroMode === 'upload') {
        let created = await effyApi.createCharacter(workspace.id, {
          photo: outroPhoto, name: outroName.trim() || 'My agent',
        });
        for (let i = 0; created.status !== 'ready' && i < 60; i += 1) {
          setOutroMsg('Turning the photo into an EffyCharacter…');
          await new Promise((r) => setTimeout(r, 8000));
          // eslint-disable-next-line no-await-in-loop
          const st = await effyApi.characterStatus(created.id);
          if (st.status === 'error') throw new Error(st.message || 'Character creation failed.');
          if (st.character) created = st.character;
        }
        if (created.status !== 'ready') throw new Error('Character is still rendering — try again shortly.');
        character = `custom:${created.id}`;
        refetchCharacters();
      }

      const [kind, key] = character.split(':');
      setOutroMsg('Making your agent speak…');
      const { job } = await effyApi.characterSpeak({
        workspace: workspace.id, script: words.join(' '), language: lang,
        ...(kind === 'preset' ? { preset: key } : { characterId: Number(key) }),
      });
      let clip = null;
      for (let i = 0; i < 60; i += 1) {
        await new Promise((r) => setTimeout(r, 8000));
        // eslint-disable-next-line no-await-in-loop
        const st = await effyApi.avatarStatus({ workspace: workspace.id, job });
        if (st.status === 'ready') { clip = st; break; }
        if (st.status === 'error') throw new Error(st.message || 'Agent speech render failed.');
        setOutroMsg('Lip-syncing your agent’s lines…');
      }
      if (!clip?.name) throw new Error('Agent clip is still rendering — try again shortly.');

      setOutroMsg('Attaching the agent to the end of your ad…');
      const videoName = decodeURIComponent(video.split('?')[0].split('/').pop() || '');
      const final = await effyApi.studioStitchAgentOutro({
        workspace: workspace.id, videoName, outroName: clip.name,
      });
      setVideo(final.videoUrl); setOutroOpen(false); setOutroPhoto(null);
      setOutroMsg('Done — your ad with agent outro is saved in Media Library.');
    } catch (e) {
      setOutroMsg(e.message || 'Could not create the agent outro.');
    } finally { setOutroBusy(false); }
  };

  if (!format) {
    return <FormatChooser repurposing={repurposing} onPick={(f) => { setFormat(f); setPanel('brief'); }} />;
  }

  if (format.avatar) {
    return <AvatarStudio onBack={() => setFormat(null)} />;
  }

  if (format.dealer) {
    return <DealerAvatarStudio onBack={() => setFormat(null)} />;
  }

  if (format.characters) {
    return <CharactersStudio onBack={() => setFormat(null)} />;
  }
  if (format.product) {
    return <ProductShotStudio onBack={() => setFormat(null)} initialId={productShotId} />;
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
        <button onClick={() => { setFormat(null); setResult(null); setImage(''); setVideo(''); setVidMsg(''); setVariants([]); setVarSel({}); setVarSent(false); }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
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
        <Button variant="secondary" disabled={!result} onClick={() => setCalendarOpen(true)}><CalendarPlus className="w-4 h-4" /> Add to calendar</Button>
        <Button disabled={!result || sent || sending} onClick={sendToApproval}>
          {sent ? <><Check className="w-4 h-4" /> Sent</> : sending ? <><RefreshCw className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send to approval</>}
        </Button>
      </div>
      {sendErr && (
        <div role="alert" className="mb-3 flex items-start gap-2.5 rounded-xl bg-error-soft px-4 py-2.5 text-sm text-error">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span><strong className="font-semibold">Not sent to approval.</strong> {sendErr}</span>
        </div>
      )}

      {sent && (
        <div className="mb-5">
          <GrowNudge text="This is ready to go. Schedule it, publish it and track how it performs in Performance Marketing." />
        </div>
      )}

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
          <div className="shrink-0 w-80 bg-surface rounded-2xl shadow-e1 p-4 min-h-[76vh] max-h-[76vh] overflow-y-auto flex flex-col">
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

                {/* Fill the composer with calm, useful context — not an empty card. */}
                {(ctx?.trends || []).length > 0 && (
                  <div className="mt-5 pt-5 border-t border-line">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-ink-soft mb-2.5"><Flame className="w-3.5 h-3.5 text-error" /> Trending now</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(ctx?.trends || []).slice(0, 4).map((t) => (
                        <button key={t.topic} onClick={() => setTrend(t.topic)}
                          className={cn('text-[11px] font-medium px-2.5 py-1.5 rounded-full transition',
                            trend === t.topic ? 'bg-coral-tint text-coral-ink' : 'bg-surface2 text-ink-soft hover:bg-coral-tint/60')}>
                          {t.topic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {(ctx?.brand?.tone || []).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-line">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-ink-soft mb-2.5"><Palette className="w-3.5 h-3.5 text-coral-ink" /> Brand voice</div>
                    <div className="flex flex-wrap gap-1.5">{(ctx?.brand?.tone || []).slice(0, 5).map((t) => <Badge key={t}>{t}</Badge>)}</div>
                  </div>
                )}
                <p className="text-[11.5px] text-ink-soft leading-relaxed mt-auto pt-5">
                  Every draft is grounded in your Brand Brain and scored before you post.
                </p>
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
                <h3 className="font-bold text-ink text-sm mb-1.5 flex items-center gap-1.5"><SlidersHorizontal className="w-4 h-4 text-coral-ink" /> Refine copy</h3>
                <p className="text-xs text-ink-faint">{result ? 'Transforms your current caption.' : 'Generate a draft first.'}</p>
                <div className="flex flex-wrap gap-2 mt-8">
                  {COPY_TOOLS.map((tool) => (
                    <button key={tool} disabled={!result || !!refining} onClick={() => refine(tool.toLowerCase())}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full bg-surface2 text-ink ring-1 ring-black/15 hover:bg-coral-tint hover:text-coral-ink hover:ring-coral disabled:opacity-60 disabled:hover:bg-surface2 disabled:hover:text-ink disabled:hover:ring-black/15 transition">
                      {refining === tool.toLowerCase() && <RefreshCw className="w-3 h-3 animate-spin" />}{tool}
                    </button>
                  ))}
                </div>
                {refineErr && <p role="alert" className="mt-3 text-xs text-error">{refineErr}</p>}
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
                    {(imgBusy || vidBusy || embedBusy) && (
                      <div className="absolute inset-0 grid place-items-center bg-ink/40 backdrop-blur-sm text-white text-xs font-semibold px-4 text-center">
                        <span className="inline-flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> {embedBusy ? embedMsg : vidBusy ? (vidMsg || 'Rendering video…') : 'Painting…'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* generate media */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                  <Button variant="secondary" onClick={genImage} disabled={imgBusy || vidBusy}>
                    <ImageIcon className="w-4 h-4" /> {imgBusy ? 'Generating…' : image ? 'Regenerate image' : 'Generate image'}
                  </Button>
                  {image && !video && (
                    <Button variant="secondary" onClick={() => setEmbedOpen((v) => !v)} disabled={imgBusy || embedBusy}>
                      <UserRoundPlus className="w-4 h-4" /> Add your agent
                    </Button>
                  )}
                  {format.video && (
                    <Button variant="secondary" onClick={genVideo} disabled={vidBusy || imgBusy}>
                      <Film className="w-4 h-4" /> {vidBusy ? 'Rendering…' : video ? 'Regenerate video' : 'Generate video'}
                    </Button>
                  )}
                  {video && (
                    <Button variant="secondary" onClick={() => setOutroOpen((v) => !v)} disabled={outroBusy}>
                      <UserRoundPlus className="w-4 h-4" /> Add agent outro
                    </Button>
                  )}
                </div>
                {imgErr && <p role="alert" className="mt-2 text-xs text-error text-center">{imgErr}</p>}
                {embedOpen && image && !video && (
                  <div className="mt-3 w-full rounded-xl bg-surface2/60 p-3 space-y-2.5">
                    <div className="text-xs font-bold text-ink">Embed an agent into this image</div>
                    <input type="file" accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setAgentFile(e.target.files?.[0] || null)}
                      className="block w-full text-xs text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-surface file:px-3 file:py-2 file:text-xs file:font-bold" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select value={agentPlacement} onChange={(e) => setAgentPlacement(e.target.value)}
                        className="rounded-lg bg-surface px-2.5 py-2 text-xs font-semibold">
                        <option>right side</option><option>left side</option><option>centre foreground</option><option>background</option>
                      </select>
                      <input value={agentDirection} onChange={(e) => setAgentDirection(e.target.value)}
                        placeholder="Optional: holding the product…" maxLength={240}
                        className="rounded-lg bg-surface px-2.5 py-2 text-xs" />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[0.68rem] text-ink-faint">Use a clear, well-lit photo. Existing logos and text are preserved.</p>
                      <Button size="sm" onClick={embedAgent} disabled={!agentFile || embedBusy}>{embedBusy ? 'Embedding…' : 'Create final image'}</Button>
                    </div>
                  </div>
                )}
                {embedMsg && !embedBusy && <p className="mt-2 text-xs text-ink-faint text-center">{embedMsg}</p>}
                {vidMsg && !vidBusy && <p className="mt-2 text-xs text-ink-faint text-center">{vidMsg}</p>}
                {vidPrompt && (video || vidBusy) && (
                  <details className="mt-2 w-full rounded-xl bg-surface2/60 px-3 py-2">
                    <summary className="text-[0.68rem] font-semibold text-ink-soft cursor-pointer select-none">Shot description sent to the video model</summary>
                    <p className="mt-1.5 text-[0.68rem] leading-relaxed text-ink-faint">{vidPrompt}</p>
                  </details>
                )}
                {video && <ShareRow videoUrl={video} caption={withHashtags(result.caption, result.hashtags) || topic} title={result.hook} />}
                {!video && image && format.platform === 'instagram' && !format.video && (
                  <ShareRow imageUrl={image} caption={withHashtags(result.caption, result.hashtags)} title={result.hook} />
                )}
                {outroOpen && video && (
                  <div className="mt-3 w-full rounded-xl bg-surface2/60 p-3 space-y-3">
                    <div>
                      <div className="text-xs font-bold text-ink">Add a speaking agent at the end</div>
                      <p className="text-[0.68rem] text-ink-faint mt-0.5">A short 5-second CTA works best — maximum 16 words.</p>
                    </div>
                    <div className="flex gap-1 rounded-lg bg-surface p-1">
                      <button onClick={() => setOutroMode('existing')} className={cn('flex-1 rounded-md px-2 py-1.5 text-xs font-bold', outroMode === 'existing' && 'bg-coral-soft text-coral-ink')}>Existing character</button>
                      <button onClick={() => setOutroMode('upload')} className={cn('flex-1 rounded-md px-2 py-1.5 text-xs font-bold', outroMode === 'upload' && 'bg-coral-soft text-coral-ink')}>Upload agent photo</button>
                    </div>
                    {outroMode === 'existing' ? (
                      <select value={outroCharacter} onChange={(e) => setOutroCharacter(e.target.value)} className="w-full rounded-lg bg-surface px-2.5 py-2 text-xs font-semibold">
                        <option value="">Choose an EffyCharacter…</option>
                        {(characterData?.presets || []).filter((c) => c.ready).map((c) => <option key={c.key} value={`preset:${c.key}`}>{c.name} · {c.role}</option>)}
                        {(characterData?.custom || []).filter((c) => c.ready).map((c) => <option key={c.id} value={`custom:${c.id}`}>{c.name} · Custom</option>)}
                      </select>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input value={outroName} onChange={(e) => setOutroName(e.target.value)} maxLength={80} placeholder="Agent name" className="rounded-lg bg-surface px-2.5 py-2 text-xs" />
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setOutroPhoto(e.target.files?.[0] || null)} className="block w-full text-xs text-ink-soft file:mr-2 file:rounded-md file:border-0 file:bg-surface file:px-2 file:py-1.5 file:text-xs file:font-bold" />
                      </div>
                    )}
                    <textarea value={outroScript} onChange={(e) => setOutroScript(e.target.value)} rows={2} placeholder="What should your agent say?" className="w-full resize-none rounded-lg bg-surface px-2.5 py-2 text-xs" />
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('text-[0.68rem]', outroScript.trim().split(/\s+/).filter(Boolean).length > 16 ? 'text-error' : 'text-ink-faint')}>{outroScript.trim().split(/\s+/).filter(Boolean).length}/16 words</span>
                      <Button size="sm" onClick={addAgentOutro} disabled={outroBusy || !outroScript.trim() || outroScript.trim().split(/\s+/).filter(Boolean).length > 16 || (outroMode === 'existing' ? !outroCharacter : !outroPhoto)}>{outroBusy ? 'Creating outro…' : 'Create final video'}</Button>
                    </div>
                    {outroMsg && <p className="text-xs text-ink-faint">{outroMsg}</p>}
                  </div>
                )}
                {outroMsg && !outroOpen && !outroBusy && <p className="mt-2 text-xs text-ink-faint text-center">{outroMsg}</p>}
                {format.video && (
                  <div className="mt-3 w-full rounded-xl bg-surface2/60 p-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink"><Mic className="w-3.5 h-3.5 text-coral-ink" /> Voiceover</span>
                      <button onClick={() => setVoiceOn((v) => !v)}
                        className={cn('relative h-6 w-11 rounded-full transition', voiceOn ? 'bg-coral' : 'bg-surface')}>
                        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', voiceOn ? 'left-[22px]' : 'left-0.5')} />
                      </button>
                    </div>
                    {voiceOn && (
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        <select value={voice} onChange={(e) => setVoice(e.target.value)} className="flex-1 rounded-lg bg-surface px-2 py-1.5 text-xs font-semibold">
                          <option value="">Auto voice</option>
                          {voices.map((v) => <option key={v.key} value={v.key}>{v.name} · {v.lang}</option>)}
                        </select>
                        <select value={music} onChange={(e) => setMusic(e.target.value)} className="flex-1 rounded-lg bg-surface px-2 py-1.5 text-xs font-semibold">
                          {musicOpts.map((m) => <option key={m.key} value={m.key}>{m.name === 'None' ? 'No music' : `♪ ${m.name}`}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* CAPTION — compact, directly below the media */}
                <div className="w-full mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">Caption</span>
                    <button onClick={() => setPanel(panel === 'refine' ? null : 'refine')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-coral-ink">
                      <SlidersHorizontal className="w-3.5 h-3.5" /> Refine
                    </button>
                  </div>
                  {/* Controlled, so edits are what Send to approval, video and sharing use. */}
                  <textarea ref={captionRef} value={result.caption || ''} rows={5}
                    onChange={(e) => { const caption = e.target.value; setResult((r) => ({ ...r, caption })); }}
                    className="w-full rounded-xl bg-surface2 px-3.5 py-3 text-sm leading-relaxed resize-y max-h-72" />
                  {result.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">{result.hashtags.map((h) => <Badge key={h} tone="new">#{h}</Badge>)}</div>
                  )}
                </div>

                {/* PERFORMANCE CREATIVE SET — creative-testing variants */}
                <div className="w-full mt-6">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-faint">
                      <Layers className="w-3.5 h-3.5 text-coral-ink" /> Performance creative set
                    </span>
                    <Button size="sm" variant="secondary" onClick={genVariants} disabled={variants.some((v) => v.status === 'busy')}>
                      <Sparkles className="w-3.5 h-3.5" /> {variants.length ? 'Regenerate variants' : `Generate ${VARIANT_ANGLES.length} variants`}
                    </Button>
                  </div>
                  {variants.length === 0 ? (
                    <p className="text-xs text-ink-faint">Test what works: generate {VARIANT_ANGLES.length} strategically different takes (hook · CTA · angle · story), pick the best, and send them to approval together.</p>
                  ) : (
                    <>
                      <div className="grid sm:grid-cols-2 gap-2.5">
                        {variants.map((v, i) => (
                          <button key={v.key} onClick={() => v.status === 'ok' && setVarSel((s) => ({ ...s, [i]: !s[i] }))}
                            className={cn('text-left rounded-xl p-3 bg-surface2/60 transition-all',
                              varSel[i] ? 'ring-2 ring-coral bg-coral-tint/40' : 'hover:bg-surface2')}>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <Badge tone={varSel[i] ? 'coral' : 'default'}>{v.label}</Badge>
                              {v.status === 'busy' && <RefreshCw className="w-3.5 h-3.5 animate-spin text-ink-faint" />}
                              {varSel[i] && <Check className="w-4 h-4 text-coral-ink" />}
                            </div>
                            {v.status === 'ok' && (
                              <>
                                <p className="text-xs font-bold text-ink leading-snug mb-1">{v.hook || (v.caption || '').split('\n')[0]}</p>
                                <p className="text-[0.7rem] text-ink-soft leading-snug line-clamp-3 whitespace-pre-wrap">{v.caption}</p>
                              </>
                            )}
                            {v.status === 'error' && <p className="text-[0.7rem] text-error">{v.error || 'Generation failed — regenerate.'}</p>}
                            {v.status === 'busy' && <p className="text-[0.7rem] text-ink-faint">Writing this take…</p>}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Button size="sm" onClick={sendVariants}
                          disabled={varSending || varSent || !Object.keys(varSel).some((k) => varSel[k])}>
                          {varSent ? <><Check className="w-3.5 h-3.5" /> Sent</>
                            : varSending ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending…</>
                              : <><Send className="w-3.5 h-3.5" /> Send selected to approval</>}
                        </Button>
                        <span className="text-xs text-ink-faint">{Object.values(varSel).filter(Boolean).length} selected{campaignId ? ' · attached to campaign' : ''}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 grid place-items-center text-center p-8">
              <div className="w-full max-w-md flex flex-col items-center">
                {genErr && (
                  <div role="alert" className="mb-6 w-full flex items-start gap-2.5 rounded-xl bg-error-soft px-4 py-3 text-left text-sm text-error">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span><strong className="font-semibold">Couldn’t draft this {format.label.toLowerCase()}.</strong> {genErr}</span>
                  </div>
                )}
                {/* A real canvas surface at the format's true aspect — a dimmed sample
                    fills it so it reads as an editor, not an empty page. */}
                <div className="mx-auto mb-7 w-full relative rounded-2xl overflow-hidden border-2 border-dashed border-line bg-surface2/40"
                  style={{ aspectRatio: format.aspect, maxWidth: (format.aspect || '').startsWith('9') ? 250 : 360 }}>
                  <img src={`/formats/${format.thumb || format.id}.jpg`} alt="" loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover opacity-25" />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="grid place-items-center w-14 h-14 rounded-2xl bg-coral-tint text-coral-ink shadow-e1"><format.icon className="w-6 h-6" /></div>
                  </div>
                </div>
                <h3 className="font-display text-xl font-semibold tracking-tight mb-2">A blank canvas for your {format.label.toLowerCase()}</h3>
                <p className="text-sm text-ink-soft leading-relaxed mb-8 max-w-sm">Add a brief, pick a trend or just hit generate — grounded in your brand voice and scored before you post.</p>
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
      <PostDialog open={calendarOpen} onClose={() => setCalendarOpen(false)} initial={result ? {
        title: (result.hook || topic || format.label).slice(0, 200),
        caption: withHashtags(result.caption, result.hashtags),
        channel: format.platform,
        type: { short: 'video', promo: 'post' }[format.id.split('_')[1]] || format.id.split('_')[1] || 'post',
        mediaUrl: video || image || '', mediaKind: video ? 'video' : image ? 'image' : '',
      } : null} />
    </div>
  );
}
