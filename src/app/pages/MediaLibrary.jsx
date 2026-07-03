import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Video, Star, AlertTriangle } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { mediaFor } from '../data/contentData';
import { Card, PageHeader, Button, Badge } from '../../ui';
import { cn } from '../../lib/cn';

const TYPE_ICON = { image: ImageIcon, video: Video, logo: Star };
const FILTERS = ['All', 'image', 'video', 'logo'];

export default function MediaLibrary() {
  const { workspace } = useWorkspace();
  const assets = mediaFor(workspace);
  const [filter, setFilter] = useState('All');
  const items = assets.filter((a) => filter === 'All' || a.type === filter);

  return (
    <div>
      <PageHeader
        title="Media Library"
        subtitle={`${assets.length} assets · tagged, tracked and rights-aware`}
        actions={<Button><Upload className="w-4 h-4" /> Upload</Button>}
      />

      <div className="flex gap-1.5 mb-4">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-3 py-1.5 rounded-full text-sm font-semibold capitalize transition',
              filter === f ? 'bg-coral text-white' : 'bg-surface2 text-ink-soft hover:text-ink')}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((a) => {
          const Icon = TYPE_ICON[a.type] || ImageIcon;
          return (
            <Card key={a.id} className="overflow-hidden hover:-translate-y-1 hover:border-coral transition cursor-pointer">
              <div className="aspect-video grid place-items-center text-white"
                style={{ background: `linear-gradient(135deg, hsl(${a.thumbHue} 70% 62%), hsl(${a.thumbHue + 40} 70% 48%))` }}>
                <Icon className="w-8 h-8 opacity-80" />
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold text-ink truncate">{a.name}</div>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {a.tags.map((t) => <Badge key={t}>{t}</Badge>)}
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-ink-faint">
                  <span>{a.uses} uses</span>
                  {a.expiring ? (
                    <span className="flex items-center gap-1 text-warning font-semibold"><AlertTriangle className="w-3 h-3" /> {a.rights}</span>
                  ) : (
                    <span className="capitalize">{a.rights}</span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
