import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Upload, Sparkles, RefreshCw, Check, Pencil, Film, Mic, Layers,
  Send, AlertTriangle, ShieldCheck, Play, Download, Lock,
} from 'lucide-react';
import { effyApi } from '../api/effyApi';

/* The theatre: a silent, full-screen production room. Neutral dark greys so
   the footage is judged against nothing; pure black only in the preview well;
   coral appears in ~5 places total. One door out. Everything autosaves. */

const T = {
  stage: '#0D0E12', surface: '#16181D', raised: '#1D2026', border: '#2A2E36',
  text: '#EDEEF0', dim: '#9BA1AB', coral: '#FF6A5C', green: '#3DDC97',
  amber: '#FFB020', red: '#FF5D5D',
};

const STAGE_LABELS = ['Direction', 'Script', 'Stills', 'Animate', 'Voice', 'Assemble', 'Deliver'];

const AUDIENCES = ['Homeowners', 'Young families', 'Dealers & trade', 'Small businesses'];
const ENVIRONMENTS = ['Urban rooftop', 'Village home', 'Shopfront', 'Home interior', 'Monsoon streets'];
const CONCEPTS = ['Problem → solution', 'Product demo', 'Festive', 'Testimonial-style', 'Offer / promo'];

const panel = { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14 };
const inputStyle = {
  background: T.raised, border: `1px solid ${T.border}`, borderRadius: 10,
  color: T.text, padding: '8px 12px', fontSize: 13, width: '100%',
};

function Btn({ kind = 'coral', style, disabled, children, ...props }) {
  const kinds = {
    coral: { background: T.coral, color: '#fff' },
    quiet: { background: T.raised, color: T.text, border: `1px solid ${T.border}` },
    ghost: { background: 'transparent', color: T.dim },
  };
  return (
    <button type="button" disabled={disabled} {...props}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13,
        padding: '8px 14px', borderRadius: 10, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1, transition: 'filter .15s', ...kinds[kind], ...style,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.filter = ''; }}>
      {children}
    </button>
  );
}

function Chip({ active, suggested, onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      style={{
        background: active ? T.coral : T.raised, color: active ? '#fff' : T.text,
        border: `1px solid ${active ? T.coral : T.border}`, borderRadius: 999,
        padding: '5px 13px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
      }}>
      {children}{suggested && !active && <span style={{ color: T.dim, fontWeight: 400 }}> · AI pick</span>}
    </button>
  );
}

function StatusDot({ color }) {
  return <span style={{ width: 8, height: 8, borderRadius: 99, background: color, display: 'inline-block' }} />;
}

