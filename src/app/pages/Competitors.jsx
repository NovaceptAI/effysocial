import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Swords, ExternalLink, Globe, RefreshCw, Info } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge } from '../../ui';
import { ChannelIcon } from '../components/parts';

const LINK_FIELDS = [
  { key: 'instagram', label: 'Instagram URL / handle', placeholder: 'https://instagram.com/competitor' },
  { key: 'facebook', label: 'Facebook page', placeholder: 'https://facebook.com/competitor' },
  { key: 'youtube', label: 'YouTube channel', placeholder: 'https://youtube.com/@competitor' },
  { key: 'website', label: 'Website', placeholder: 'https://competitor.com' },
];

export default function Competitors() {
  const { workspace } = useWorkspace();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [links, setLinks] = useState({});
  const [notes, setNotes] = useState('');

  const key = ['competitors', workspace?.id];
  const { data: competitors = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: () => effyApi.strategyCompetitors(workspace.id),
    enabled: !!workspace,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const add = useMutation({
    mutationFn: () => effyApi.addCompetitor({ workspace: workspace.id, name: name.trim(), links, notes }),
    onSuccess: () => { setName(''); setLinks({}); setNotes(''); setAdding(false); invalidate(); },
  });
  const remove = useMutation({ mutationFn: (id) => effyApi.deleteCompetitor(id), onSuccess: invalidate });

  return (
    <div>
      <PageHeader
        title="Competitors"
        subtitle="Track rival accounts — benchmarking metrics activate with channel sync."
        actions={!adding && <Button onClick={() => setAdding(true)}><Plus className="w-4 h-4" /> Add competitor</Button>}
      />

      {adding && (
        <Card className="p-5 mb-5">
          <h3 className="font-bold text-ink mb-3">Add a competitor</h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-1.5">Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Smile Dental Studio"
                className="w-full rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
            </div>
            {LINK_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-1.5">{f.label}</label>
                <input value={links[f.key] || ''} onChange={(e) => setLinks({ ...links, [f.key]: e.target.value })}
                  placeholder={f.placeholder} className="w-full rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-ink-faint mb-1.5">Notes (optional)</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What to watch — offers, formats, positioning…"
                className="w-full rounded-xl bg-surface2 px-3.5 py-2.5 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => add.mutate()} disabled={!name.trim() || add.isPending}>
              {add.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Save competitor
            </Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <div key={i} className="h-36 rounded-2xl bg-surface2 animate-pulse" />)}
        </div>
      ) : competitors.length === 0 ? (
        !adding && (
          <div className="py-16 text-center">
            <div className="grid place-items-center w-14 h-14 rounded-2xl bg-coral-tint text-coral-ink mx-auto mb-4"><Swords className="w-6 h-6" /></div>
            <p className="text-sm text-ink-faint mb-4">No competitors tracked yet. Add their social accounts and websites to keep them on your radar.</p>
            <Button onClick={() => setAdding(true)}><Plus className="w-4 h-4" /> Add your first competitor</Button>
          </div>
        )
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitors.map((c) => (
              <Card key={c.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-ink leading-snug">{c.name}</h3>
                  <button onClick={() => remove.mutate(c.id)} title="Remove"
                    className="text-ink-faint hover:text-error transition shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                {c.notes && <p className="text-xs text-ink-soft leading-relaxed mb-2.5">{c.notes}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(c.links || {}).map(([k, url]) => (
                    <a key={k} href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-surface2 px-2 py-1.5 text-xs font-semibold text-ink-soft hover:text-ink transition">
                      {k === 'website' ? <Globe className="w-3.5 h-3.5" /> : <ChannelIcon channel={k} className="w-4 h-4" />}
                      {k} <ExternalLink className="w-3 h-3 text-ink-faint" />
                    </a>
                  ))}
                  {!Object.keys(c.links || {}).length && <Badge>no links added</Badge>}
                </div>
              </Card>
            ))}
          </div>
          <p className="mt-4 flex items-start gap-1.5 text-xs text-ink-faint max-w-xl">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Posting frequency, engagement and share-of-voice benchmarks for these accounts arrive with channel sync — nothing is estimated until then. Their names already sharpen your Studio competitor angles.
          </p>
        </>
      )}
    </div>
  );
}
