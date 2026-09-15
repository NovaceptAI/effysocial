import React, { useRef, useState } from 'react';
import { FileText, Globe, Loader2, Pencil, Trash2, Upload } from 'lucide-react';
import { effyApi } from '../api/effyApi';
import { Button, Card } from '../../ui';

// Brand documents and website links for a workspace — shared by Brand Brain and onboarding.
const SOURCE_TYPES = { document: FileText, website: Globe, manual: Pencil };

export default function BrandSources({ workspaceId, sources, onChanged, defaultLink = '' }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const [link, setLink] = useState({ name: '', ref: defaultLink });
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
