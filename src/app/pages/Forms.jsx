import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Link2, Check, Trash2, FileInput, ExternalLink } from 'lucide-react';
import { useWorkspace, num } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { useInvalidatingMutation } from '../api/hooks';
import { Card, PageHeader, Button, Badge, EmptyState } from '../../ui';
import { cn } from '../../lib/cn';

const FIELD_TYPES = ['text', 'email', 'phone', 'select', 'textarea'];

function FieldEditor({ fields, onChange }) {
  const update = (i, patch) => onChange(fields.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  const remove = (i) => onChange(fields.filter((_, j) => j !== i));
  const add = () => onChange([...fields, { id: `f${Date.now()}`, label: 'New field', type: 'text', required: false }]);
  return (
    <div className="space-y-2">
      {fields.map((f, i) => (
        <div key={f.id} className="flex items-center gap-2">
          <input value={f.label} onChange={(e) => update(i, { label: e.target.value })}
            className="flex-1 rounded-sm border border-line bg-surface px-2.5 py-1.5 text-sm" />
          <select value={f.type} onChange={(e) => update(i, { type: e.target.value })}
            className="rounded-sm border border-line bg-surface px-2 py-1.5 text-sm">
            {FIELD_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <label className="flex items-center gap-1 text-xs text-ink-soft whitespace-nowrap">
            <input type="checkbox" checked={!!f.required} onChange={(e) => update(i, { required: e.target.checked })} className="accent-coral" /> req
          </label>
          <button onClick={() => remove(i)} className="text-ink-faint hover:text-error"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1.5 text-sm font-bold text-coral-ink"><Plus className="w-4 h-4" /> Add field</button>
    </div>
  );
}

export default function Forms() {
  const { workspace } = useWorkspace();
  const { data: forms = [], isLoading } = useQuery({
    queryKey: ['forms', workspace?.id],
    queryFn: () => effyApi.listForms(workspace.id),
    enabled: !!workspace,
  });
  const invalidate = () => ['forms', workspace?.id];
  const create = useInvalidatingMutation((p) => effyApi.createForm(p), invalidate);
  const update = useInvalidatingMutation(({ id, ...p }) => effyApi.updateForm(id, p), invalidate);

  const [editing, setEditing] = useState(null); // form object being edited
  const [copied, setCopied] = useState(null);

  const startCreate = async () => {
    const form = await create.mutateAsync({ workspace: workspace.id, name: 'New lead form' });
    setEditing(form);
  };
  const copyLink = (f) => {
    navigator.clipboard?.writeText(`${window.location.origin}/f/${f.slug}`);
    setCopied(f.id);
    setTimeout(() => setCopied(null), 1500);
  };
  const saveEditing = async () => {
    await update.mutateAsync({
      id: editing.id, name: editing.name, fields: editing.fields,
      thankyou: editing.thankyou, consent_text: editing.consentText,
    });
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title="Forms"
        subtitle="Lead-capture forms — submissions land in your pipeline with UTM attribution."
        actions={<Button onClick={startCreate} disabled={create.isPending}><Plus className="w-4 h-4" /> New form</Button>}
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
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-2">Fields</h4>
              <FieldEditor fields={editing.fields} onChange={(fields) => setEditing({ ...editing, fields })} />
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">Thank-you message</span>
                <input value={editing.thankyou} onChange={(e) => setEditing({ ...editing, thankyou: e.target.value })}
                  className="mt-1 w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm" />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">Consent text (optional)</span>
                <input value={editing.consentText || ''} onChange={(e) => setEditing({ ...editing, consentText: e.target.value })}
                  placeholder="e.g. I agree to be contacted about my enquiry."
                  className="mt-1 w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm" />
              </label>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <Card className="p-10 text-center text-ink-soft">Loading forms…</Card>
      ) : !forms.length ? (
        <EmptyState icon="📝" title="No forms yet" body="Create a lead form, publish it, and share the link — submissions flow straight into your pipeline." action={<Button onClick={startCreate}>Create form</Button>} />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-ink-faint border-b border-line">{['Form', 'Type', 'Status', 'Submissions', 'Share', ''].map((h) => <th key={h} className="font-semibold px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {forms.map((f) => (
                <tr key={f.id} className="border-b border-line/70 last:border-0 hover:bg-surface2/60">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-semibold text-ink"><FileInput className="w-4 h-4 text-ink-faint" /> {f.name}</span>
                    <span className="block text-xs text-ink-faint ml-6">{f.fields.length} fields · {f.created}</span>
                  </td>
                  <td className="px-4 py-3"><Badge>{f.type}</Badge></td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => update.mutate({ id: f.id, status: f.status === 'published' ? 'draft' : 'published' })}
                      className={cn('text-xs font-bold px-3 py-1.5 rounded-full', f.status === 'published' ? 'bg-success-soft text-success' : 'bg-surface2 text-ink-soft hover:text-ink')}>
                      {f.status === 'published' ? '● Published' : 'Publish'}
                    </button>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{num(f.submissions || 0)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => copyLink(f)} disabled={f.status !== 'published'}>
                        {copied === f.id ? <><Check className="w-3.5 h-3.5 text-success" /> Copied</> : <><Link2 className="w-3.5 h-3.5" /> Copy link</>}
                      </Button>
                      {f.status === 'published' && (
                        <a href={`/f/${f.slug}`} target="_blank" rel="noreferrer" className="text-ink-faint hover:text-coral-ink"><ExternalLink className="w-4 h-4" /></a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost" onClick={() => setEditing(f)}>Edit</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
