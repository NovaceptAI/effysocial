import React from 'react';
import { RefreshCw, Wrench, Plug, Check, AlertTriangle } from 'lucide-react';
import { INTEGRATIONS } from '../data/sampleData';
import { Card, PageHeader, Button, Badge } from '../../ui';
import { cn } from '../../lib/cn';

const STATE = {
  connected: { tone: 'success', label: 'Connected', dot: 'bg-success' },
  partial: { tone: 'warning', label: 'Limited access', dot: 'bg-warning' },
  expired: { tone: 'error', label: 'Permission expired', dot: 'bg-error' },
  available: { tone: 'default', label: 'Not connected', dot: 'bg-line' },
};

export default function Integrations() {
  const categories = [...new Set(INTEGRATIONS.map((i) => i.category))];
  const connectedCount = INTEGRATIONS.filter((i) => i.state === 'connected').length;
  const needAttention = INTEGRATIONS.filter((i) => i.state === 'expired' || i.state === 'partial').length;

  return (
    <div>
      <PageHeader title="Integrations" subtitle={`${connectedCount} connected · ${needAttention} need attention`} />

      {needAttention > 0 && (
        <Card className="p-3.5 mb-5 bg-warning-soft border-warning/20 flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
          <span className="text-sm text-ink-soft">{needAttention} connection(s) need attention — reconnect to avoid failed publishing and missing data.</span>
        </Card>
      )}

      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-2.5">{cat}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {INTEGRATIONS.filter((i) => i.category === cat).map((it) => {
                const s = STATE[it.state];
                return (
                  <Card key={it.name} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="grid place-items-center w-9 h-9 rounded-lg bg-surface2 text-ink-soft"><Plug className="w-[18px] h-[18px]" /></span>
                        <div>
                          <div className="font-bold text-ink text-sm">{it.name}</div>
                          <div className="text-xs text-ink-faint">{it.account || '—'}</div>
                        </div>
                      </div>
                      <span className={cn('w-2 h-2 rounded-full mt-1.5', s.dot)} />
                    </div>

                    <div className="flex items-center justify-between text-xs mb-3">
                      <Badge tone={s.tone}>{s.label}</Badge>
                      {it.lastSync && <span className="text-ink-faint">Synced {it.lastSync}</span>}
                    </div>

                    <div className="flex gap-1.5">
                      {it.state === 'available' ? (
                        <Button size="sm" className="flex-1">Connect</Button>
                      ) : it.state === 'expired' ? (
                        <Button size="sm" className="flex-1"><RefreshCw className="w-3.5 h-3.5" /> Reconnect</Button>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost"><Wrench className="w-3.5 h-3.5" /> Troubleshoot</Button>
                          <Button size="sm" variant="ghost" className="text-error">Disconnect</Button>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
