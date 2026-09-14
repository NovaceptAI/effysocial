import React, { useState } from 'react';
import { effyApi } from '../api/effyApi';

// Colours follow the app theme by default; the dark production rooms (Film
// Maker, Product Shots) pass their own palette.
const APP = {
  text: 'rgb(var(--ui-ink))', dim: 'rgb(var(--ui-ink-soft))', raised: 'rgb(var(--ui-surface2))',
  surface: 'rgb(var(--ui-surface))', border: 'rgb(var(--ui-line))', green: 'rgb(var(--ui-success))',
  amber: 'rgb(var(--ui-warning))', red: 'rgb(var(--ui-error))', accent: 'rgb(var(--ui-coral))',
};

export const RESULT_LABELS = { accepted: 'Accepted', accepted_with_fixes: 'Accepted with fixes', rejected: 'Rejected' };
const ATTEMPTS = [
  ['copy', 'Copy drafts'], ['refine', 'Refinements'], ['image', 'Images'], ['video_start', 'Videos'],
  ['still', 'Stills generated'], ['clip_start', 'Clip renders'], ['voiceover', 'Voiceovers'],
  ['assemble', 'Assemblies'], ['build', 'Builds'],
];

export const fmtHours = (h) => {
  if (h == null) return '—';
  if (h < 1) return h * 60 < 1 ? 'under 1 min' : `${Math.round(h * 60)} min`;
  return h < 48 ? `${h.toFixed(1)} h` : `${(h / 24).toFixed(1)} days`;
};
const fmtSecs = (s) => (!s ? '—' : s < 90 ? `${Math.round(s)} s` : `${(s / 60).toFixed(1)} min`);
const pct = (v) => (v == null ? '—' : `${Math.round(v * 100)}%`);
const when = (iso) => {
  if (!iso) return '';
  const d = new Date(/(Z|[+-]\d\d:\d\d)$/.test(iso) ? iso : `${iso}Z`);
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};
export const resultTone = (result, c = APP) => ({ accepted: c.green, accepted_with_fixes: c.amber, rejected: c.red }[result] || c.dim);

const EMPTY = { result: 'accepted', quality: '', deliveryHours: '', defects: '', notes: '' };

