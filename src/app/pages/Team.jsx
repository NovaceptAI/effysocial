import React from 'react';
import { UserPlus } from 'lucide-react';
import { TEAM, ROLES } from '../data/sampleData';
import { Card, PageHeader, Button, Badge } from '../../ui';

export default function Team() {
  return (
    <div>
      <PageHeader title="Team & permissions" subtitle={`${TEAM.length} members · roles by workspace and feature`}
        actions={<Button><UserPlus className="w-4 h-4" /> Invite member</Button>} />

      <Card className="overflow-hidden mb-5">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-ink-faint border-b border-line">{['Member', 'Role', 'Workspaces', 'Status', 'Last active', ''].map((h) => <th key={h} className="font-semibold px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {TEAM.map((m) => (
              <tr key={m.email} className="border-b border-line/70 last:border-0 hover:bg-surface2/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid place-items-center w-8 h-8 rounded-full bg-ink text-white text-xs font-bold">{m.avatar}</span>
                    <div><div className="font-semibold text-ink">{m.name}</div><div className="text-xs text-ink-faint">{m.email}</div></div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select defaultValue={m.role} className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm">
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-ink-soft">{m.workspaces === 'All' ? <Badge tone="info">All</Badge> : `${m.workspaces} workspaces`}</td>
                <td className="px-4 py-3">{m.status === 'active' ? <Badge tone="success">Active</Badge> : <Badge tone="warning">Invited</Badge>}</td>
                <td className="px-4 py-3 text-ink-faint">{m.lastActive}</td>
                <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost">Manage</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-ink mb-1">Roles</h3>
        <p className="text-sm text-ink-soft mb-3">Permissions apply per workspace and per feature.</p>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => <Badge key={r}>{r}</Badge>)}
        </div>
      </Card>
    </div>
  );
}
