import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Plus } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { usePosts } from '../api/hooks';
import { Card, PageHeader, Button, Tabs } from '../../ui';
import { ChannelDot, PostStatus } from '../components/parts';
import PostDialog from '../components/PostDialog';
import FillGapsDialog from '../components/FillGapsDialog';
import { addDays, dayLabel, orgZone, todayIn, zoneLabel } from '../timezone';
import { cn } from '../../lib/cn';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n) => String(n).padStart(2, '0');
const ymd = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

const STATUS_BAR = {
  published: 'bg-success', scheduled: 'bg-info', publishing: 'bg-info', approved: 'bg-success',
  internal_review: 'bg-warning', client_review: 'bg-warning', draft: 'bg-ink-faint', idea: 'bg-ink-faint', failed: 'bg-error',
};

function monthGrid(y, m) {
  const first = new Date(Date.UTC(y, m, 1)).getUTCDay();
  const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(ymd(y, m, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

export default function Calendar() {
  const { workspace, org, canWrite } = useWorkspace();
  const { data: posts = [] } = usePosts(workspace);
  // "Today" is the organisation's, the same clock posts are scheduled by.
  const zone = orgZone(org);
  const today = todayIn(zone);
  const [cursor, setCursor] = useState(() => ({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 }));
  const [view, setView] = useState('month');
  const [dialog, setDialog] = useState(null);   // { post } | { initial }
  const [fillOpen, setFillOpen] = useState(false);

  const byDate = useMemo(() => {
    const map = {};
    posts.forEach((p) => { (map[p.date] ||= []).push(p); });
    return map;
  }, [posts]);

  const cells = monthGrid(cursor.y, cursor.m);
  const monthStart = ymd(cursor.y, cursor.m, 1);
  const monthEnd = cells.filter(Boolean).at(-1);
  const move = (dir) => setCursor((c) => {
    let m = c.m + dir, y = c.y;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    return { y, m };
  });
  const newPost = (date = today) => setDialog({ initial: { date, time: '18:00' } });
  const openPost = (p) => setDialog({ post: p });
  // Fill gaps looks at what's left of the month on screen.
  const fillFrom = monthStart > today ? monthStart : addDays(today, 1);

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle={`Plan and schedule content across every channel. Times are ${zoneLabel(zone)}.`}
        actions={canWrite && (
          <>
            <Button variant="secondary" onClick={() => setFillOpen(true)} disabled={fillFrom > monthEnd}><Sparkles className="w-4 h-4" /> Fill gaps</Button>
            <Button onClick={() => newPost()}><Plus className="w-4 h-4" /> New post</Button>
          </>
        )}
      />

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button onClick={() => move(-1)} aria-label="Previous month" className="grid place-items-center w-8 h-8 rounded-lg hover:bg-surface2"><ChevronLeft className="w-4 h-4" /></button>
            <h2 className="text-lg font-bold text-ink w-44 text-center">{MONTHS[cursor.m]} {cursor.y}</h2>
            <button onClick={() => move(1)} aria-label="Next month" className="grid place-items-center w-8 h-8 rounded-lg hover:bg-surface2"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <Tabs tabs={[{ id: 'month', label: 'Month' }, { id: 'list', label: 'List' }]} active={view} onChange={setView} />
        </div>

        {view === 'month' ? (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-px bg-line rounded-lg overflow-hidden border border-line min-w-[640px]">
              {DOW.map((d) => <div key={d} className="bg-surface2 text-center py-2 text-xs font-bold text-ink-faint">{d}</div>)}
              {cells.map((date, i) => {
                const items = date ? (byDate[date] || []) : [];
                const isToday = date === today;
                return (
                  <div key={i} data-date={date || undefined} aria-current={isToday ? 'date' : undefined}
                    className={cn('group bg-surface min-h-[104px] p-1.5', !date && 'bg-surface2/40')}>
                    {date && (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <div className={cn('text-xs font-semibold w-6 h-6 grid place-items-center rounded-full', isToday ? 'bg-coral text-white' : 'text-ink-soft')}>{Number(date.slice(8))}</div>
                          {canWrite && date >= today && (
                            <button onClick={() => newPost(date)} aria-label={`New post on ${dayLabel(date)}`}
                              className="grid place-items-center w-6 h-6 rounded-md text-ink-faint opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-surface2">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-1">
                          {items.slice(0, 3).map((p) => (
                            <button key={p.id} onClick={() => openPost(p)} title={p.title}
                              className="w-full flex items-center gap-1.5 px-1.5 py-1 rounded bg-surface2/70 hover:bg-surface2 text-left">
                              <span className={cn('w-1 h-3.5 rounded-full shrink-0', STATUS_BAR[p.status])} />
                              <ChannelDot channel={p.channel} className="w-1.5 h-1.5 shrink-0" />
                              <span className="text-[0.68rem] text-ink truncate">{p.title}</span>
                            </button>
                          ))}
                          {items.length > 3 && (
                            <button onClick={() => setView('list')} className="text-[0.65rem] text-ink-faint pl-1.5 hover:text-ink">+{items.length - 3} more</button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {posts.slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).map((p) => (
              <li key={p.id}>
                <button onClick={() => openPost(p)} className="w-full flex items-center gap-3 py-3 text-left hover:bg-surface2/50 rounded-lg px-1">
                  <ChannelDot channel={p.channel} className="w-2.5 h-2.5" />
                  <span className={cn('text-sm w-32 shrink-0 tabular-nums', p.date === today ? 'text-coral-ink font-bold' : 'text-ink-faint')}>
                    {p.date ? `${p.date} ${p.time}` : 'No date'}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-ink truncate">{p.title}</span>
                  <PostStatus status={p.status} />
                </button>
              </li>
            ))}
            {posts.length === 0 && <li className="py-8 text-center text-sm text-ink-faint">Nothing planned yet.</li>}
          </ul>
        )}
      </Card>

      <PostDialog open={!!dialog} post={dialog?.post || null} initial={dialog?.initial || null} onClose={() => setDialog(null)} />
      <FillGapsDialog open={fillOpen} onClose={() => setFillOpen(false)} from={fillFrom} to={monthEnd} />
    </div>
  );
}
