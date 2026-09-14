import React, { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Loader2, Pencil, Plus, X, ShieldCheck, Sparkles, Info, Upload, Image as ImageIcon, FileText, Globe, Trash2, MessageSquareText } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge, Pacing } from '../../ui';

// ── parse / serialize helpers ──────────────────────────────────────────────
const csv = (s) => s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
const nlines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);
const parseList = (s, k) => nlines(s).map((l) => {
  const [first, ...rest] = l.split(/[-—–:]/);
  return { [k[0]]: first.trim(), [k[1]]: rest.join('-').trim() };
});
// Read primary/secondary tolerantly so legacy + AI rows (title/name/q, desc/motivation/a) all render.
const pri = (it, k) => it[k[0]] ?? it.title ?? it.name ?? it.q ?? '';
const sec = (it, k) => it[k[1]] ?? it.desc ?? it.motivation ?? it.a ?? '';
const listToText = (arr, k) => (arr || []).map((it) => {
  const a = pri(it, k); const b = sec(it, k);
  return b ? `${a} — ${b}` : a;
}).join('\n');

// AI suggestion (any shape) -> editor text for the given section type.
function suggestionToText(section, sug) {
  if (sug == null) return '';
  if (section.type === 'paragraph') return String(sug);
  if (section.type === 'chips') return (Array.isArray(sug) ? sug : [sug]).join(', ');
  if (section.type === 'lines') return (Array.isArray(sug) ? sug : [sug]).join('\n');
  if (section.type === 'list') return listToText(Array.isArray(sug) ? sug : [], section.keys);
  return '';
}

// ── the 12 Brand-Brain sections (denominator of completeness) ──────────────
const SECTIONS = [
  { key: 'summary', label: 'About the brand', type: 'paragraph', rows: 3, span: true,
    hint: 'One or two sentences — who you serve and what makes you different.',
    help: 'A short description of your business — who you serve and what makes you different. This anchors the voice of every caption, ad and reply.',
    placeholder: 'e.g. We are a family dental clinic in Pune known for gentle, transparent care…' },
  { key: 'tone', label: 'Brand tone', type: 'chips', tone: 'default',
    hint: 'Comma-separated words.',
    help: 'The personality of your writing — e.g. warm, professional, playful. Effy matches this in everything it drafts.',
    placeholder: 'warm, professional, reassuring' },
  { key: 'approved', label: 'Words to use', type: 'chips', tone: 'success',
    hint: 'Phrases you like in your marketing (comma-separated).',
    help: 'Words and phrases you want to appear in your marketing. Effy will prefer them.',
    placeholder: 'trusted, transparent, book now' },
  { key: 'prohibited', label: 'Words to avoid', type: 'chips', tone: 'error',
    hint: 'Never say these (comma-separated).',
    help: 'Words or claims you never want used — risky superlatives, unverifiable guarantees, off-brand slang. Effy avoids them everywhere.',
    placeholder: 'cheapest, guaranteed, #1' },
  { key: 'products', label: 'Products / services', type: 'list', keys: ['title', 'desc'],
    hint: 'One per line: Name — short description.',
    help: 'What you sell. Effy references these by name so content is specific, not generic.',
    placeholder: 'Root canal — single-sitting RCT\nTeeth whitening — in-clinic & take-home' },
  { key: 'offers', label: 'Current offers', type: 'list', keys: ['title', 'desc'],
    hint: 'One per line: Offer — who it is for.',
    help: 'Current promotions or deals. Effy can weave them into timely content and campaigns.',
    placeholder: 'Free first consultation — for new patients' },
  { key: 'personas', label: 'Target customers', type: 'list', keys: ['name', 'motivation'],
    hint: 'One per line: Who — what they want.',
    help: "Who you're trying to reach and what they care about. Effy writes to them, not to everyone.",
    placeholder: 'Young parents — safe, painless care for kids' },
  { key: 'faqs', label: 'FAQs', type: 'list', keys: ['q', 'a'],
    hint: 'One per line: Question — answer.',
    help: 'Questions customers commonly ask, with your answers. Effy uses them to reply consistently in DMs, comments and content.',
    placeholder: 'Do you accept insurance? — Yes, all major providers' },
  { key: 'objections', label: 'Objections & responses', type: 'list', keys: ['q', 'a'],
    hint: 'One per line: Objection — how you answer it.',
    help: 'The reasons people hesitate to buy, and how you answer each — your sales rebuttal playbook. Effy uses these to pre-empt doubts in copy and replies.',
    placeholder: 'Too expensive — No-cost EMI on treatments over ₹10k' },
  { key: 'competitors', label: 'Competitors & positioning', type: 'list', keys: ['title', 'desc'],
    hint: 'One per line: Competitor — how you differ.',
    help: "Who you compete with and how you're different. Effy leans on your strengths without disparaging others.",
    placeholder: 'CityDental — we offer same-day appointments they cannot' },
  { key: 'visual', label: 'Visual identity', type: 'visual',
    hint: 'Brand colours and fonts for on-brand images.',
    help: 'Your logo, brand colours and fonts — used to keep generated images, ad films and landing pages on-brand. Upload a logo and Effy reads the colours for you.' },
  { key: 'legal', label: 'Legal & disclaimers', type: 'lines',
    hint: 'One per line — claims Effy must include or respect.',
    help: "Disclaimers or compliance lines you must include or respect (e.g. 'results vary'). Effy honours them in every output.",
    placeholder: 'Results vary by individual' },
];

