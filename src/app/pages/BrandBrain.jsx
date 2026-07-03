import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Globe, Upload, Sparkles, FileText, PenLine, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { SECTIONS } from '../data/brandBrain';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge, Pacing, EmptyState } from '../../ui';
import { cn } from '../../lib/cn';

const STATUS = {
  good: { dot: 'bg-success', label: null },
  review: { dot: 'bg-warning', label: 'Needs review' },
  empty: { dot: 'bg-line', label: 'Empty' },
};
const SRC_ICON = { website: Globe, document: FileText, manual: PenLine };

function SourceChips({ sources }) {
  if (!sources?.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-3">
      <span className="text-xs text-ink-faint">Sources:</span>
      {sources.map((s) => <span key={s} className="text-[0.7rem] font-semibold bg-surface2 border border-line rounded-full px-2 py-0.5 text-ink-soft">{s}</span>)}
    </div>
  );
}

function SectionBody({ section, content }) {
  const { kind } = section;
  const d = content.data;

  if (kind === 'paragraph') return <p className="text-sm text-ink-soft leading-relaxed">{d}</p>;

  if (kind === 'chips') {
    const tone = section.id === 'prohibited' ? 'error' : section.id === 'approved' ? 'success' : 'default';
    return (
      <div className="flex flex-wrap gap-2">
        {d.map((w) => <Badge key={w} tone={tone}>{w}</Badge>)}
        <button className="text-xs font-semibold text-coral-ink border border-dashed border-line rounded-full px-2.5 py-1 hover:border-coral">+ add</button>
      </div>
    );
  }

  if (kind === 'list') {
    return (
      <div className="space-y-2.5">
        {d.map((it) => (
          <div key={it.title} className="p-3 rounded-lg border border-line">
            <div className="font-semibold text-ink text-sm">{it.title}</div>
            <div className="text-sm text-ink-soft mt-0.5">{it.desc}</div>
          </div>
        ))}
      </div>
    );
  }

  if (kind === 'personas') {
    return (
      <div className="grid sm:grid-cols-2 gap-3">
        {d.map((p) => (
          <div key={p.name} className="p-4 rounded-lg border border-line">
            <div className="flex items-center justify-between"><span className="font-bold text-ink">{p.name}</span><Badge>{p.age}</Badge></div>
            <p className="text-sm text-ink-soft mt-1.5">{p.motivation}</p>
          </div>
        ))}
      </div>
    );
  }

  if (kind === 'faqs') {
    return (
      <div className="space-y-2.5">
        {d.map((f) => (
          <div key={f.q} className="p-3 rounded-lg border border-line">
            <div className="font-semibold text-ink text-sm">{f.q}</div>
            <div className="text-sm text-ink-soft mt-1">{f.a}</div>
          </div>
        ))}
      </div>
    );
  }

  if (kind === 'visual') {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {d.colors.map((c) => (
            <div key={c.name} className="text-center">
              <div className="w-16 h-16 rounded-xl border border-line" style={{ background: c.hex }} />
              <div className="text-xs font-semibold mt-1">{c.name}</div>
              <div className="text-[0.7rem] text-ink-faint">{c.hex}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-4">
          {d.fonts.map((f) => <div key={f.role} className="text-sm"><span className="text-ink-faint">{f.role}: </span><span className="font-bold">{f.name}</span></div>)}
        </div>
      </div>
    );
  }

  if (kind === 'sources') {
    return (
      <div className="space-y-2">
        {d.map((s) => {
          const Icon = SRC_ICON[s.type] || FileText;
          return (
            <div key={s.name} className="flex items-center gap-3 p-3 rounded-lg border border-line">
              <span className="grid place-items-center w-9 h-9 rounded-lg bg-surface2 text-ink-soft"><Icon className="w-[18px] h-[18px]" /></span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-ink truncate">{s.name}</span>
                <span className="block text-xs text-ink-faint capitalize">{s.type} · updated {s.date}</span>
              </span>
              <Badge tone={s.freshness === 'fresh' ? 'success' : 'warning'}>{s.freshness}</Badge>
              <div className="w-24 hidden sm:block">
                <div className="text-[0.7rem] text-ink-faint mb-0.5">confidence {s.confidence}%</div>
                <Pacing value={s.confidence} max={100} tone={s.confidence > 80 ? 'success' : 'warning'} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
}

export default function BrandBrain() {
  const { workspace } = useWorkspace();
  const [active, setActive] = useState('summary');
  const [testOpen, setTestOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState(null);
  const [testing, setTesting] = useState(false);

  const { data: brain, isLoading, isError } = useQuery({
    queryKey: ['brand', workspace?.id],
    queryFn: () => effyApi.getBrand(workspace.id),
    enabled: !!workspace,
  });

  const runTest = async () => {
    if (!prompt.trim()) return;
    setTesting(true); setOutput(null);
    try {
      const { output: text, cited } = await effyApi.testBrandVoice(workspace.id, prompt);
      setOutput({ text, cited });
    } catch (e) {
      setOutput({ text: e.message || 'Generation failed.', error: true });
    } finally {
      setTesting(false);
    }
  };

  if (isLoading) {
    return (<><PageHeader title="Brand Brain" /><Card className="p-10 flex items-center justify-center gap-2 text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Loading Brand Brain…</Card></>);
  }
  if (isError || !brain) {
    return (<><PageHeader title="Brand Brain" /><EmptyState icon="⚠️" title="Couldn't load Brand Brain" body="Please refresh." /></>);
  }

  const section = SECTIONS.find((s) => s.id === active);
  const content = brain[active];

  return (
    <div>
      <PageHeader
        title="Brand Brain"
        subtitle={`${workspace.name}'s living knowledge centre — every AI output draws from here`}
        actions={
          <>
            <Button variant="secondary"><Globe className="w-4 h-4" /> Import website</Button>
            <Button variant="secondary"><Upload className="w-4 h-4" /> Upload</Button>
            <Button variant="spark" onClick={() => setTestOpen((v) => !v)}><Sparkles className="w-4 h-4" /> Test brand voice</Button>
          </>
        }
      />

      {/* Health strip */}
      <Card className="p-4 mb-5 flex flex-wrap items-center gap-6">
        <div className="flex-1 min-w-[180px]">
          <div className="flex items-center justify-between text-sm mb-1"><span className="font-semibold text-ink">Completeness</span><span className="tabular-nums text-ink-soft">{brain.completeness}%</span></div>
          <Pacing value={brain.completeness} max={100} />
        </div>
        <div className="flex items-center gap-2 text-sm"><AlertCircle className="w-4 h-4 text-warning" /><span className="text-ink-soft">{brain.needsReview} items need review</span></div>
        <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-success" /><span className="text-ink-soft">Updated {brain.lastUpdated}</span></div>
      </Card>

      {/* Test voice panel */}
      {testOpen && (
        <Card className="p-5 mb-5 bg-coral-soft/40 border-coral-soft">
          <h3 className="font-bold text-ink mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-coral-ink" /> Test brand voice</h3>
          <p className="text-sm text-ink-soft mb-3">Type a prompt to see how EffySocial writes for {workspace.name} using this Brand Brain.</p>
          <div className="flex gap-2">
            <input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runTest()}
              className="flex-1 rounded-sm border border-line px-3 py-2 text-sm bg-surface" placeholder="e.g. Write a monsoon offer caption for Instagram" />
            <Button onClick={runTest} disabled={testing}>{testing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}</Button>
          </div>
          <div className="mt-3 p-3 rounded-lg bg-surface border border-line text-sm text-ink-soft min-h-[52px]">
            {output ? (
              <>
                <p className={cn('whitespace-pre-wrap', output.error && 'text-error')}>{output.text}</p>
                {output.cited && <p className="text-xs text-ink-faint mt-2">Grounded in Brand Brain: {output.cited.join(', ')}</p>}
              </>
            ) : (
              <em>Sample output will appear here, citing which Brand Brain pieces (tone, approved words) shaped it.</em>
            )}
          </div>
        </Card>
      )}

      {/* Two-column: section nav + content */}
      <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-5">
        <Card className="p-2 h-max lg:sticky lg:top-20">
          <ul className="space-y-0.5">
            {SECTIONS.map((s) => {
              const st = STATUS[brain[s.id]?.status || 'empty'];
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setActive(s.id)}
                    className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition text-left',
                      active === s.id ? 'bg-coral-soft text-coral-ink' : 'text-ink-soft hover:bg-surface2')}
                  >
                    <span className={cn('w-2 h-2 rounded-full shrink-0', st.dot)} />
                    <span className="flex-1 truncate">{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-ink">{section.label}</h2>
            <div className="flex items-center gap-2">
              {STATUS[content.status].label && <Badge tone="warning">{STATUS[content.status].label}</Badge>}
              <Button size="sm" variant="ghost"><PenLine className="w-3.5 h-3.5" /> Edit</Button>
            </div>
          </div>
          <SectionBody section={section} content={content} />
          <SourceChips sources={content.sources} />
        </Card>
      </div>
    </div>
  );
}
