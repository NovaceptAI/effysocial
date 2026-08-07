import React, { useState } from 'react';
import { Sparkles, Loader2, Send, Check, RefreshCw, ArrowLeft } from 'lucide-react';
import { useWorkspace } from '../app/context/WorkspaceContext';
import { effyApi } from '../app/api/effyApi';
import { QUICK_FORMATS } from './eventConfig';

// Quick Create — pick a format, type an idea, get a caption + on-brand image,
// and (volunteers only) publish it to the connected Instagram. Reuses the same
// studio endpoints the main app uses; no backend changes.
export default function QuickCreate({ onBack, canPublish }) {
  const { workspace } = useWorkspace();
  const [fmt, setFmt] = useState(QUICK_FORMATS[0]);
  const [topic, setTopic] = useState('');
  const [busy, setBusy] = useState(false);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState('');
  const [err, setErr] = useState('');
  const [pubState, setPubState] = useState(''); // '' | 'publishing' | 'done' | error msg

  const generate = async () => {
    if (!topic.trim()) return;
    setBusy(true); setErr(''); setCaption(''); setImage(''); setPubState('');
    try {
      const [copy, img] = await Promise.all([
        effyApi.generateStudio({ workspace: workspace.id, type: fmt.id, topic: topic.trim(), language: 'English' }),
        effyApi.studioImage({ workspace: workspace.id, topic: topic.trim(), aspect: fmt.aspect }),
      ]);
      setCaption(copy?.caption || '');
      setImage(img?.imageUrl || '');
    } catch (e) { setErr(e.message || 'Generation failed — try again.'); }
    finally { setBusy(false); }
  };

  const publish = async () => {
    if (!image) return;
    setPubState('publishing');
    try {
      await effyApi.publishInstagram(workspace.id, image, caption);
      setPubState('done');
    } catch (e) { setPubState(e.message || 'Publish failed'); }
  };

  return (
    <div className="min-h-full text-white" style={{ background: '#0b0c0e' }}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white bg-transparent"><ArrowLeft className="w-4 h-4" /> All tools</button>
        <span className="font-bold">Quick Create</span>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-6">
        {/* Format chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_FORMATS.map((f) => (
            <button key={f.id} onClick={() => setFmt(f)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition ${fmt.id === f.id ? 'bg-white text-black' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Idea input */}
        <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3}
          placeholder="Type one idea… e.g. A festive offer on our AI website package"
          className="w-full rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-3.5 text-base outline-none focus:border-white/30" />

        <button onClick={generate} disabled={busy || !topic.trim()}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-lg font-bold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#FF6A5C,#E5484D)' }}>
          {busy ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating…</> : <><Sparkles className="w-5 h-5" /> Create</>}
        </button>
        {err && <p className="mt-3 text-sm text-red-400">{err}</p>}

        {/* Result */}
        {(image || caption) && (
          <div className="mt-6 grid sm:grid-cols-2 gap-5 items-start">
            <div className="rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10" style={{ aspectRatio: fmt.aspect }}>
              {image ? <img src={image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-white/30"><Loader2 className="w-6 h-6 animate-spin" /></div>}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-white/40 mb-1.5">Caption</div>
              <p className="text-sm leading-relaxed text-white/90 whitespace-pre-line">{caption || '—'}</p>

              <div className="flex flex-wrap gap-2 mt-5">
                <button onClick={generate} disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition hover:brightness-95 disabled:opacity-45"
                  style={{ background: '#EDEEF0', color: '#15161a' }}>
                  {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Regenerating…</> : <><RefreshCw className="w-4 h-4" /> Regenerate</>}
                </button>
                {canPublish && image && (
                  pubState === 'done'
                    ? <span className="inline-flex items-center gap-1.5 rounded-xl bg-green-500/20 px-4 py-2.5 text-sm font-bold text-green-300"><Check className="w-4 h-4" /> Posted to Instagram</span>
                    : <button onClick={publish} disabled={pubState === 'publishing'}
                        className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#FF6A5C,#E5484D)' }}>
                        {pubState === 'publishing' ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting…</> : <><Send className="w-4 h-4" /> Publish to Instagram</>}
                      </button>
                )}
              </div>
              {pubState && pubState !== 'publishing' && pubState !== 'done' && <p className="mt-2 text-sm text-red-400">{pubState}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