const isSuggestable = (section) => section.type !== 'visual';

function isFilled(section, data) {
  if (section.type === 'paragraph') return !!(data && String(data).trim());
  if (section.type === 'visual') return !!(data && ((data.colors || []).length || (data.fonts || []).length || data.logo));
  return Array.isArray(data) && data.length > 0;
}

// ── tiny hover/focus tooltip for the ⓘ on each section ─────────────────────
function InfoTip({ text }) {
  return (
    <span className="relative inline-flex group align-middle">
      <button type="button" aria-label="What's this?"
        className="grid place-items-center w-4 h-4 rounded-full bg-transparent text-ink-faint hover:text-ink focus:text-ink">
        <Info className="w-3.5 h-3.5" />
      </button>
      <span className="pointer-events-none absolute left-0 top-6 z-30 hidden group-hover:block group-focus-within:block
        w-64 max-w-[80vw] rounded-lg border border-line bg-surface2 px-3 py-2 text-xs font-normal text-ink-soft shadow-e3 leading-relaxed normal-case tracking-normal">
        {text}
      </span>
    </span>
  );
}

// ── logo upload → auto-extract brand colours ──────────────────────────────
function LogoUploader({ workspaceId, logoUrl, onDone }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const inputRef = useRef(null);
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr('');
    try {
      await effyApi.uploadBrandLogo(workspaceId, file);
      await onDone();
    } catch (ex) { setErr(ex.message || 'Upload failed'); }
    finally { setBusy(false); if (inputRef.current) inputRef.current.value = ''; }
  };
  return (
    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-line/60">
      <div className="grid place-items-center w-16 h-16 rounded-xl bg-surface2 overflow-hidden shrink-0 border border-line">
        {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1.5" /> : <ImageIcon className="w-6 h-6 text-ink-faint" />}
      </div>
      <div className="min-w-0">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-coral-ink bg-transparent hover:opacity-80 disabled:opacity-60">
          {busy ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Reading your colours…</> : <><Upload className="w-3.5 h-3.5" /> {logoUrl ? 'Replace logo' : 'Upload logo'}</>}
        </button>
        <p className="text-[11px] text-ink-faint mt-0.5">PNG, JPG, WEBP or SVG. Effy reads your brand colours from it.</p>
        {err && <p className="text-[11px] text-error mt-0.5">{err}</p>}
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={onFile} className="hidden" />
    </div>
  );
}

