import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Plug, AlertTriangle, Check, KeyRound, Loader2, X } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { useInvalidatingMutation } from '../api/hooks';
import { Card, PageHeader, Button, Badge } from '../../ui';
import { cn } from '../../lib/cn';

const STATE = {
  connected: { tone: 'success', label: 'Connected', dot: 'bg-success' },
  available: { tone: 'default', label: 'Ready to connect', dot: 'bg-info' },
  pending_credentials: { tone: 'warning', label: 'Setup required', dot: 'bg-warning' },
  expired: { tone: 'error', label: 'Permission expired', dot: 'bg-error' },
  disconnected: { tone: 'default', label: 'Disconnected', dot: 'bg-line' },
  oauth_ready: { tone: 'info', label: 'Credentials detected', dot: 'bg-info' },
};

const BANNER = {
  success: { tone: 'success', text: 'Connected successfully.' },
  denied: { tone: 'warning', text: 'Authorization was cancelled.' },
  invalid_state: { tone: 'error', text: 'The connection request expired — please try again.' },
  exchange_failed: { tone: 'error', text: 'Could not complete the connection. Please retry.' },
};

export default function Integrations() {
  const { workspace } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const [setup, setSetup] = useState(null); // {provider, steps[]}
  const [busy, setBusy] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['integrations', workspace?.id],
    queryFn: () => effyApi.listIntegrations(workspace.id),
    enabled: !!workspace,
  });
  const disconnect = useInvalidatingMutation(
    (provider) => effyApi.disconnectIntegration(provider, workspace.id),
    () => ['integrations', workspace?.id],
  );

  // OAuth callback returns here with ?connected=<provider>&status=<...>
  const cbStatus = params.get('status');
  const cbProvider = params.get('connected');
  useEffect(() => {
    if (cbStatus) {
      const t = setTimeout(() => { params.delete('status'); params.delete('connected'); setParams(params, { replace: true }); }, 6000);
      return () => clearTimeout(t);
    }
  }, [cbStatus]); // eslint-disable-line

  const connect = async (provider) => {
    setBusy(provider);
    try {
      const r = await effyApi.connectIntegration(provider, workspace.id);
      if (r.state === 'redirect' && r.redirect) {
        window.location.href = r.redirect; // real OAuth handoff
      } else if (r.state === 'pending_credentials') {
        setSetup({ provider, steps: r.setup || [] });
      }
    } finally {
      setBusy(null);
    }
  };

  const categories = [...new Set(items.map((i) => i.category))];
  const connectedCount = items.filter((i) => i.state === 'connected').length;
  const needAttention = items.filter((i) => ['expired', 'pending_credentials'].includes(i.state)).length;

  return (
    <div>
      <PageHeader title="Integrations" subtitle={isLoading ? 'Loading…' : `${connectedCount} connected · ${needAttention} need setup`} />

      {cbStatus && BANNER[cbStatus] && (
        <Card className={cn('p-3.5 mb-5 flex items-center gap-2.5',
          BANNER[cbStatus].tone === 'success' ? 'bg-success-soft border-success/20' :
          BANNER[cbStatus].tone === 'error' ? 'bg-error-soft border-error/20' : 'bg-warning-soft border-warning/20')}>
          {BANNER[cbStatus].tone === 'success' ? <Check className="w-4 h-4 text-success" /> : <AlertTriangle className="w-4 h-4 text-warning" />}
          <span className="text-sm text-ink-soft"><strong className="capitalize">{cbProvider?.replace('_', ' ')}</strong> — {BANNER[cbStatus].text}</span>
        </Card>
      )}

      {isLoading ? (
        <Card className="p-10 flex items-center justify-center gap-2 text-ink-soft"><Loader2 className="w-4 h-4 animate-spin" /> Loading integrations…</Card>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-2.5">{cat}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {items.filter((i) => i.category === cat).map((it) => {
                  const s = STATE[it.state] || STATE.disconnected;
                  const isConnected = it.state === 'connected';
                  return (
                    <Card key={it.provider} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="grid place-items-center w-9 h-9 rounded-lg bg-surface2 text-ink-soft"><Plug className="w-[18px] h-[18px]" /></span>
                          <div>
                            <div className="font-bold text-ink text-sm">{it.label}</div>
                            <div className="text-xs text-ink-faint">{it.account || (isConnected ? 'Connected' : '—')}</div>
                          </div>
                        </div>
                        <span className={cn('w-2 h-2 rounded-full mt-1.5', s.dot)} />
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge tone={s.tone}>{s.label}</Badge>
                        {isConnected ? (
                          <Button size="sm" variant="ghost" onClick={() => disconnect.mutate(it.provider)} disabled={disconnect.isPending}>
                            <X className="w-3.5 h-3.5" /> Disconnect
                          </Button>
                        ) : it.state === 'pending_credentials' ? (
                          <Button size="sm" variant="secondary" onClick={() => connect(it.provider)}>
                            <KeyRound className="w-3.5 h-3.5" /> Setup steps
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => connect(it.provider)} disabled={busy === it.provider}>
                            {busy === it.provider ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Connect'}
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {setup && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={() => setSetup(null)}>
          <Card className="max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-ink flex items-center gap-2"><KeyRound className="w-4 h-4 text-warning" /> Setup required</h3>
              <button onClick={() => setSetup(null)} className="text-ink-faint hover:text-ink"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-ink-soft mb-4">Before this integration can connect, the platform needs API credentials configured server-side:</p>
            <ol className="space-y-2.5">
              {setup.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-ink-soft">
                  <span className="grid place-items-center w-5 h-5 rounded-full bg-surface2 text-xs font-bold shrink-0">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <div className="mt-5 flex justify-end"><Button onClick={() => setSetup(null)}>Got it</Button></div>
          </Card>
        </div>
      )}
    </div>
  );
}
