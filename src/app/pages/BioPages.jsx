import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Link2, Check, Trash2, AtSign, ExternalLink } from 'lucide-react';
import { useWorkspace, num } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { useInvalidatingMutation } from '../api/hooks';
import { Card, PageHeader, Button, Badge, EmptyState } from '../../ui';
import { cn } from '../../lib/cn';

const LINK_KINDS = [
  ['link', 'Link'], ['product', 'Product'], ['appointment', 'Appointment'],
  ['payment', 'Payment'], ['featured', 'Featured post'],
];
const SOCIALS = [
  ['instagram', 'Instagram'], ['facebook', 'Facebook'], ['youtube', 'YouTube'],
  ['linkedin', 'LinkedIn'], ['x', 'X'],
];
const THEMES = [
  ['warm', 'Warm', 'bg-[#fdf6ef] border-[#e8d9c8]'],
  ['dark', 'Dark', 'bg-[#231f1c] border-[#3d3733]'],
  ['mint', 'Mint', 'bg-[#eef7f1] border-[#cfe5d6]'],
];

const Field = ({ label, ...props }) => (
  <label className="block">
    <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">{label}</span>
    <input {...props} className="mt-1 w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm" />
  </label>
);

function Editor({ page, setPage, forms }) {
  const setLink = (i, patch) => setPage({ ...page, links: page.links.map((l, j) => (j === i ? { ...l, ...patch } : l)) });
  const move = (i, dir) => {
    const links = [...page.links];
    const j = i + dir;
    if (j < 0 || j >= links.length) return;
    [links[i], links[j]] = [links[j], links[i]];
    setPage({ ...page, links });
  };
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wide text-ink-faint">Profile</h4>
        <div className="grid grid-cols-[70px_1fr] gap-3">
          <Field label="Avatar" maxLength={4} value={page.avatar || ''} onChange={(e) => setPage({ ...page, avatar: e.target.value })} />
          <Field label="Display title" value={page.title || ''} onChange={(e) => setPage({ ...page, title: e.target.value })} />
        </div>
        <Field label="Bio line" value={page.bio || ''} onChange={(e) => setPage({ ...page, bio: e.target.value })} />

        <h4 className="text-xs font-bold uppercase tracking-wide text-ink-faint pt-2">Theme</h4>
        <div className="flex gap-2">
          {THEMES.map(([key, label, swatch]) => (
            <button key={key} onClick={() => setPage({ ...page, theme: key })}
              className={cn('flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold',
                page.theme === key ? 'border-coral text-coral-ink' : 'border-line text-ink-soft')}>
              <span className={cn('w-4 h-4 rounded-full border', swatch)} /> {label}
            </button>
          ))}
        </div>

        <h4 className="text-xs font-bold uppercase tracking-wide text-ink-faint pt-2">Social profiles</h4>
        {SOCIALS.map(([key, label]) => (
          <Field key={key} label={label} placeholder={`https://${key === 'x' ? 'x.com' : `${key}.com`}/…`}
            value={page.socials?.[key] || ''}
            onChange={(e) => setPage({ ...page, socials: { ...page.socials, [key]: e.target.value } })} />
        ))}

        <h4 className="text-xs font-bold uppercase tracking-wide text-ink-faint pt-2">Lead capture & contact</h4>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">Lead form (published only)</span>
          <select value={page.formSlug || ''} onChange={(e) => setPage({ ...page, formSlug: e.target.value })}
            className="mt-1 w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm">
            <option value="">— none —</option>
            {forms.filter((f) => f.status === 'published').map((f) => <option key={f.id} value={f.slug}>{f.name}</option>)}
          </select>
        </label>
        <Field label="WhatsApp number" placeholder="+91 98765 43210" value={page.whatsapp || ''}
          onChange={(e) => setPage({ ...page, whatsapp: e.target.value })} />
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wide text-ink-faint">Links (max 12)</h4>
        {page.links.map((l, i) => (
          <div key={l.id ?? `new-${i}`} className="rounded-lg border border-line bg-surface p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex flex-col text-ink-faint">
                <button onClick={() => move(i, -1)} className="hover:text-ink leading-none">▴</button>
                <button onClick={() => move(i, 1)} className="hover:text-ink leading-none">▾</button>
              </span>
              <input value={l.label} placeholder="Label" onChange={(e) => setLink(i, { label: e.target.value })}
                className="flex-1 rounded-sm border border-line bg-surface px-2.5 py-1.5 text-sm font-semibold" />
              <select value={l.kind} onChange={(e) => setLink(i, { kind: e.target.value })}
                className="rounded-sm border border-line bg-surface px-2 py-1.5 text-xs">
                {LINK_KINDS.map(([k, lab]) => <option key={k} value={k}>{lab}</option>)}
              </select>
              <button onClick={() => setPage({ ...page, links: page.links.filter((_, j) => j !== i) })}
                className="text-ink-faint hover:text-error"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-2 pl-6">
              <input value={l.url} placeholder="https://…" onChange={(e) => setLink(i, { url: e.target.value })}
                className="flex-1 rounded-sm border border-line bg-surface px-2.5 py-1.5 text-xs font-mono" />
              {l.clicks > 0 && <span className="text-xs text-ink-faint whitespace-nowrap tabular-nums">{num(l.clicks)} clicks</span>}
            </div>
          </div>
        ))}
        {page.links.length < 12 && (
          <button onClick={() => setPage({ ...page, links: [...page.links, { kind: 'link', label: '', url: '', clicks: 0 }] })}
            className="flex items-center gap-1.5 text-sm font-bold text-coral-ink"><Plus className="w-4 h-4" /> Add link</button>
        )}
      </div>
    </div>
  );
}