function Display({ section, data }) {
  if (!isFilled(section, data) && section.type !== 'visual') {
    return <p className="text-sm text-ink-faint">Not set yet — add it, or let Effy draft it for you.</p>;
  }
  if (section.type === 'paragraph') return <p className="text-sm text-ink-soft leading-relaxed">{data}</p>;
  if (section.type === 'chips') {
    return <div className="flex flex-wrap gap-1.5">{data.map((t) => <Badge key={t} tone={section.tone}>{t}</Badge>)}</div>;
  }
  if (section.type === 'lines') {
    return <ul className="space-y-1 text-sm text-ink-soft list-disc pl-4">{data.map((t, i) => <li key={i}>{t}</li>)}</ul>;
  }
  if (section.type === 'visual') {
    const colors = data?.colors || []; const fonts = data?.fonts || [];
    if (!colors.length && !fonts.length) return <p className="text-sm text-ink-faint">Upload a logo above, or add colours &amp; fonts.</p>;
    return (
      <div className="space-y-3">
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {colors.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-xs text-ink-soft rounded-full bg-surface2 pl-1 pr-2.5 py-1">
                <span className="w-4 h-4 rounded-full border border-line" style={{ background: c }} />{c}
              </span>
            ))}
          </div>
        )}
        {fonts.length > 0 && <div className="flex flex-wrap gap-1.5">{fonts.map((f) => <Badge key={f} tone="default">{f}</Badge>)}</div>}
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {data.map((it, i) => (
        <li key={i} className="text-sm">
          <span className="font-semibold text-ink">{pri(it, section.keys)}</span>
          {sec(it, section.keys) && <span className="text-ink-soft"> — {sec(it, section.keys)}</span>}
        </li>
      ))}
    </ul>
  );
}

