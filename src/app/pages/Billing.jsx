import React from 'react';
import { CreditCard, Download, Sparkles } from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { Card, PageHeader, Button, Badge, Pacing } from '../../ui';

const USAGE = [
  { label: 'AI credits', used: 6420, limit: 10000 },
  { label: 'Published posts', used: 84, limit: 200 },
  { label: 'Client workspaces', used: 6, limit: 10 },
  { label: 'Team seats', used: 5, limit: 8 },
];

const INVOICES = [
  { id: 'INV-2026-06', period: 'June 2026', amount: 24999, status: 'paid' },
  { id: 'INV-2026-05', period: 'May 2026', amount: 24999, status: 'paid' },
  { id: 'INV-2026-04', period: 'April 2026', amount: 19999, status: 'paid' },
];

export default function Billing() {
  const { org } = useWorkspace();

  return (
    <div>
      <PageHeader title="Billing" subtitle="Plan, usage and invoices" actions={<Button variant="spark"><Sparkles className="w-4 h-4" /> Upgrade</Button>} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5">
          <div className="text-xs font-bold uppercase tracking-wide text-ink-faint mb-1">Current plan</div>
          <div className="text-2xl font-extrabold text-ink">{org.plan || 'Agency Growth'}</div>
          <div className="text-sm text-ink-soft mt-1">₹24,999 / month · billed monthly</div>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-line text-sm text-ink-soft">
            <CreditCard className="w-4 h-4" /> Visa ending 4421 <Button size="sm" variant="ghost" className="ml-auto">Change</Button>
          </div>
        </Card>
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-bold text-ink mb-4">Usage this month</h3>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            {USAGE.map((u) => (
              <div key={u.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-ink">{u.label}</span>
                  <span className="tabular-nums text-ink-soft">{num(u.used)} / {num(u.limit)}</span>
                </div>
                <Pacing value={u.used} max={u.limit} tone={u.used / u.limit > 0.85 ? 'warning' : 'coral'} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-ink-faint border-b border-line">{['Invoice', 'Period', 'Amount', 'Status', ''].map((h) => <th key={h} className="font-semibold px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {INVOICES.map((i) => (
              <tr key={i.id} className="border-b border-line/70 last:border-0">
                <td className="px-4 py-3 font-semibold text-ink">{i.id}</td>
                <td className="px-4 py-3 text-ink-soft">{i.period}</td>
                <td className="px-4 py-3 tabular-nums">{inr(i.amount, { compact: false })}</td>
                <td className="px-4 py-3"><Badge tone="success">{i.status}</Badge></td>
                <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost"><Download className="w-3.5 h-3.5" /> PDF</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
