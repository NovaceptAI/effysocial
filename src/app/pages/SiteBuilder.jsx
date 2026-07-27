import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Globe, Sparkles, Loader2, ArrowLeft, ExternalLink, Trash2, Check, Rocket, Palette, Plus, Copy,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge } from '../../ui';
import { VERTICALS, STYLE_LIST } from '../sites/templates.js';
import SiteRenderer from '../../marketing/SiteRenderer';

const publicHref = (slug) => `${window.location.origin}/s/${slug}`;

function CreatePanel({ workspaceId, brandColors, onCreated }) {
  const [vertical, setVertical] = useState('services');
  const [style, setStyle] = useState('minimal');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const generate = async () => {
    setBusy(true); setErr('');
    try { onCreated(await effyApi.generateSite(workspaceId, vertical, style)); }
    catch (e) { setErr(e.message || 'Could not generate the site.'); }
    finally { setBusy(false); }
  };

  return (
    <Card className="p-6">
      <h3 className="font-display text-lg font-semibold tracking-tight mb-1 flex items-center gap-2"><Sparkles className="w-5 h-5 text-coral-ink" /> Generate a website</h3>
      <p className="text-sm text-ink-soft mb-5">Pick a template and a style — Effy fills the copy from your Brand Brain and colours it from your logo. You can edit everything after.</p>

      {!brandColors?.length && (
        <div className="text-xs text-ink-soft bg-warning-soft/60 rounded-lg px-3 py-2 mb-4">
          Tip: upload your logo in <a href="/app/brand" className="font-bold text-coral-ink">Brand Brain</a> so the site uses your real brand colours.
        </div>
      )}

      <div className="text-xs font-bold text-ink-soft mb-2">1. Choose a template</div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-5">
        {VERTICALS.map((v) => (
          <button key={v.key} onClick={() => setVertical(v.key)}
            className={`text-left p-3.5 rounded-xl border bg-transparent transition ${vertical === v.key ? 'border-coral ring-1 ring-coral/40' : 'border-line hover:border-coral/50'}`}>
            <div className="font-bold text-sm text-ink">{v.label}</div>
            <div className="text-xs text-ink-faint mt-0.5">{v.blurb}</div>
          </button>
        ))}
      </div>

      <div className="text-xs font-bold text-ink-soft mb-2">2. Choose a style</div>
      <div className="flex flex-wrap gap-2 mb-6">
        {STYLE_LIST.map((s) => (
          <button key={s.key} onClick={() => setStyle(s.key)}
            className={`px-3.5 py-2 rounded-lg border bg-transparent text-sm font-semibold transition ${style === s.key ? 'border-coral text-ink ring-1 ring-coral/40' : 'border-line text-ink-soft hover:text-ink'}`}
            title={s.blurb}>{s.label}</button>
        ))}
      </div>

      {err && <p className="text-sm text-error mb-3">{err}</p>}
      <Button variant="spark" onClick={generate} disabled={busy}>
        {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Building your site…</> : <><Sparkles className="w-4 h-4" /> Generate from Brand Brain</>}
      </Button>
    </Card>
  );
}