export default function FilmMaker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [lit, setLit] = useState(false); // lights-down transition
  const [stage, setStage] = useState(null); // local view; synced to film.stage
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState(null); // {kind:'warn'|'error', text}
  const fileRef = useRef(null);
  const [editDrafts, setEditDrafts] = useState({}); // sceneId → edit text
  const [castQuery, setCastQuery] = useState('');
  const [castResults, setCastResults] = useState([]);
  const [dealerText, setDealerText] = useState('');

  useEffect(() => { const t = setTimeout(() => setLit(true), 30); return () => clearTimeout(t); }, []);

  const { data: film, refetch } = useQuery({
    queryKey: ['film', id],
    queryFn: () => effyApi.getFilm(id),
  });
  const { data: voicesPkg } = useQuery({ queryKey: ['voices'], queryFn: () => effyApi.studioVoices() });
  const voices = voicesPkg?.voices || [];

  const view = stage ?? film?.stage ?? 1;
  const scenes = film?.scenes || [];
  const d = film?.direction || {};

  const patch = useMutation({
    mutationFn: (payload) => effyApi.updateFilm(id, payload),
    onSuccess: (f) => qc.setQueryData(['film', id], f),
  });

  const goStage = (n) => {
    setStage(n);
    if (film && n !== film.stage) patch.mutate({ stage: n }); // resume point autosaves
  };

  const fail = (e) => setNotice({ kind: 'error', text: e.message || 'Something went wrong.' });
  const note = (r) => { if (r?.budgetWarning) setNotice({ kind: 'warn', text: r.budgetWarning }); };

  async function run(label, fn) {
    setBusy(label); setNotice(null);
    try { await fn(); } catch (e) { fail(e); } finally { setBusy(''); }
  }

  const pickDirection = (field, value) =>
    patch.mutate({ direction: { [field]: { value, userSet: true } } });

  const runCastSearch = () =>
    run('cast', async () => setCastResults(await effyApi.filmVoiceSearch(castQuery || 'indian english')));

  // Poll any scene that is animating.
  useEffect(() => {
    const inflight = scenes.filter((s) => s.clipStatus === 'animating' && s.op);
    if (!inflight.length) return undefined;
    const t = setInterval(async () => {
      for (const s of inflight) {
        try {
          const r = await effyApi.filmAnimateStatus(id, s.id);
          if (r.status === 'ready') refetch();
        } catch { refetch(); }
      }
    }, 8000);
    return () => clearInterval(t);
  }, [id, scenes, refetch]);

  if (!film) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: T.stage, display: 'grid', placeItems: 'center', color: T.dim }}>
        Entering the room…
      </div>
    );
  }

  const approved = scenes.filter((s) => s.stillStatus === 'approved').length;
  const allApproved = film.allStillsApproved;
  const allClips = scenes.length > 0 && scenes.every((s) => s.clip);
  const master = film.renders?.master;
  const qa = film.renders?.qa;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: T.stage, color: T.text, overflowY: 'auto',
      opacity: lit ? 1 : 0, transition: 'opacity .3s ease', fontFamily: 'inherit', zIndex: 50,
    }}>
      {/* Header — the only chrome in the room */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 16,
        padding: '12px 20px', background: `${T.stage}F2`, borderBottom: `1px solid ${T.border}`,
        backdropFilter: 'blur(8px)',
      }}>
        <Btn kind="ghost" onClick={() => navigate('/app/films')} style={{ padding: '6px 10px' }}>
          <ArrowLeft size={16} /> Exit
        </Btn>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{film.title}</div>
          <div style={{ fontSize: 11, color: T.dim }}>{film.client}{film.product ? ` · ${film.product}` : ''} · {film.language} · {film.durationS}s</div>
        </div>
        {/* Stage rail */}
        <nav style={{ display: 'flex', gap: 4, marginLeft: 'auto', alignItems: 'center', flexWrap: 'wrap' }}>
          {STAGE_LABELS.map((label, i) => {
            const n = i + 1;
            const active = view === n;
            return (
              <button key={label} type="button" onClick={() => goStage(n)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, background: active ? T.raised : 'transparent',
                  border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                  color: active ? T.text : T.dim, fontSize: 12, fontWeight: active ? 700 : 500,
                }}>
                <span style={{
                  width: 7, height: 7, borderRadius: 99,
                  background: active ? T.coral : n < (film.stage || 1) ? T.dim : T.border,
                }} />
                {label}
              </button>
            );
          })}
        </nav>
        <div style={{ fontSize: 12, color: T.dim, whiteSpace: 'nowrap' }}>
          <span style={{ color: film.spendUsd > film.budgetUsd ? T.amber : T.text, fontWeight: 700 }}>
            ${(film.spendUsd || 0).toFixed(2)}
          </span> / ${film.budgetUsd.toFixed(0)}
        </div>
      </header>

      {notice && (
        <div style={{
          margin: '14px 20px 0', padding: '10px 14px', borderRadius: 10, fontSize: 13,
          background: notice.kind === 'warn' ? '#3a2c10' : '#3a1616',
          color: notice.kind === 'warn' ? T.amber : T.red,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertTriangle size={15} /> {notice.text}
          <button type="button" onClick={() => setNotice(null)} style={{ marginLeft: 'auto', background: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <main style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>

        {/* ── Stage 1: Assets & Direction ─────────────────────────────── */}
        {view === 1 && (
          <div style={{ display: 'grid', gap: 16 }}>
            <section style={{ ...panel, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Brand assets</h2>
              <p style={{ fontSize: 12.5, color: T.dim, marginBottom: 14 }}>
                Logo, pack shots, product photos, reference footage — all optional. Each image is analyzed
                and its findings pre-fill the direction below.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {(film.assets || []).map((a, i) => (
                  <div key={i} style={{ width: 110 }}>
                    <div style={{ height: 78, borderRadius: 10, overflow: 'hidden', background: '#000', border: `1px solid ${T.border}` }}>
                      {a.url && a.kind !== 'footage'
                        ? <img src={a.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: T.dim }}><Film size={18} /></div>}
                    </div>
                    <div style={{ fontSize: 10.5, color: T.dim, marginTop: 4, textTransform: 'capitalize' }}>{(a.kind || '').replace('_', ' ')}</div>
                  </div>
                ))}
                <button type="button" onClick={() => fileRef.current?.click()}
                  disabled={busy === 'asset'}
                  style={{
                    width: 110, height: 78, borderRadius: 10, border: `1.5px dashed ${T.border}`,
                    background: 'transparent', color: T.dim, cursor: 'pointer', display: 'grid', placeItems: 'center',
                  }}>
                  {busy === 'asset' ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                </button>
                <input ref={fileRef} type="file" accept="image/*,video/mp4" hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = '';
                    if (f) run('asset', async () => { await effyApi.filmAsset(id, f); refetch(); });
                  }} />
              </div>
            </section>

            <section style={{ ...panel, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Direction</h2>
              {/* Palette — assertive when brand-derived */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.dim, letterSpacing: '.06em', marginBottom: 8 }}>COLOR PALETTE</div>
                {d.palette?.colors?.length ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {d.palette.colors.map((c) => (
                      <span key={c} title={c} style={{ width: 26, height: 26, borderRadius: 8, background: c, border: `1px solid ${T.border}` }} />
                    ))}
                    <span style={{ fontSize: 12, color: T.dim }}>
                      Brand-derived{d.palette.mood ? ` — ${d.palette.mood}` : ''}
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: 12.5, color: T.dim }}>Upload a logo or pack shot and the brand colors appear here.</span>
                )}
              </div>
              {[['audience', 'TARGET AUDIENCE', AUDIENCES], ['environment', 'ENVIRONMENT', ENVIRONMENTS], ['concept', 'AD CONCEPT', CONCEPTS]].map(([field, label, opts]) => {
                const cur = d[field]?.value || '';
                const aiPick = d[field] && !d[field].userSet ? d[field].value : null;
                const options = [...opts];
                if (cur && !options.some((o) => o.toLowerCase() === cur.toLowerCase())) options.unshift(cur);
                return (
                  <div key={field} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.dim, letterSpacing: '.06em', marginBottom: 8 }}>
                      {label}{aiPick && <span style={{ fontWeight: 400 }}> — our guess, tap to change</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {options.map((o) => (
                        <Chip key={o} active={cur.toLowerCase() === o.toLowerCase()}
                          suggested={aiPick?.toLowerCase() === o.toLowerCase()}
                          onClick={() => pickDirection(field, o)}>{o}</Chip>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Btn onClick={() => goStage(2)}>Continue to script</Btn>
              </div>
            </section>
          </div>
        )}

        {/* ── Stage 2: Brief & Script ─────────────────────────────────── */}
        {view === 2 && (
          <section style={{ ...panel, padding: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Brief & script</h2>
            <p style={{ fontSize: 12.5, color: T.dim, marginBottom: 12 }}>
              The AI writes {Math.max(2, Math.floor((film.durationS - 4) / 4))} four-second beats from your brief and
              direction. Every line stays editable. Scenes with approved stills survive a re-draft.
            </p>
            <textarea defaultValue={film.brief} rows={3} placeholder="What is this film about? e.g. 20s monsoon-proofing ad: cracked roofs suffer, our coating fixes it, meet your local dealer."
              onBlur={(e) => e.target.value !== film.brief && patch.mutate({ brief: e.target.value })}
              style={{ ...inputStyle, resize: 'vertical', marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <Btn disabled={busy === 'script'} onClick={() => run('script', async () => {
                const el = document.activeElement; el?.blur?.();
                const f = await effyApi.filmScript(id, {});
                qc.setQueryData(['film', id], f);
              })}>
                {busy === 'script' ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
                {scenes.length ? 'Re-draft script' : 'Draft the script'}
              </Btn>
              {scenes.length > 0 && <Btn kind="quiet" onClick={() => goStage(3)}>Continue to stills</Btn>}
            </div>
            {scenes.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ color: T.dim, fontSize: 11, textAlign: 'left' }}>
                      <th style={{ padding: '6px 8px' }}>#</th>
                      <th style={{ padding: '6px 8px', width: '30%' }}>VO LINE</th>
                      <th style={{ padding: '6px 8px', width: '38%' }}>VISUAL</th>
                      <th style={{ padding: '6px 8px', width: '26%' }}>MOTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenes.map((s) => (
                      <tr key={s.id} style={{ borderTop: `1px solid ${T.border}` }}>
                        <td style={{ padding: '8px', color: T.dim }}>{s.idx + 1}</td>
                        {['line', 'visual', 'motion'].map((fld) => (
                          <td key={fld} style={{ padding: '6px 4px' }}>
                            <textarea defaultValue={s[fld]} rows={2}
                              onBlur={(e) => e.target.value !== s[fld] &&
                                run('scene', async () => { await effyApi.filmSceneUpdate(id, s.id, { [fld]: e.target.value }); refetch(); })}
                              style={{ ...inputStyle, fontSize: 12.5, resize: 'vertical' }} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ── Stage 3: Stills — the approval gate ─────────────────────── */}
        {view === 3 && (
          <section>
            <div style={{
              ...panel, padding: '12px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10,
              borderColor: allApproved ? T.green : T.border,
            }}>
              {allApproved ? <ShieldCheck size={17} color={T.green} /> : <Lock size={16} color={T.dim} />}
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {approved}/{scenes.length} stills approved
                {!allApproved && ' — animation stays locked until every still is approved'}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: T.dim }}>~${film.costs?.still?.toFixed(2)} per image — iterate freely here</span>
              {allApproved && <Btn onClick={() => goStage(4)} style={{ marginLeft: 10 }}>Continue to animate</Btn>}
            </div>
            {scenes.length === 0 && <p style={{ color: T.dim, fontSize: 13 }}>Draft the script first (stage 2).</p>}
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {scenes.map((s) => (
                <div key={s.id} style={{ ...panel, overflow: 'hidden' }}>
                  <div style={{ background: '#000', aspectRatio: film.aspect === '16:9' ? '16/9' : '9/16', display: 'grid', placeItems: 'center' }}>
                    {s.stillUrl
                      ? <img src={s.stillUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <span style={{ color: T.dim, fontSize: 12 }}>Scene {s.idx + 1} — no still yet</span>}
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 12, color: T.dim, marginBottom: 8, minHeight: 30 }}>{s.visual}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Btn kind="quiet" disabled={!!busy} style={{ padding: '6px 10px', fontSize: 12 }}
                        onClick={() => run(`still${s.id}`, async () => {
                          const r = await effyApi.filmStill(id, s.id, {});
                          note(r); refetch();
                        })}>
                        {busy === `still${s.id}` ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                        {s.still ? 'Regenerate' : 'Generate'}
                      </Btn>
                      {s.still && (
                        s.stillStatus === 'approved' ? (
                          <Btn kind="quiet" style={{ padding: '6px 10px', fontSize: 12, color: T.green, borderColor: T.green }}
                            onClick={() => run('appr', async () => { await effyApi.filmApprove(id, s.id, false); refetch(); })}>
                            <Check size={13} /> Approved
                          </Btn>
                        ) : (
                          <Btn style={{ padding: '6px 10px', fontSize: 12, background: T.green, color: '#08130d' }}
                            onClick={() => run('appr', async () => { await effyApi.filmApprove(id, s.id, true); refetch(); })}>
                            <Check size={13} /> Approve
                          </Btn>
                        )
                      )}
                    </div>
                    {s.still && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        <input placeholder='Edit: e.g. "add the branded blue bucket in the foreground"'
                          value={editDrafts[s.id] || ''}
                          onChange={(e) => setEditDrafts((p) => ({ ...p, [s.id]: e.target.value }))}
                          style={{ ...inputStyle, fontSize: 12 }} />
                        <Btn kind="quiet" disabled={!editDrafts[s.id]?.trim() || !!busy} style={{ padding: '6px 10px' }}
                          onClick={() => run(`still${s.id}`, async () => {
                            const r = await effyApi.filmStill(id, s.id, { edit: editDrafts[s.id] });
                            setEditDrafts((p) => ({ ...p, [s.id]: '' }));
                            note(r); refetch();
                          })}>
                          <Pencil size={13} />
                        </Btn>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Stage 4: Animate ────────────────────────────────────────── */}
        {view === 4 && (
          <section>
            <div style={{ ...panel, padding: '12px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Film size={16} color={allApproved ? T.coral : T.dim} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {allApproved
                  ? `Each scene render costs ~$${film.costs?.scene?.toFixed(2)} and is auto-checked for stray human voices.`
                  : 'Locked — approve every still first (stage 3).'}
              </span>
              {allClips && <Btn onClick={() => goStage(5)} style={{ marginLeft: 'auto' }}>Continue to voice</Btn>}
            </div>
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {scenes.map((s) => (
                <div key={s.id} style={{ ...panel, overflow: 'hidden' }}>
                  <div style={{ background: '#000', aspectRatio: film.aspect === '16:9' ? '16/9' : '9/16', display: 'grid', placeItems: 'center' }}>
                    {s.clipUrl ? (
                      <video src={s.clipUrl} controls style={{ width: '100%', height: '100%' }} />
                    ) : s.clipStatus === 'animating' ? (
                      <span style={{ color: T.dim, fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                        <RefreshCw size={14} className="animate-spin" /> Rendering scene {s.idx + 1}…
                      </span>
                    ) : s.stillUrl ? (
                      <img src={s.stillUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.5 }} />
                    ) : <span style={{ color: T.dim, fontSize: 12 }}>Scene {s.idx + 1}</span>}
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, minHeight: 18 }}>
                      {s.clipStatus === 'audio_clean' && (<><StatusDot color={T.green} /><span style={{ fontSize: 12, color: T.green, fontWeight: 600 }}>Audio clean (AI-checked)</span></>)}
                      {s.clipStatus === 'audio_flagged' && (<><StatusDot color={T.amber} /><span style={{ fontSize: 12, color: T.amber, fontWeight: 600 }}>Voice detected</span></>)}
                      {s.takes > 0 && <span style={{ fontSize: 11, color: T.dim, marginLeft: 'auto' }}>take {s.takes}</span>}
                    </div>
                    {s.audioNote && <div style={{ fontSize: 11.5, color: T.dim, marginBottom: 8 }}>{s.audioNote}</div>}
                    <Btn disabled={!allApproved || s.clipStatus === 'animating' || !!busy}
                      kind={s.clip ? 'quiet' : 'coral'} style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={() => run(`anim${s.id}`, async () => {
                        const r = await effyApi.filmAnimate(id, s.id);
                        note(r); refetch();
                      })}>
                      {busy === `anim${s.id}` ? <RefreshCw size={13} className="animate-spin" /> : <Film size={13} />}
                      {s.clip ? `Retake (~$${film.costs?.scene?.toFixed(2)})` : `Animate (~$${film.costs?.scene?.toFixed(2)})`}
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Stage 5: Voice ──────────────────────────────────────────── */}
        {view === 5 && (
          <section style={{ ...panel, padding: 20, maxWidth: 760 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Voice</h2>
            <p style={{ fontSize: 12.5, color: T.dim, marginBottom: 14 }}>
              One narrator reads every line. Lines are measured against their 4-second windows — overruns get flagged
              before the mix, not after.
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
              <select value={film.voice?.startsWith('id:') ? '' : (film.voice || '')}
                onChange={(e) => patch.mutate({ voice: e.target.value })}
                style={{ ...inputStyle, width: 260 }}>
                <option value="">
                  {film.voice?.startsWith('id:')
                    ? `${film.direction?.voiceName || 'Adopted voice'} (from library)`
                    : `Default for ${film.language}`}
                </option>
                {voices.map((v) => (
                  <option key={v.key} value={v.key}>{v.name} — {v.lang} ({v.gender})</option>
                ))}
              </select>
              <Btn disabled={busy === 'vo' || !scenes.length} onClick={() => run('vo', async () => {
                const r = await effyApi.filmVo(id, { voice: film.voice });
                qc.setQueryData(['film', id], r.film);
                if (r.overruns?.length) setNotice({
                  kind: 'warn',
                  text: `Scene ${r.overruns.map((o) => o.idx + 1).join(', ')} runs longer than its window — shorten the line or it will crowd the next beat.`,
                });
              })}>
                {busy === 'vo' ? <RefreshCw size={15} className="animate-spin" /> : <Mic size={15} />} Generate all lines
              </Btn>
            </div>
            {/* Casting: search the ElevenLabs shared library — previews are the
                library's own MP3s, so auditioning costs nothing. */}
            <div style={{ background: T.raised, borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.dim, letterSpacing: '.05em', marginBottom: 10 }}>
                FIND MORE VOICES
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input value={castQuery} onChange={(e) => setCastQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runCastSearch()}
                  placeholder='e.g. "hinglish", "hindi ad", "indian english female"'
                  style={{ ...inputStyle, background: T.surface }} />
                <Btn kind="quiet" disabled={busy === 'cast'} onClick={runCastSearch}>
                  {busy === 'cast' ? <RefreshCw size={14} className="animate-spin" /> : 'Search'}
                </Btn>
              </div>
              {castResults.map((v) => (
                <div key={v.voiceId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: `1px solid ${T.border}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</div>
                    <div style={{ fontSize: 11, color: T.dim }}>{[v.gender, v.accent, v.useCase].filter(Boolean).join(' · ')} · {(v.usedBy || 0).toLocaleString()} users</div>
                  </div>
                  {v.previewUrl && <audio src={v.previewUrl} controls preload="none" style={{ height: 26, width: 170 }} />}
                  <Btn kind="quiet" style={{ padding: '5px 10px', fontSize: 12 }} disabled={!!busy}
                    onClick={() => run('adopt', async () => {
                      const f = await effyApi.filmVoiceAdopt(id, { voiceId: v.voiceId, ownerId: v.ownerId, name: v.name });
                      qc.setQueryData(['film', id], f);
                      setNotice({ kind: 'warn', text: `${v.name} is now this film's narrator — regenerate the lines below.` });
                    })}>
                    Use
                  </Btn>
                </div>
              ))}
            </div>
            {scenes.filter((s) => s.vo).length > 0 && (
              <div style={{ display: 'grid', gap: 8 }}>
                {scenes.map((s) => s.vo && (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.raised, borderRadius: 10, padding: '8px 12px' }}>
                    <span style={{ fontSize: 12, color: T.dim, width: 18 }}>{s.idx + 1}</span>
                    <span style={{ fontSize: 12.5, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.line}</span>
                    <span style={{ fontSize: 11.5, color: s.voSeconds > s.seconds + 0.4 ? T.amber : T.dim }}>{s.voSeconds?.toFixed(1)}s / {s.seconds}s</span>
                    <audio src={s.voUrl} controls style={{ height: 28, width: 190 }} />
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                  <Btn onClick={() => goStage(6)}>Continue to assemble</Btn>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Stage 6: Assemble ───────────────────────────────────────── */}
        {view === 6 && (
          <section style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1fr) 320px' }}>
            <div style={{ ...panel, padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>The cut</h2>
              <div style={{ background: '#000', borderRadius: 10, aspectRatio: film.aspect === '16:9' ? '16/9' : '9/16', display: 'grid', placeItems: 'center', marginBottom: 12 }}>
                {master
                  ? <video src={master} controls style={{ width: '100%', height: '100%' }} />
                  : <span style={{ color: T.dim, fontSize: 13 }}>Assemble to see the film here</span>}
              </div>
              <Btn disabled={!allClips || busy === 'asm'} onClick={() => run('asm', async () => {
                const f = await effyApi.filmAssemble(id);
                qc.setQueryData(['film', id], f);
              })}>
                {busy === 'asm' ? <RefreshCw size={15} className="animate-spin" /> : <Layers size={15} />}
                {master ? 'Re-assemble' : 'Assemble the film'}
              </Btn>
              {!allClips && <p style={{ fontSize: 12, color: T.dim, marginTop: 8 }}>Animate every scene first.</p>}
              {qa && (
                <div style={{
                  marginTop: 14, padding: '10px 14px', borderRadius: 10, fontSize: 12.5,
                  background: T.raised, borderLeft: `3px solid ${qa.status === 'audio_clean' ? T.green : T.amber}`,
                }}>
                  <strong>{qa.status === 'audio_clean' ? 'Final audio QA passed' : 'Final audio QA — check before delivery'}</strong>
                  <span style={{ color: T.dim }}> (AI-checked; give it one human listen too)</span>
                  <div style={{ color: T.dim, marginTop: 4 }}>{qa.note} · {qa.durationS}s</div>
                </div>
              )}
            </div>
            <div style={{ ...panel, padding: 20, alignSelf: 'start' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>End card</h3>
              {[['headline', film.endCard?.headline ?? film.product ?? '', 'Headline'],
                ['sub', film.endCard?.sub ?? '', 'Sub-line (e.g. dealer CTA)']].map(([k, val, ph]) => (
                <input key={k} defaultValue={val} placeholder={ph}
                  onBlur={(e) => patch.mutate({ endCard: { [k]: e.target.value } })}
                  style={{ ...inputStyle, marginBottom: 8 }} />
              ))}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                {[['bg', film.endCard?.bg || '#123B8F'], ['accent', film.endCard?.accent || '#FFD500']].map(([k, val]) => (
                  <label key={k} style={{ fontSize: 11.5, color: T.dim, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {k === 'bg' ? 'Background' : 'Accent'}
                    <input type="color" defaultValue={val}
                      onBlur={(e) => patch.mutate({ endCard: { [k]: e.target.value } })}
                      style={{ width: 30, height: 24, background: 'none', border: 'none', cursor: 'pointer' }} />
                  </label>
                ))}
              </div>
              <p style={{ fontSize: 11, color: T.dim, marginTop: 10 }}>
                Brand-derived palette colors make a good background/accent pair. Re-assemble after changes.
              </p>
            </div>
          </section>
        )}

        {/* ── Stage 7: Deliver ────────────────────────────────────────── */}
        {view === 7 && (
          <section style={{ ...panel, padding: 20, maxWidth: 700 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Deliver</h2>
            <p style={{ fontSize: 12.5, color: T.dim, marginBottom: 14 }}>
              Exports are auto-filed into the Media Library, reusable across posts and campaigns.
            </p>
            {!master && <p style={{ fontSize: 13, color: T.amber }}>Assemble the film first (stage 6).</p>}
            {master && (
              <>
                <Btn disabled={busy === 'exp'} onClick={() => run('exp', async () => {
                  const f = await effyApi.filmExports(id);
                  qc.setQueryData(['film', id], f);
                })} style={{ marginBottom: 16 }}>
                  {busy === 'exp' ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
                  {film.status === 'delivered' ? 'Rebuild exports' : 'Build exports & mark delivered'}
                </Btn>
                <div style={{ display: 'grid', gap: 8 }}>
                  {[['master', 'Master ' + film.aspect], ['reel', '9:16 Reel'], ['whatsapp', 'WhatsApp 480p']].map(([k, label]) => (
                    film.renders?.[k] && typeof film.renders[k] === 'string' && (
                      <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.raised, borderRadius: 10, padding: '10px 14px' }}>
                        <Play size={14} color={T.dim} />
                        <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{label}</span>
                        <button type="button" title="Copy link"
                          onClick={() => { navigator.clipboard?.writeText(film.renders[k]); setNotice({ kind: 'warn', text: `${label} link copied.` }); }}
                          style={{ background: 'none', color: T.dim, cursor: 'pointer', fontSize: 12.5, fontWeight: 600 }}>
                          Copy link
                        </button>
                        <a href={film.renders[k]} target="_blank" rel="noreferrer" style={{ color: T.coral, fontSize: 12.5, fontWeight: 600, display: 'inline-flex', gap: 5, alignItems: 'center' }}>
                          <Download size={13} /> Download
                        </a>
                      </div>
                    )
                  ))}
                </div>

                {/* Dealer personalization: scene renders are reused — each
                    variant only rebuilds the end card, so extra dealers are free. */}
                <div style={{ background: T.raised, borderRadius: 12, padding: 14, marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.dim, letterSpacing: '.05em', marginBottom: 6 }}>
                    DEALER VERSIONS
                  </div>
                  <p style={{ fontSize: 11.5, color: T.dim, marginBottom: 10 }}>
                    One dealer per line as <em>Name, Shop, City</em>. Each gets the same film with a personalized
                    end card — no extra AI spend (up to 10 per run).
                  </p>
                  <textarea value={dealerText} onChange={(e) => setDealerText(e.target.value)} rows={3}
                    placeholder={'Sharma Hardware, Sharma Traders, Pune\nGupta Paints, Gupta & Sons, Nagpur'}
                    style={{ ...inputStyle, background: T.surface, resize: 'vertical', marginBottom: 8 }} />
                  <Btn kind="quiet" disabled={busy === 'pers' || !dealerText.trim()} onClick={() => run('pers', async () => {
                    const dealers = dealerText.split('\n').map((l) => {
                      const [name, shop, city] = l.split(',').map((x) => x.trim());
                      return name ? { name, shop: shop || '', city: city || '' } : null;
                    }).filter(Boolean);
                    const r = await effyApi.filmPersonalize(id, dealers);
                    qc.setQueryData(['film', id], r.film);
                  })}>
                    {busy === 'pers' ? <RefreshCw size={14} className="animate-spin" /> : <Layers size={14} />}
                    Build dealer versions
                  </Btn>
                  {(film.renders?.personalized || []).length > 0 && (
                    <div style={{ display: 'grid', gap: 6, marginTop: 10 }}>
                      {film.renders.personalized.map((p) => (
                        <div key={p.media} style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.surface, borderRadius: 8, padding: '8px 12px' }}>
                          <span style={{ fontSize: 12.5, fontWeight: 600, flex: 1 }}>{p.name}</span>
                          <a href={p.url} target="_blank" rel="noreferrer" style={{ color: T.coral, fontSize: 12, fontWeight: 600, display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                            <Download size={12} /> Download
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
