import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserPlus, ShieldCheck, Mail } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { Card, PageHeader, Button, Badge } from '../../ui';

// REAL org members from effy_memberships. Invites ship with email domain live.
export default function Team() {
  const { org } = useWorkspace();
  const { data: members = [], isLoading } = useQuery({ queryKey: ['team'], queryFn: effyApi.listTeam });

  return (
    <div>
      <PageHeader
        title="Team"
        subtitle={`People with access to ${org?.name || 'your organisation'}`}
        actions={<Button disabled title="Invites unlock once your email domain is verified"><UserPlus className="w-4 h-4" /> Invite member</Button>}
      />
      <Card className="overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-sm text-ink-soft">Loading members…</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-ink-faint border-b border-line">{['Member', 'Role', 'Status', 'Joined'].map((h) => <th key={h} className="font-semibold px-5 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-line/70 last:border-0">
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-ink">{m.name || m.email.split('@')[0]}</span>
                    <span className="block text-xs text-ink-faint">{m.email}</span>
                  </td>
                  <td className="px-5 py-3.5"><Badge tone="new"><ShieldCheck className="w-3 h-3" /> {m.role}</Badge></td>
                  <td className="px-5 py-3.5">
                    <Badge tone={m.verified ? 'success' : 'warning'}>{m.verified ? 'verified' : 'unverified'}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-ink-faint tabular-nums">{m.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      <p className="text-xs text-ink-faint mt-3 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email invites for teammates and client approvers arrive once the sending domain is verified.</p>
    </div>
  );
}