function Editor({ site, onBack, onChanged }) {
  const [active, setActive] = useState((site.pages?.[0]?.key) || 'home');
  const [busy, setBusy] = useState('');
  const [copied, setCopied] = useState(false);
  const firstContact = (site.pages || []).flatMap((p) => p.sections || []).find((s) => s.type === 'contact') || {};
  const [contact, setContact] = useState({
    whatsapp: firstContact.whatsapp || '', phone: firstContact.phone || '',
    address: firstContact.address || '', email: firstContact.email || '',
  });

  const patch = async (payload, tag) => {
    setBusy(tag); try { onChanged(await effyApi.updateSite(site.id, payload)); } finally { setBusy(''); }
  };
  const setStyle = (style) => patch({ style }, 'style');
  const togglePublish = () => patch({ status: site.status === 'published' ? 'draft' : 'published' }, 'pub');

  const saveContact = () => {
    const pages = (site.pages || []).map((p) => ({
      ...p, sections: (p.sections || []).map((s) => s.type === 'contact' ? { ...s, ...contact } : s),
    }));
    patch({ pages, contact }, 'contact');
  };

  const copyLink = () => { navigator.clipboard?.writeText(publicHref(site.slug)); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div>
      <div className="flex items-center flex-wrap gap-3 mb-4">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4" /> All sites</Button>
        <span className="font-bold text-ink">{site.name}</span>
        <Badge tone={site.status === 'published' ? 'success' : 'default'}>{site.status}</Badge>
        <div className="flex-1" />
        {site.status === 'published' && (
          <>
            <Button variant="secondary" onClick={copyLink}>{copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy link</>}</Button>
            <a href={publicHref(site.slug)} target="_blank" rel="noreferrer">
              <Button variant="secondary"><ExternalLink className="w-4 h-4" /> Open live</Button>
            </a>
          </>
        )}
        <Button variant="spark" onClick={togglePublish} disabled={busy === 'pub'}>
          {busy === 'pub' ? <Loader2 className="w-4 h-4 animate-spin" /> : site.status === 'published' ? 'Unpublish' : <><Rocket className="w-4 h-4" /> Publish</>}
        </Button>
      </div>

      <div className="grid lg:grid-cols-[260px,1fr] gap-4 items-start">
        {/* Controls */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="text-xs font-bold text-ink-soft mb-2 flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" /> Style</div>
            <div className="flex flex-wrap gap-1.5">
              {STYLE_LIST.map((s) => (
                <button key={s.key} onClick={() => setStyle(s.key)} disabled={busy === 'style'}
                  className={`px-2.5 py-1.5 rounded-lg border bg-transparent text-xs font-semibold transition ${site.style === s.key ? 'border-coral text-ink ring-1 ring-coral/40' : 'border-line text-ink-soft hover:text-ink'}`}>{s.label}</button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-xs font-bold text-ink-soft mb-2">Contact details</div>
            <div className="space-y-2">
              {['whatsapp', 'phone', 'address', 'email'].map((k) => (
                <input key={k} value={contact[k]} onChange={(e) => setContact((p) => ({ ...p, [k]: e.target.value }))}
                  placeholder={k[0].toUpperCase() + k.slice(1)} className="w-full rounded-lg bg-surface2 px-3 py-2 text-sm" />
              ))}
            </div>
            <Button size="sm" variant="primary" className="mt-3 w-full" onClick={saveContact} disabled={busy === 'contact'}>
              {busy === 'contact' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Check className="w-3.5 h-3.5" /> Save contact</>}
            </Button>
          </Card>

          <Card className="p-4">
            <div className="text-xs font-bold text-ink-soft mb-2">Pages</div>
            <div className="flex flex-col gap-1">
              {(site.pages || []).map((p) => (
                <button key={p.key} onClick={() => setActive(p.key)}
                  className={`text-left px-3 py-2 rounded-lg text-sm font-semibold bg-transparent transition ${active === p.key ? 'bg-surface2 text-ink' : 'text-ink-soft hover:text-ink'}`}>{p.nav}</button>
              ))}
            </div>
          </Card>
        </div>

        {/* Live preview */}
        <div className="rounded-2xl border border-line overflow-hidden bg-white" style={{ height: '72vh', overflowY: 'auto' }}>
          <SiteRenderer site={site} activePage={active} onNav={setActive} />
        </div>
      </div>
    </div>
  );
}

export default function SiteBuilder() {
  const { workspace } = useWorkspace();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['sites', workspace?.id], queryFn: () => effyApi.listSites(workspace.id), enabled: !!workspace,
  });
  const { data: brain } = useQuery({
    queryKey: ['brand', workspace?.id], queryFn: () => effyApi.getBrand(workspace.id), enabled: !!workspace,
  });
  const brandColors = brain?.visual?.data?.colors || [];
  const invalidate = () => qc.invalidateQueries({ queryKey: ['sites', workspace?.id] });

  const removeSite = async (id) => { await effyApi.deleteSite(id); invalidate(); };

  if (editing) {
    return (
      <Editor site={editing} onBack={() => { setEditing(null); invalidate(); }}
        onChanged={(s) => { setEditing(s); invalidate(); }} />
    );
  }

  return (
    <div>
      <PageHeader title="Websites" subtitle="Generate a multi-page brand website from your Brand Brain — themed with your logo colours, filled with your real products, offers and FAQs." />

      <CreatePanel workspaceId={workspace.id} brandColors={brandColors} onCreated={(s) => { setEditing(s); invalidate(); }} />

      <h2 className="font-display text-lg font-semibold tracking-tight text-ink mt-8 mb-3">Your websites</h2>
      {isLoading ? (
        <div className="h-28 rounded-2xl bg-surface2 animate-pulse" />
      ) : sites.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sites.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-ink truncate">{s.name}</div>
                  <div className="text-xs text-ink-faint mt-0.5 capitalize">{s.template.replace('_', ' ')} · {s.style} · {s.views} views</div>
                </div>
                <Badge tone={s.status === 'published' ? 'success' : 'default'}>{s.status}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button size="sm" variant="primary" onClick={() => setEditing(s)}><Globe className="w-3.5 h-3.5" /> Open</Button>
                {s.status === 'published' && (
                  <a href={publicHref(s.slug)} target="_blank" rel="noreferrer"><Button size="sm" variant="secondary"><ExternalLink className="w-3.5 h-3.5" /></Button></a>
                )}
                <div className="flex-1" />
                <button onClick={() => removeSite(s.id)} title="Delete" className="text-ink-faint hover:text-error bg-transparent"><Trash2 className="w-4 h-4" /></button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-sm text-ink-soft flex items-center gap-2">
          <Plus className="w-4 h-4 text-ink-faint" /> No websites yet — generate your first one above.
        </Card>
      )}
    </div>
  );
}
