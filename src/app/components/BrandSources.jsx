import React, { useRef, useState } from 'react';
import { FileText, Globe, Loader2, Pencil, Trash2, Upload } from 'lucide-react';
import { effyApi } from '../api/effyApi';
import { Button, Card } from '../../ui';

// Brand documents, websites and written briefs for a workspace — shared by Brand Brain and onboarding.
// Their text grounds Draft with AI, the voice test and the marketing plan.
const SOURCE_TYPES = { document: FileText, website: Globe, manual: Pencil };

export default function BrandSources({ workspaceId, sources, onChanged, defaultLink = '', briefOpen = false }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const [link, setLink] = useState({ name: '', ref: defaultLink });
  const [readNote, setReadNote] = useState(null); // { ok, text } after adding a website
  const [writing, setWriting] = useState(briefOpen);
  const [brief, setBrief] = useState('');
  const run = async (key, fn) => {
    setBusy(key); setErr('');
    try { await fn(); onChanged(); return true; } catch (e) { setErr(e.message || 'Something went wrong — try again.'); return false; } finally { setBusy(''); }
  };
  const upload = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setErr('Documents must be under 10 MB.'); return; }
    run('upload', () => effyApi.addBrandDocument(workspaceId, file));
  };
  const addWebsite = async () => {
    setReadNote(null);
    let result;
    const ok = await run('link', async () => { result = await effyApi.addBrandLink(workspaceId, { name: link.name.trim(), ref: link.ref.trim() }); });
    if (!ok) return;
    setLink({ name: '', ref: '' });
    const { read } = result;
    if (!read) return;
    const host = (() => { try { return new URL(result.source.ref).hostname; } catch { return result.source.ref; } })();
    setReadNote(read.ok
      ? { ok: true, text: read.already ? `${host} was already read.` : `Read ${read.pages} page${read.pages === 1 ? '' : 's'} from ${host}.` }
      : { ok: false, text: `Saved the link, but couldn’t read it: ${read.message}` });
  };
  const saveBrief = async () => {
    if (await run('brief', () => effyApi.addBrandBrief(workspaceId, brief.trim()))) { setBrief(''); setWriting(false); }
  };
  return (
    <Card className="p-5">
      <section aria-label="Brand sources">
        <h3 className="font-bold text-ink mb-1 flex items-center gap-2"><FileText className="w-4 h-4 text-coral-ink" /> Brand sources</h3>
        <p className="text-sm text-ink-soft mb-3">
          Upload a brochure, company profile or brand guidelines (PDF, DOCX, TXT or Markdown, up to 10 MB), write a short brief,
          or add your website — we read its home page and main pages. Their text grounds Draft with AI, the voice test and your
          marketing plan.
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
                      {[s.type === 'website' ? s.ref : null, s.chars ? `${s.chars.toLocaleString('en-IN')} characters of text` : (s.type === 'website' ? 'link only — not read' : s.ref || s.type)].filter(Boolean).join(' · ')} · added {s.date}
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
          {!writing && (
            <Button size="sm" variant="secondary" onClick={() => setWriting(true)} disabled={!!busy}>
              <Pencil className="w-3.5 h-3.5" /> Write a brief
            </Button>
          )}
        </div>
        {writing && (
          <div className="mt-3">
            <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={5} maxLength={6000} aria-label="Business brief"
              placeholder="What you sell, who buys it, where you operate, what makes you different, and any offers running now."
              className="w-full rounded-xl bg-surface2 px-3 py-2 text-sm" />
            <div className="flex items-center gap-2 mt-2">
              <Button size="sm" onClick={saveBrief} disabled={!!busy || brief.trim().length < 20}>
                {busy === 'brief' ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : 'Save brief'}
              </Button>
              <span className="text-xs text-ink-faint">{brief.trim().length < 20 ? 'A sentence or two at least.' : `${brief.trim().length} characters`}</span>
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <input value={link.name} onChange={(e) => setLink((l) => ({ ...l, name: e.target.value }))} placeholder="Name (optional)"
            aria-label="Website name" className="rounded-xl bg-surface2 px-3 py-2 text-sm w-40" />
          <input value={link.ref} onChange={(e) => setLink((l) => ({ ...l, ref: e.target.value }))} placeholder="https://yourbrand.com"
            aria-label="Website address" className="rounded-xl bg-surface2 px-3 py-2 text-sm flex-1 min-w-[180px]" />
          <Button size="sm" variant="secondary" disabled={!!busy || !link.ref.trim()} onClick={addWebsite}>
            {busy === 'link' ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Reading the site…</> : <><Globe className="w-3.5 h-3.5" /> Add website</>}
          </Button>
        </div>
        {readNote && (
          <p role="status" className={`text-sm mt-2 ${readNote.ok ? 'text-success' : 'text-warning'}`}>{readNote.text}</p>
        )}
        {err && <p role="alert" className="text-sm text-error mt-2">{err}</p>}
      </section>
    </Card>
  );
}
