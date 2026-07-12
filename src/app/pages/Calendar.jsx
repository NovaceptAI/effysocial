import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Plus } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { usePosts } from '../api/hooks';
import { Card, PageHeader, Button, Tabs } from '../../ui';
import { ChannelDot, PostStatus } from '../components/parts';
import { cn } from '../../lib/cn';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n) => String(n).padStart(2, '0');
const ymd = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
// Real current date (local) — was a hardcoded sample date before.
const now = new Date();
const TODAY = ymd(now.getFullYear(), now.getMonth(), now.getDate());

const STATUS_BAR = {
  published: 'bg-success', scheduled: 'bg-info', approved: 'bg-success',
  internal_review: 'bg-warning', client_review: 'bg-warning', draft: 'bg-ink-faint', idea: 'bg-ink-faint', failed: 'bg-error',
};

function monthGrid(y, m) {
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(ymd(y, m, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

export default function Calendar() {
  const { workspace } = useWorkspace();
  const { data: posts = [] } = usePosts(workspace);
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [view, setView] = useState('month');

  const byDate = useMemo(() => {
    const map = {};
    posts.forEach((p) => { (map[p.date] ||= []).push(p); });
    return map;
  }, [posts]);

  const cells = monthGrid(cursor.y, cursor.m);
  const move = (dir) => setCursor((c) => {
    let m = c.m + dir, y = c.y;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    return { y, m };
  });

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Plan and schedule content across every channel."
        actions={<><Button variant="secondary"><Sparkles className="w-4 h-4" /> Fill gaps</Button><Button><Plus className="w-4 h-4" /> New post</Button></>}
      />

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => move(-1)} className="grid place-items-center w-8 h-8 rounded-lg hover:bg-surface2"><ChevronLeft className="w-4 h-4" /></button>
            <h2 className="text-lg font-bold text-ink w-44 text-center">{MONTHS[cursor.m]} {cursor.y}</h2>
            <button onClick={() => move(1)} className="grid place-items-center w-8 h-8 rounded-lg hover:bg-surface2"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <Tabs tabs={[{ id: 'month', label: 'Month' }, { id: 'list', label: 'List' }]} active={view} onChange={setView} />
        </div>

        {view === 'month' ? (
          <div className="grid grid-cols-7 gap-px bg-line rounded-lg overflow-hidden border border-line">
            {DOW.map((d) => <div key={d} className="bg-surface2 text-center py-2 text-xs font-bold text-ink-faint">{d}</div>)}
            {cells.map((date, i) => {
              const items = date ? (byDate[date] || []) : [];
              const isToday = date === TODAY;
              return (
                <div key={i} className={cn('bg-surface min-h-[104px] p-1.5', !date && 'bg-surface2/40')}>
                  {date && (
                    <>
                      <div className={cn('text-xs font-semibold mb-1 w-6 h-6 grid place-items-center rounded-full', isToday ? 'bg-coral text-white' : 'text-ink-soft')}>{Number(date.slice(8))}</div>
                      <div className="space-y-1">
                        {items.slice(0, 3).map((p) => (
                          <div key={p.id} className="flex items-center gap-1.5 px-1.5 py-1 rounded bg-surface2/70 hover:bg-surface2 cursor-pointer">
                            <span className={cn('w-1 h-3.5 rounded-full shrink-0', STATUS_BAR[p.status])} />
                            <ChannelDot channel={p.channel} className="w-1.5 h-1.5 shrink-0" />
                            <span className="text-[0.68rem] text-ink truncate">{p.title}</span>
                          </div>
                        ))}
                        {items.length > 3 && <div className="text-[0.65rem] text-ink-faint pl-1.5">+{items.length - 3} more</div>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="divide-y divide-line">
            {posts.slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-3">
                <ChannelDot channel={p.channel} className="w-2.5 h-2.5" />
                <span className="text-sm text-ink-faint w-28 shrink-0 tabular-nums">{p.date} {p.time}</span>
                <span className="flex-1 text-sm font-semibold text-ink truncate">{p.title}</span>
                <PostStatus status={p.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
