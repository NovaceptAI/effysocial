import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, X, Send, Loader2, ArrowRight, AlertTriangle, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Badge, Button } from '../../ui';
import { cn } from '../../lib/cn';

const STARTERS = [
  'How are my campaigns doing?',
  'What should I post this week?',
  'Anything urgent in the inbox?',
  'Why is engagement changing?',
];

const SEV = {
  error: { icon: ShieldAlert, cls: 'text-error', bg: 'bg-error-soft border-error/20' },
  warning: { icon: AlertTriangle, cls: 'text-warning', bg: 'bg-warning-soft border-warning/20' },
  info: { icon: Info, cls: 'text-info', bg: 'bg-info-soft border-info/20' },
};

function Recommendations({ onNavigate }) {
  const { workspace } = useWorkspace();
  const { data: recs = [], isLoading } = useQuery({
    queryKey: ['recs', workspace?.id],
    queryFn: () => effyApi.assistantRecommendations(workspace.id),
    enabled: !!workspace,
  });
  const [dismissed, setDismissed] = useState([]);
  const visible = recs.filter((r) => !dismissed.includes(r.id));

  if (isLoading) return <div className="p-6 text-sm text-ink-soft flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Scanning your workspace…</div>;
  if (!visible.length) return (
    <div className="p-8 text-center text-ink-soft">
      <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
      <p className="text-sm font-semibold text-ink">All clear</p>
      <p className="text-xs text-ink-faint mt-1">No issues detected across campaigns, publishing and inbox.</p>
    </div>
  );

  return (
    <div className="p-3 space-y-2.5 overflow-y-auto">
      {visible.map((r) => {
        const S = SEV[r.severity] || SEV.info;
        return (
          <div key={r.id} className={cn('p-3 rounded-xl border', S.bg)}>
            <div className="flex items-center gap-2">
              <S.icon className={cn('w-4 h-4 shrink-0', S.cls)} />
              <span className="text-sm font-bold text-ink flex-1">{r.title}</span>
              <Badge>{r.agent}</Badge>
            </div>
            <dl className="mt-2 space-y-1 text-xs">
              <div><dt className="inline font-bold text-ink">Detected: </dt><dd className="inline text-ink-soft">{r.detected}</dd></div>
              <div><dt className="inline font-bold text-ink">Why it matters: </dt><dd className="inline text-ink-soft">{r.why}</dd></div>
              <div><dt className="inline font-bold text-ink">Action: </dt><dd className="inline text-ink-soft">{r.action}</dd></div>
              <div><dt className="inline font-bold text-ink">Expected impact: </dt><dd className="inline text-ink-soft">{r.impact}</dd></div>
            </dl>
            <div className="flex items-center gap-2 mt-2.5">
              <Button size="sm" onClick={() => onNavigate(r.route)}>Review <ArrowRight className="w-3 h-3" /></Button>
              <Button size="sm" variant="ghost" onClick={() => setDismissed((d) => [...d, r.id])}>Dismiss</Button>
              <span className="ml-auto text-[0.65rem] text-ink-faint">
                {r.confidence} confidence{r.needsApproval ? ' · needs approval' : ''}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AssistantPanel({ open, onClose }) {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const [tab, setTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, busy]);
  useEffect(() => { setMessages([]); }, [workspace?.id]);

  if (!open) return null;

  const ask = async (text) => {
    const q = (text || input).trim();
    if (!q || busy || !workspace) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setBusy(true);
    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      const d = await effyApi.assistantChat(workspace.id, q, history);
      setMessages((m) => [...m, { role: 'effy', text: d.reply, agent: d.agent, citations: d.citations, actions: d.actions }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'effy', text: e.message || 'Effy is unavailable right now.', error: true }]);
    } finally {
      setBusy(false);
    }
  };

  const go = (route) => { onClose(); navigate(route); };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/20" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-[400px] max-w-[92vw] bg-surface border-l border-line shadow-e3 flex flex-col app-root">
        {/* header */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-line shrink-0">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-aurora text-white"><Sparkles className="w-4 h-4" /></span>
          <div className="flex-1">
            <div className="font-extrabold text-ink text-sm leading-none">Effy AI</div>
            <div className="text-[0.7rem] text-ink-faint mt-0.5">{workspace?.name}</div>
          </div>
          <button onClick={onClose} className="grid place-items-center w-8 h-8 rounded-lg hover:bg-surface2 text-ink-soft"><X className="w-4 h-4" /></button>
        </div>

        {/* tabs */}
        <div className="flex border-b border-line shrink-0">
          {[['chat', 'Chat'], ['recs', 'Recommendations']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={cn('flex-1 py-2.5 text-sm font-bold border-b-2 -mb-px transition',
                tab === id ? 'border-coral text-coral-ink' : 'border-transparent text-ink-soft')}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'recs' ? (
          <Recommendations onNavigate={go} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {!messages.length && (
                <div className="pt-6">
                  <p className="text-sm text-ink-soft mb-3">Ask about your campaigns, content, inbox or numbers — I answer from this workspace's live data.</p>
                  <div className="space-y-1.5">
                    {STARTERS.map((s) => (
                      <button key={s} onClick={() => ask(s)} className="block w-full text-left text-sm px-3 py-2 rounded-lg border border-line text-ink-soft hover:border-coral hover:text-coral-ink transition">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={cn('max-w-[88%]', m.role === 'user' ? 'ml-auto' : '')}>
                  <div className={cn('p-3 rounded-xl text-sm whitespace-pre-wrap',
                    m.role === 'user' ? 'bg-coral text-white' : m.error ? 'bg-error-soft text-error' : 'bg-surface2 text-ink')}>
                    {m.text}
                  </div>
                  {m.role === 'effy' && !m.error && (
                    <div className="mt-1.5 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1">
                        {m.agent && <Badge tone="coral">{m.agent} agent</Badge>}
                        {m.citations?.slice(0, 3).map((c) => <span key={c} className="text-[0.62rem] text-ink-faint bg-surface2 border border-line rounded-full px-1.5 py-0.5">{c}</span>)}
                      </div>
                      {m.actions?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {m.actions.map((a) => (
                            <button key={a.route} onClick={() => go(a.route)} className="text-xs font-bold text-coral-ink border border-coral/30 rounded-full px-2.5 py-1 hover:bg-coral-soft transition">
                              {a.label} →
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {busy && <div className="flex items-center gap-2 text-sm text-ink-faint"><Loader2 className="w-4 h-4 animate-spin" /> Effy is thinking…</div>}
              <div ref={endRef} />
            </div>

            <div className="p-3 border-t border-line shrink-0 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && ask()}
                placeholder="Ask Effy anything…"
                className="flex-1 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm focus:border-coral focus:ring-2 focus:ring-coral/30 outline-none"
              />
              <Button onClick={() => ask()} disabled={busy || !input.trim()}><Send className="w-4 h-4" /></Button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
