import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wand2, Upload, Trash2, Download, Play, ImageIcon, RefreshCw,
  Film, ZoomIn, ZoomOut, MoveRight, MoveLeft, X,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { PageHeader, Button, Badge } from '../../ui';
import { cn } from '../../lib/cn';

const TABS = [
  { key: '', label: 'All' },
  { key: 'image', label: 'Images' },
  { key: 'video', label: 'Videos' },
];
const SOURCE_TONE = { studio: 'coral', storyboard: 'info', upload: 'default' };
const MOTIONS = [
  { key: 'push_in', label: 'Push in', icon: ZoomIn },
  { key: 'pull_out', label: 'Pull out', icon: ZoomOut },
  { key: 'pan_right', label: 'Pan right', icon: MoveRight },
  { key: 'pan_left', label: 'Pan left', icon: MoveLeft },
];

export default function MediaLibrary() {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState('');
  const [moveFor, setMoveFor] = useState(null);   // media id whose motion menu is open
  const fileRef = useRef(null);

  const key = ['media', workspace?.id, tab];
  const { data: media = [], isLoading } = useQuery({
    queryKey: key, queryFn: () => effyApi.listMedia(workspace.id, tab), enabled: !!workspace,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['media', workspace?.id] });

  const upload = useMutation({
    mutationFn: (file) => effyApi.uploadMedia(workspace.id, file),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id) => effyApi.deleteMedia(id),
    onSuccess: invalidate,
  });
  const animate = useMutation({
    mutationFn: ({ m, motion }) => effyApi.animateMedia({ workspace: workspace.id, name: m.name, motion, aspect: m.aspect || '' }),
    onSuccess: () => { setMoveFor(null); invalidate(); },
  });

  const onPick = (e) => {
    Array.from(e.target.files || []).forEach((f) => upload.mutate(f));
    e.target.value = '';
  };
  const reuse = (m) => navigate(`/app/studio?image=${encodeURIComponent(m.url)}`);

  return (
    <div>
      <PageHeader
        title="Media Library"
        subtitle="Every visual you generate in Studio and storyboards lands here — plus your uploads. Reuse, download or remove."
        actions={
          <>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple hidden onChange={onPick} />
            <Button onClick={() => fileRef.current?.click()} disabled={upload.isPending}>
              {upload.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload
            </Button>
          </>
        }
      />

      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('px-4 py-1.5 rounded-full text-sm font-semibold transition',
              tab === t.key ? 'bg-ink text-white' : 'bg-surface2 text-ink-soft hover:text-ink')}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="aspect-square rounded-2xl bg-surface2 animate-pulse" />)}
        </div>
      ) : media.length === 0 ? (
        <div className="rounded-2xl bg-surface shadow-e1 p-10 text-center">
          <div className="grid place-items-center w-14 h-14 rounded-2xl bg-coral-tint text-coral-ink mx-auto mb-4"><ImageIcon className="w-6 h-6" /></div>
          <h3 className="font-display text-xl font-semibold tracking-tight mb-1.5">Your media library is empty</h3>
          <p className="text-sm text-ink-soft leading-relaxed max-w-md mx-auto mb-5">
            Generate a visual in AI Studio or a storyboard and it appears here automatically — or upload your own logos and product shots.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => navigate('/app/studio')}><Wand2 className="w-4 h-4" /> Create in Studio</Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}><Upload className="w-4 h-4" /> Upload</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((m) => (
            <div key={m.id} className="group relative rounded-2xl overflow-hidden bg-surface shadow-e1 hover:shadow-e3 transition-all">
              <div className="relative bg-ink/90" style={{ aspectRatio: m.aspect ? m.aspect.replace(':', ' / ') : '1 / 1' }}>
                {m.kind === 'video'
                  ? <video src={m.url} muted loop playsInline className="absolute inset-0 w-full h-full object-cover"
                      onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} />
                  : <img src={m.url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />}
                <span className="absolute top-2 left-2 grid place-items-center w-6 h-6 rounded-md bg-ink/55 text-white backdrop-blur-sm">
                  {m.kind === 'video' ? <Play className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                </span>
                {/* motion picker overlay ("Make it move") */}
                {moveFor === m.id && (
                  <div className="absolute inset-0 z-10 grid place-items-center bg-ink/70 backdrop-blur-sm p-3">
                    {animate.isPending ? (
                      <span className="inline-flex items-center gap-1.5 text-white text-xs font-semibold"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Animating…</span>
                    ) : (
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white text-xs font-bold">Make it move</span>
                          <button onClick={() => setMoveFor(null)} className="text-white/70 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {MOTIONS.map((mo) => (
                            <button key={mo.key} onClick={() => animate.mutate({ m, motion: mo.key })}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 text-ink text-xs font-semibold px-2 py-1.5 hover:bg-white">
                              <mo.icon className="w-3.5 h-3.5" /> {mo.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* hover actions */}
                <div className="absolute inset-x-0 bottom-0 p-2 flex items-center gap-1.5 bg-gradient-to-t from-ink/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                  {m.kind === 'image' && (
                    <button onClick={() => setMoveFor(m.id)} title="Make it move"
                      className="grid place-items-center w-8 h-8 rounded-lg bg-white/90 text-coral-ink hover:bg-white"><Film className="w-3.5 h-3.5" /></button>
                  )}
                  <button onClick={() => reuse(m)} title="Reuse in Studio"
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-white/90 text-ink text-xs font-bold py-1.5 hover:bg-white">
                    <Wand2 className="w-3.5 h-3.5" /> Reuse
                  </button>
                  <a href={m.url} download title="Download" className="grid place-items-center w-8 h-8 rounded-lg bg-white/90 text-ink hover:bg-white"><Download className="w-3.5 h-3.5" /></a>
                  <button onClick={() => remove.mutate(m.id)} title="Delete" className="grid place-items-center w-8 h-8 rounded-lg bg-white/90 text-error hover:bg-white"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-xs text-ink-soft truncate">{m.prompt || (m.kind === 'video' ? 'Video' : 'Image')}</p>
                <div className="flex items-center justify-between mt-1">
                  <Badge tone={SOURCE_TONE[m.source] || 'default'}>{m.source}</Badge>
                  <span className="text-[0.65rem] text-ink-faint">{m.created}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
