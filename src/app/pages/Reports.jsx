import React, { useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { Plus, FileText, Sparkles, Download, Share2, Check, Palette } from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { savedReports, REPORT_TEMPLATES, REPORT_SECTIONS, overviewMetrics, trendSeries } from '../data/sampleData';
import { Card, PageHeader, Button, Badge, Tabs } from '../../ui';
import { cn } from '../../lib/cn';

const STATUS_TONE = { shared: 'success', scheduled: 'info', draft: 'default' };

function ReportPreview({ sections, whiteLabel }) {
  const { org, workspace } = useWorkspace();
  const m = overviewMetrics(workspace);
  const series = trendSeries(workspace);
  return (
    <Card className="p-0 overflow-hidden">
      {/* white-label header */}
      <div className={cn('p-5 flex items-center justify-between', whiteLabel ? 'bg-rail text-white' : 'bg-aurora text-white')}>
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-white/15 text-base">{whiteLabel ? '◆' : '✦'}</span>
          <div>
            <div className="font-extrabold">{whiteLabel ? org.name : 'EffySocial'}</div>
            <div className="text-xs opacity-80">{workspace.name} · June 2026</div>
          </div>
        </div>
        <span className="text-xs opacity-80">Performance Report</span>
      </div>

      <div className="p-5 space-y-5">
        {sections.summary && (
          <div className="p-3 rounded-lg bg-coral-soft/50 border border-coral-soft">
            <div className="flex items-center gap-1.5 mb-1"><Sparkles className="w-4 h-4 text-coral-ink" /><span className="font-bold text-ink text-sm">AI summary</span></div>
            <p className="text-sm text-ink-soft leading-relaxed">{workspace.name} had a strong month: leads grew 22% and attributed revenue reached {inr(m.revenue)} at a {m.roas}× return. Organic engagement held at 5.4%. Recommended next step: scale the best-performing carousel format and shift budget toward high-intent retargeting.</p>
          </div>
        )}

        {sections.organic && (
          <div>
            <h4 className="font-bold text-ink text-sm mb-2">Organic & revenue trend</h4>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={series} margin={{ left: -20, right: 8 }}>
                <defs><linearGradient id="rep" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff6b5e" stopOpacity={0.35} /><stop offset="100%" stopColor="#ff6b5e" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="#ece2d6" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#a89d93' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #ece2d6', fontSize: 13 }} formatter={(v) => inr(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#ff6b5e" strokeWidth={2.5} fill="url(#rep)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sections.leads && <Stat label="Leads" value={num(m.leads)} />}
          {sections.leads && <Stat label="Qualified" value={num(m.qualified)} />}
          {sections.revenue && <Stat label="Revenue" value={inr(m.revenue)} />}
          {sections.revenue && <Stat label="ROAS" value={`${m.roas}×`} />}
        </div>

        {sections.summary && (
          <div>
            <h4 className="font-bold text-ink text-sm mb-2">Recommended next actions</h4>
            <ul className="space-y-1.5">
              {['Scale the carousel format that drove the highest saves.', 'Shift 15% ad budget to high-intent retargeting.', 'Fill 3 calendar gaps next week on Instagram.'].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-ink-soft"><Check className="w-4 h-4 text-success shrink-0 mt-0.5" /> {t}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
function Stat({ label, value }) {
  return <div className="p-3 rounded-lg bg-surface2/60 text-center"><div className="text-lg font-extrabold tabular-nums text-ink">{value}</div><div className="text-[0.7rem] text-ink-faint">{label}</div></div>;
}

export default function Reports() {
  const { workspace } = useWorkspace();
  const reports = savedReports(workspace);
  const [tab, setTab] = useState('saved');
  const [sections, setSections] = useState(Object.fromEntries(REPORT_SECTIONS.map((s) => [s.id, s.on])));
  const [whiteLabel, setWhiteLabel] = useState(true);

  return (
    <div>
      <PageHeader title="Reports" subtitle="Client-ready summaries with AI commentary and white-labelling."
        actions={<Button onClick={() => setTab('build')}><Plus className="w-4 h-4" /> New report</Button>} />

      <Tabs tabs={[{ id: 'saved', label: 'Saved' }, { id: 'build', label: 'Build' }]} active={tab} onChange={setTab} />

      {tab === 'saved' ? (
        <>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {REPORT_TEMPLATES.map((t) => (
              <button key={t} onClick={() => setTab('build')} className="text-xs font-semibold px-2.5 py-1.5 rounded-full border border-line text-ink-soft hover:border-coral hover:text-coral-ink">+ {t}</button>
            ))}
          </div>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-ink-faint border-b border-line">{['Report', 'Type', 'Period', 'Status', 'Generated', ''].map((h) => <th key={h} className="font-semibold px-4 py-3">{h}</th>)}</tr></thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-b border-line/70 last:border-0 hover:bg-surface2/60">
                    <td className="px-4 py-3"><span className="flex items-center gap-2 font-semibold text-ink"><FileText className="w-4 h-4 text-ink-faint" /> {r.name}</span></td>
                    <td className="px-4 py-3 text-ink-soft">{r.type}</td>
                    <td className="px-4 py-3 text-ink-soft">{r.period}</td>
                    <td className="px-4 py-3"><Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge></td>
                    <td className="px-4 py-3 text-ink-faint tabular-nums">{r.generated}</td>
                    <td className="px-4 py-3"><div className="flex gap-1.5"><Button size="sm" variant="ghost"><Download className="w-3.5 h-3.5" /></Button><Button size="sm" variant="ghost"><Share2 className="w-3.5 h-3.5" /></Button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
          {/* builder controls */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-bold text-ink text-sm mb-3">Sections</h3>
              <ul className="space-y-1.5">
                {REPORT_SECTIONS.map((s) => (
                  <li key={s.id}>
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input type="checkbox" checked={!!sections[s.id]} onChange={() => setSections((p) => ({ ...p, [s.id]: !p[s.id] }))} className="accent-coral w-4 h-4" />
                      {s.label}
                    </label>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-4">
              <h3 className="font-bold text-ink text-sm mb-3">Settings</h3>
              <label className="flex items-center gap-2.5 text-sm cursor-pointer mb-3">
                <input type="checkbox" checked={whiteLabel} onChange={() => setWhiteLabel((v) => !v)} className="accent-coral w-4 h-4" />
                <span className="flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" /> White-label (agency brand)</span>
              </label>
              <Button variant="spark" className="w-full mb-2"><Sparkles className="w-4 h-4" /> Regenerate AI summary</Button>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1"><Download className="w-3.5 h-3.5" /> PDF</Button>
                <Button variant="secondary" size="sm" className="flex-1"><Share2 className="w-3.5 h-3.5" /> Share</Button>
              </div>
            </Card>
          </div>
          {/* live preview */}
          <ReportPreview sections={sections} whiteLabel={whiteLabel} />
        </div>
      )}
    </div>
  );
}
