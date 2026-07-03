import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { UserPlus, MessageSquare, Lightbulb } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { listening } from '../data/strategyData';
import { Card, PageHeader, Badge, Button } from '../../ui';
import { ChannelIcon } from '../components/parts';
import { cn } from '../../lib/cn';

const SENT = { positive: 'text-success', neutral: 'text-ink-faint', negative: 'text-error' };
const INTENT = { purchase: 'info', complaint: 'error', advocacy: 'success' };

export default function SocialListening() {
  const { workspace } = useWorkspace();
  const l = listening(workspace);
  const total = l.stats.positive + l.stats.neutral + l.stats.negative;

  return (
    <div>
      <PageHeader title="Social Listening" subtitle={`Mentions, sentiment and intent for ${workspace.name}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5">
          <h3 className="font-bold text-ink mb-3 text-sm">Sentiment</h3>
          <div className="flex h-4 rounded-full overflow-hidden mb-2">
            <div className="bg-success" style={{ width: `${(l.stats.positive / total) * 100}%` }} />
            <div className="bg-ink-faint" style={{ width: `${(l.stats.neutral / total) * 100}%` }} />
            <div className="bg-error" style={{ width: `${(l.stats.negative / total) * 100}%` }} />
          </div>
          <div className="flex justify-between text-xs text-ink-soft"><span className="text-success">{l.stats.positive}% pos</span><span>{l.stats.neutral}% neu</span><span className="text-error">{l.stats.negative}% neg</span></div>
        </Card>
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-bold text-ink mb-2 text-sm">Sentiment trend</h3>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={l.sentimentSeries} margin={{ left: -30, right: 4, top: 4 }}>
              <CartesianGrid stroke="#ece2d6" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#a89d93' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #ece2d6', fontSize: 12 }} />
              <Area type="monotone" dataKey="positive" stroke="#0e9f6e" fill="#0e9f6e" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="negative" stroke="#e5484d" fill="#e5484d" fillOpacity={0.12} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-bold text-ink mb-3">Live mentions</h3>
          <div className="space-y-2.5">
            {l.mentions.map((m, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-line">
                <ChannelIcon channel={m.source} className="w-7 h-7 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink text-sm">{m.author}</span>
                    <span className={cn('text-xs', SENT[m.sentiment])}>● {m.sentiment}</span>
                    <Badge tone={INTENT[m.intent]}>{m.intent}</Badge>
                    <span className="text-xs text-ink-faint ml-auto">{m.time}</span>
                  </div>
                  <p className="text-sm text-ink-soft mt-0.5">{m.text}</p>
                  <div className="flex gap-1.5 mt-1.5">
                    <Button size="sm" variant="ghost"><MessageSquare className="w-3.5 h-3.5" /> Respond</Button>
                    {m.intent === 'purchase' && <Button size="sm" variant="ghost"><UserPlus className="w-3.5 h-3.5" /> Convert to lead</Button>}
                    <Button size="sm" variant="ghost"><Lightbulb className="w-3.5 h-3.5" /> Idea</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5 h-max">
          <h3 className="font-bold text-ink mb-3 text-sm">Top keywords</h3>
          <div className="flex flex-wrap gap-1.5">{l.keywords.map((k) => <Badge key={k}>{k}</Badge>)}</div>
        </Card>
      </div>
    </div>
  );
}
