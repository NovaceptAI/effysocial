import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LayoutTemplate, Wand2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { TEMPLATE_CATEGORIES, templatesFor } from '../data/contentData';
import { Card, PageHeader, Button, Badge } from '../../ui';
import { ChannelDot } from '../components/parts';
import { cn } from '../../lib/cn';

export default function Templates() {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const all = templatesFor(workspace);
  const [cat, setCat] = useState('All');
  const items = all.filter((t) => cat === 'All' || t.category === cat);

  return (
    <div>
      <PageHeader
        title="Templates"
        subtitle="Reusable, brand-locked layouts with dynamic fields."
        actions={<Button variant="secondary">+ New template</Button>}
      />

      <div className="flex gap-1.5 mb-4">
        {TEMPLATE_CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={cn('px-3 py-1.5 rounded-full text-sm font-semibold transition',
              cat === c ? 'bg-coral text-white' : 'bg-surface2 text-ink-soft hover:text-ink')}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((t) => (
          <Card key={t.id} className="overflow-hidden hover:-translate-y-1 hover:border-coral transition">
            <div className="aspect-[16/9] bg-aurora grid place-items-center text-white relative">
              <LayoutTemplate className="w-9 h-9 opacity-85" />
              {t.locked && (
                <span className="absolute top-2 right-2 flex items-center gap-1 text-[0.65rem] font-bold bg-white/90 text-ink rounded-full px-2 py-0.5">
                  <Lock className="w-3 h-3" /> Brand-locked
                </span>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <ChannelDot channel={t.channel} className="w-2.5 h-2.5" />
                <span className="font-bold text-ink text-sm flex-1">{t.name}</span>
                <Badge>{t.category}</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {t.fields.map((f) => (
                  <span key={f} className="text-[0.7rem] font-semibold bg-surface2 border border-dashed border-line rounded px-1.5 py-0.5 text-ink-soft">{'{'}{f}{'}'}</span>
                ))}
              </div>
              <Button size="sm" className="mt-3 w-full" onClick={() => navigate('/app/studio')}>
                <Wand2 className="w-3.5 h-3.5" /> Use template
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