export default function BioPages() {
  const { workspace } = useWorkspace();
  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['bio', workspace?.id],
    queryFn: () => effyApi.listBio(workspace.id),
    enabled: !!workspace,
  });
  const { data: forms = [] } = useQuery({
    queryKey: ['forms', workspace?.id],
    queryFn: () => effyApi.listForms(workspace.id),
    enabled: !!workspace,
  });
  const invalidate = () => ['bio', workspace?.id];
  const create = useInvalidatingMutation((p) => effyApi.createBio(p), invalidate);
  const update = useInvalidatingMutation(({ id, ...p }) => effyApi.updateBio(id, p), invalidate);

  const [editing, setEditing] = useState(null);
  const [copied, setCopied] = useState(null);

  const startCreate = async () => {
    const page = await create.mutateAsync({ workspace: workspace.id, name: 'New bio page' });
    setEditing(page);
  };
  const copyLink = (p) => {
    navigator.clipboard?.writeText(`${window.location.origin}/b/${p.slug}`);
    setCopied(p.id);
    setTimeout(() => setCopied(null), 1500);
  };
  const saveEditing = async () => {
    await update.mutateAsync({
      id: editing.id, name: editing.name, title: editing.title, bio: editing.bio,
      avatar: editing.avatar, theme: editing.theme, socials: editing.socials || {},
      links: (editing.links || []).filter((l) => l.label.trim() && l.url.trim()),
      formSlug: editing.formSlug || '', whatsapp: editing.whatsapp || '',
    });
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title="Link-in-bio"
        subtitle="One hosted profile page for all your links — clicks are tracked per link, and the lead form feeds your pipeline."
        actions={<Button onClick={startCreate} disabled={create.isPending}><Plus className="w-4 h-4" /> New bio page</Button>}
      />

      {editing && (
        <Card className="p-5 mb-5 border-coral">
          <div className="flex items-center justify-between mb-4">
            <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className="text-lg font-extrabold text-ink bg-transparent border-b border-dashed border-line focus:border-coral outline-none" />
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button size="sm" onClick={saveEditing} disabled={update.isPending}><Check className="w-3.5 h-3.5" /> Save</Button>
            </div>
          </div>
          <Editor page={editing} setPage={setEditing} forms={forms} />
        </Card>
      )}

      {isLoading ? (
        <Card className="p-10 text-center text-ink-soft">Loading bio pages…</Card>
      ) : !pages.length ? (
        <EmptyState icon="🔗" title="No bio pages yet" body="Build your link-in-bio: profile, socials, and tracked links — plus a lead form and WhatsApp button. Publish and drop the link in every social profile." action={<Button onClick={startCreate}>Create bio page</Button>} />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-ink-faint border-b border-line">{['Page', 'Status', 'Views', 'Clicks', 'Lead form', 'Share', ''].map((h) => <th key={h} className="font-semibold px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id} className="border-b border-line/70 last:border-0 hover:bg-surface2/60">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-semibold text-ink"><AtSign className="w-4 h-4 text-ink-faint" /> {p.name}</span>
                    <span className="block text-xs text-ink-faint ml-6">{p.links.length} links · {p.created}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => update.mutate({ id: p.id, status: p.status === 'published' ? 'draft' : 'published' })}
                      className={cn('text-xs font-bold px-3 py-1.5 rounded-full', p.status === 'published' ? 'bg-success-soft text-success' : 'bg-surface2 text-ink-soft hover:text-ink')}>
                      {p.status === 'published' ? '● Published' : 'Publish'}
                    </button>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{num(p.views || 0)}</td>
                  <td className="px-4 py-3 tabular-nums">{num(p.clicks || 0)}</td>
                  <td className="px-4 py-3">
                    {p.formSlug
                      ? <Badge>{forms.find((f) => f.slug === p.formSlug)?.name || 'Form'}</Badge>
                      : <span className="text-xs text-ink-faint">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => copyLink(p)} disabled={p.status !== 'published'}>
                        {copied === p.id ? <><Check className="w-3.5 h-3.5 text-success" /> Copied</> : <><Link2 className="w-3.5 h-3.5" /> Copy link</>}
                      </Button>
                      {p.status === 'published' && (
                        <a href={`/b/${p.slug}`} target="_blank" rel="noreferrer" className="text-ink-faint hover:text-coral-ink"><ExternalLink className="w-4 h-4" /></a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost" onClick={() => setEditing(p)}>Edit</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