export default function AcceptanceCard({
  kind, refId, workspaceId, summary, onSaved, palette = APP, deliveredLabel = 'start to delivery',
  title = 'Acceptance record',
}) {
  const c = palette;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  if (!summary) return null;

  const v = summary.verdict;
  const metrics = [
    ['Generation cost', `$${(summary.costUsd || 0).toFixed(2)}`],
    ...ATTEMPTS.filter(([k]) => k in (summary.attempts || {})).map(([k, label]) => [label, summary.attempts[k]]),
    ['Retries', summary.retries],
    ['Failures', summary.failures],
    ['Render time', fmtSecs(summary.renderSeconds)],
    ...('revisionRounds' in summary ? [['Revision rounds', summary.revisionRounds ?? '—']] : []),
    ...('approvalRate' in summary ? [['Approval rate', pct(summary.approvalRate)]] : []),
    [`Turnaround (${deliveredLabel})`, summary.deliveredAt ? fmtHours(summary.turnaroundHours) : 'Not delivered yet'],
  ];
  const needsDefects = form.result !== 'accepted';
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const input = { background: c.surface, color: c.text, border: `1px solid ${c.border}`, borderRadius: 8, padding: '6px 10px', fontSize: 12.5, width: '100%' };

  const save = async () => {
    if (needsDefects && !form.defects.trim()) { setErr('Describe what was wrong.'); return; }
    setSaving(true); setErr('');
    try {
      const d = await effyApi.recordAcceptance(kind, refId, {
        ...(workspaceId ? { workspace: workspaceId } : {}),
        result: form.result,
        quality: form.quality ? Number(form.quality) : null,
        deliveryHours: form.deliveryHours === '' ? null : Number(form.deliveryHours),
        defects: form.defects.trim(), notes: form.notes.trim(),
      });
      setOpen(false); setForm(EMPTY);
      onSaved?.(d.summary);
    } catch (e) {
      setErr(e.message || 'Could not save the verdict — try again.');
    } finally { setSaving(false); }
  };

  return (
    <section aria-label={title} style={{ background: c.raised, borderRadius: 12, padding: 14, color: c.text }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: c.dim, letterSpacing: '.05em' }}>{title.toUpperCase()}</div>
        {v && (
          <span style={{ fontSize: 11.5, fontWeight: 700, color: resultTone(v.result, c), border: `1px solid ${resultTone(v.result, c)}`, borderRadius: 999, padding: '1px 9px' }}>
            {RESULT_LABELS[v.result]}
          </span>
        )}
      </div>

      <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px 14px', margin: 0 }}>
        {metrics.map(([label, value]) => (
          <div key={label}>
            <dt style={{ fontSize: 11, color: c.dim }}>{label}</dt>
            <dd style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{value}</dd>
          </div>
        ))}
      </dl>
      {summary.partial && (
        <p style={{ fontSize: 11.5, color: c.dim, marginTop: 8 }}>
          Counts start {summary.trackedSince ? when(summary.trackedSince) : 'from 14 Sep 2026'}; earlier work on this project isn’t included.
        </p>
      )}
      {(summary.posts || []).length > 0 && (
        <p style={{ fontSize: 11.5, color: c.dim, marginTop: 8 }}>
          Sent to approval: {summary.posts.map((p) => `post #${p.id} (${p.status.replace('_', ' ')})`).join(', ')}
        </p>
      )}

      {v ? (
        <div data-testid="verdict" style={{ marginTop: 12, fontSize: 12.5, borderTop: `1px solid ${c.border}`, paddingTop: 10 }}>
          <strong style={{ color: resultTone(v.result, c) }}>{RESULT_LABELS[v.result]}</strong>
          {v.quality != null && ` · quality ${v.quality}/5`}
          {v.deliveryHours != null && ` · ${v.deliveryHours} delivery hours`}
          <span style={{ color: c.dim }}>
            {' '}— recorded by {v.recordedBy?.name || v.recordedBy?.email}{v.recordedBy?.role ? ` (${v.recordedBy.role})` : ''} · {when(v.at)}
          </span>
          {v.defects && <div style={{ marginTop: 4 }}>Defects: “{v.defects}”</div>}
          {v.notes && <div style={{ marginTop: 2, color: c.dim }}>{v.notes}</div>}
        </div>
      ) : (
        <p style={{ marginTop: 12, fontSize: 12.5, color: c.dim }}>No verdict recorded yet.</p>
      )}

      {!open ? (
        <button type="button" onClick={() => setOpen(true)}
          style={{ marginTop: 10, background: 'transparent', color: c.accent, border: `1px solid ${c.border}`, borderRadius: 8, padding: '5px 12px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
          {v ? 'Update verdict' : 'Record verdict'}
        </button>
      ) : (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <legend style={{ fontSize: 11.5, color: c.dim, marginBottom: 4 }}>Customer’s verdict</legend>
            {Object.entries(RESULT_LABELS).map(([k, label]) => (
              <label key={k} style={{ fontSize: 12.5, display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <input type="radio" name={`result-${kind}-${refId}`} value={k} checked={form.result === k} onChange={set('result')} /> {label}
              </label>
            ))}
          </fieldset>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            <label style={{ fontSize: 11.5, color: c.dim }}>Quality
              <select value={form.quality} onChange={set('quality')} style={{ ...input, marginTop: 4 }}>
                <option value="">Not rated</option>
                {[5, 4, 3, 2, 1].map((q) => <option key={q} value={q}>{q} / 5</option>)}
              </select>
            </label>
            <label style={{ fontSize: 11.5, color: c.dim }}>Delivery hours (human time)
              <input type="number" min={0} max={1000} step={0.5} value={form.deliveryHours} onChange={set('deliveryHours')} style={{ ...input, marginTop: 4 }} />
            </label>
          </div>
          <label style={{ fontSize: 11.5, color: c.dim }}>{needsDefects ? 'What was wrong (required)' : 'Defects (optional)'}
            <textarea rows={2} value={form.defects} onChange={set('defects')} style={{ ...input, marginTop: 4, resize: 'vertical' }} />
          </label>
          <label style={{ fontSize: 11.5, color: c.dim }}>Notes
            <textarea rows={2} value={form.notes} onChange={set('notes')} style={{ ...input, marginTop: 4, resize: 'vertical' }} />
          </label>
          {err && <p role="alert" style={{ fontSize: 12, color: c.red }}>{err}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={save} disabled={saving}
              style={{ background: c.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving…' : 'Save verdict'}
            </button>
            <button type="button" onClick={() => { setOpen(false); setErr(''); }}
              style={{ background: 'transparent', color: c.dim, border: 'none', fontSize: 12.5, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