function SectionCard({ section, data, workspaceId, onSaved }) {
  const filled = isFilled(section, data);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [draftNote, setDraftNote] = useState(null);   // {cited:[...]} or {error}
  const initText = () => {
    if (section.type === 'paragraph') return data || '';
    if (section.type === 'chips') return (data || []).join(', ');
    if (section.type === 'lines') return (data || []).join('\n');
    if (section.type === 'list') return listToText(data, section.keys);
    return '';
  };
  const [val, setVal] = useState(initText);
  const [vis, setVis] = useState({ colors: (data?.colors || []).join(', '), fonts: (data?.fonts || []).join(', ') });

  const open = () => {
    setVal(initText());
    setVis({ colors: (data?.colors || []).join(', '), fonts: (data?.fonts || []).join(', ') });
    setEditing(true);
  };

  const draft = async () => {
    setDrafting(true); setDraftNote(null);
    try {
      const d = await effyApi.suggestBrandSection(workspaceId, section.key);
      setVal(suggestionToText(section, d.suggestion));
      setDraftNote({ cited: d.cited || [] });
    } catch (e) {
      // Leave the current text so nothing typed is lost; say why so the user can retry.
      setDraftNote({ error: e.message || 'Couldn’t draft this — try again.' });
    } finally { setDrafting(false); }
  };
  const openAndDraft = () => { open(); draft(); };

  const build = () => {
    if (section.type === 'paragraph') return val.trim();
    if (section.type === 'chips') return csv(val);
    if (section.type === 'lines') return nlines(val);
    if (section.type === 'list') return parseList(val, section.keys);
    if (section.type === 'visual') return { ...(data || {}), colors: csv(vis.colors), fonts: csv(vis.fonts) };
    return null;
  };

  const save = async () => {
    setBusy(true);
    try {
      await effyApi.saveBrandFact({ workspace: workspaceId, section: section.key, data: build(), status: 'good', sources: ['Manual'] });
      await onSaved();
      setEditing(false);
    } finally { setBusy(false); }
  };

  return (
    <Card className={`p-5 ${section.span ? 'lg:col-span-2' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-bold text-ink flex items-center gap-1.5">{section.label}<InfoTip text={section.help} /></h3>
        {!editing && (
          <div className="flex items-center gap-3 shrink-0">
            {isSuggestable(section) && (
              <button onClick={openAndDraft}
                className="inline-flex items-center gap-1 text-xs font-bold text-coral-ink bg-transparent hover:opacity-80">
                <Sparkles className="w-3.5 h-3.5" /> Draft with AI
              </button>
            )}
            <button onClick={open}
              className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft bg-transparent hover:text-ink">
              {filled ? <><Pencil className="w-3.5 h-3.5" /> Edit</> : <><Plus className="w-3.5 h-3.5" /> Add</>}
            </button>
          </div>
        )}
      </div>

      {section.type === 'visual' && (
        <LogoUploader workspaceId={workspaceId} logoUrl={data?.logoUrl} onDone={onSaved} />
      )}

      {editing ? (
        <div>
          {section.hint && <p className="text-xs text-ink-faint mb-1.5">{section.hint}</p>}
          {section.type === 'visual' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">Colours (comma-separated hex or names)</label>
                <input value={vis.colors} onChange={(e) => setVis((p) => ({ ...p, colors: e.target.value }))}
                  placeholder="#E5484D, #0D0E12, warm cream" className="w-full rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1">Fonts (comma-separated)</label>
                <input value={vis.fonts} onChange={(e) => setVis((p) => ({ ...p, fonts: e.target.value }))}
                  placeholder="Playfair Display, Inter" className="w-full rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
              </div>
            </div>
          ) : (
            <textarea autoFocus rows={section.rows || (section.type === 'list' ? 4 : 2)} value={val} onChange={(e) => setVal(e.target.value)}
              placeholder={section.placeholder} className="w-full rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
          )}
          {draftNote?.error && <p role="alert" className="text-xs text-error mt-1.5">{draftNote.error}</p>}
          {draftNote?.cited?.length > 0 && (
            <p className="text-xs text-ink-faint mt-1.5">Drafted from: {draftNote.cited.join(', ')}</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" variant="primary" onClick={save} disabled={busy || drafting}>
              {busy ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Check className="w-3.5 h-3.5" /> Save</>}
            </Button>
            {isSuggestable(section) && (
              <Button size="sm" variant="secondary" onClick={draft} disabled={drafting || busy}>
                {drafting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Drafting…</> : <><Sparkles className="w-3.5 h-3.5" /> {val.trim() ? 'Re-draft' : 'Draft with AI'}</>}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={busy}><X className="w-3.5 h-3.5" /> Cancel</Button>
          </div>
        </div>
      ) : (
        <Display section={section} data={data} />
      )}
    </Card>
  );
}

function VoiceTest({ workspaceId }) {
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const run = async () => {
    setBusy(true); setErr('');
    try { setResult(await effyApi.testBrandVoice(workspaceId, prompt.trim())); }
    catch (e) { setErr(e.message || 'Couldn’t test the voice — try again.'); }
    finally { setBusy(false); }
  };
  const facts = { tone: 'tone', approved: 'approved words', prohibited: 'words to avoid' };
  return (
    <Card className="p-5">
      <section aria-label="Test the brand voice">
        <h3 className="font-bold text-ink mb-1 flex items-center gap-2"><MessageSquareText className="w-4 h-4 text-coral-ink" /> Test the brand voice</h3>
        <p className="text-sm text-ink-soft mb-3">Ask for any piece of copy and see how it sounds with the facts and documents above.</p>
        <textarea rows={2} value={prompt} onChange={(e) => setPrompt(e.target.value)} aria-label="What should Effy write?"
          placeholder="e.g. A two-line Instagram caption for our Diwali offer" className="w-full rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
        <div className="flex items-center gap-2 mt-2">
          <Button size="sm" onClick={run} disabled={busy || !prompt.trim()}>
            {busy ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Writing…</> : <><Sparkles className="w-3.5 h-3.5" /> Try it</>}
          </Button>
        </div>
        {err && <p role="alert" className="text-sm text-error mt-2">{err}</p>}
        {result && (
          <div className="mt-3 rounded-xl bg-surface2/70 p-3.5">
            <p data-testid="voice-output" className="text-sm text-ink whitespace-pre-line">{result.output}</p>
            <p className="text-xs text-ink-faint mt-2">
              Grounded in: {(result.cited || []).map((c) => facts[c] || c).join(', ')}
            </p>
          </div>
        )}
      </section>
    </Card>
  );
}

const SOURCE_TYPES = { document: FileText, website: Globe, manual: Pencil };

function Sources({ workspaceId, sources, onChanged }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const [link, setLink] = useState({ name: '', ref: '' });
  const run = async (key, fn) => {
    setBusy(key); setErr('');
    try { await fn(); onChanged(); return true; } catch (e) { setErr(e.message || 'Something went wrong — try again.'); return false; } finally { setBusy(''); }
  };
  const upload = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setErr('Documents must be under 10 MB.'); return; }
    run('upload', () => effyApi.addBrandDocument(workspaceId, file));
  };
  return (
    <Card className="p-5">
      <section aria-label="Brand sources">
        <h3 className="font-bold text-ink mb-1 flex items-center gap-2"><FileText className="w-4 h-4 text-coral-ink" /> Brand sources</h3>
        <p className="text-sm text-ink-soft mb-3">
          Upload brand guidelines or other documents (PDF, DOCX, TXT or Markdown, up to 10 MB). Their text grounds Draft with AI
          and the voice test, which name the document they drew on. Website links are recorded for reference.
        </p>
        {sources.length ? (
          <ul className="divide-y divide-line mb-3">
            {sources.map((s) => {
              const Icon = SOURCE_TYPES[s.type] || FileText;
              return (
                <li key={s.id} className="flex items-center gap-2.5 py-2 text-sm">
                  <Icon className="w-4 h-4 text-ink-faint shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink truncate">{s.name}</span>
                    <span className="block text-xs text-ink-faint truncate">
                      {s.type === 'document' ? `${s.chars.toLocaleString('en-IN')} characters of text` : s.ref || s.type} · added {s.date}
                    </span>
                  </span>
                  <button type="button" aria-label={`Remove ${s.name}`} disabled={!!busy}
                    onClick={() => run(`del${s.id}`, () => effyApi.deleteBrandSource(s.id))}
                    className="bg-transparent text-ink-faint hover:text-error">
                    {busy === `del${s.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : <p className="text-sm text-ink-faint mb-3">No sources yet.</p>}
        <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md,application/pdf,text/plain,text/markdown" hidden
          onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => fileRef.current?.click()} disabled={!!busy}>
            {busy === 'upload' ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Reading…</> : <><Upload className="w-3.5 h-3.5" /> Upload document</>}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <input value={link.name} onChange={(e) => setLink((l) => ({ ...l, name: e.target.value }))} placeholder="Name (optional)"
            aria-label="Website name" className="rounded-xl bg-surface2 px-3 py-2 text-sm w-40" />
          <input value={link.ref} onChange={(e) => setLink((l) => ({ ...l, ref: e.target.value }))} placeholder="https://yourbrand.com"
            aria-label="Website address" className="rounded-xl bg-surface2 px-3 py-2 text-sm flex-1 min-w-[180px]" />
          <Button size="sm" variant="secondary" disabled={!!busy || !link.ref.trim()}
            onClick={async () => { if (await run('link', () => effyApi.addBrandLink(workspaceId, { name: link.name.trim(), ref: link.ref.trim() }))) setLink({ name: '', ref: '' }); }}>
            <Globe className="w-3.5 h-3.5" /> Add website
          </Button>
        </div>
        {err && <p role="alert" className="text-sm text-error mt-2">{err}</p>}
      </section>
    </Card>
  );
}

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

  const done = SECTIONS.filter((s) => isFilled(s, brain[s.key]?.data)).length;

  return (
    <div>
      <PageHeader
        title="Brand Brain"
        subtitle="The knowledge grounding every AI generation — captions, images, ad films, landing copy and Effy's replies."
        actions={<Badge tone="success"><ShieldCheck className="w-3 h-3" /> {brain.completeness}% complete</Badge>}
      />

      <div className="max-w-xl mb-1"><Pacing value={brain.completeness} max={100} tone="success" /></div>
      <p className="text-xs text-ink-faint mb-6">{done} of {SECTIONS.length} sections filled. Not sure what to write? Hit <span className="font-semibold text-coral-ink">Draft with AI</span> on any section and refine it.</p>

      {brain.completeness < 100 && (
        <Card className="p-4 mb-4 bg-coral-tint/60 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-coral-ink mt-0.5 shrink-0" />
          <p className="text-sm text-ink-soft">
            <span className="font-semibold text-ink">Let Effy help.</span> Upload your logo to learn your colours, and use <span className="font-semibold text-ink">Draft with AI</span> to fill any section — then edit to taste. Every section sharpens every output.
          </p>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        {SECTIONS.map((s) => (
          <SectionCard key={s.key} section={s} data={brain[s.key]?.data} workspaceId={workspace.id} onSaved={refetch} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start mt-4">
        <VoiceTest workspaceId={workspace.id} />
        <Sources workspaceId={workspace.id} sources={brain.sources?.data || []} onChanged={refetch} />
      </div>

      <Card className="p-5 mt-4 bg-coral-tint/60">
        <h3 className="font-bold text-ink mb-1 flex items-center gap-2"><Check className="w-4 h-4 text-coral-ink" /> Grounding is live</h3>
        <p className="text-sm text-ink-soft">AI Studio, ad films, landing copy and Effy replies use these facts right now. Coming next: auto-extraction from your website &amp; socials with an approval step.</p>
      </Card>
    </div>
  );
}
