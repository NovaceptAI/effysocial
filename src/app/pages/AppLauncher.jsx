import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Wand2, Clapperboard, Target, ArrowRight, Clapperboard as FilmIcon, Package, Images, Play, Lock } from 'lucide-react';
import { useAppAuth } from '../context/AppAuth';
import { useWorkspace } from '../context/WorkspaceContext';
import { effyApi } from '../api/effyApi';
import { FEATURES, hasFeature } from '../plans';

// Post-login dashboard — three app cards (video-driven) + your recent work.
const APPS = [
  {
    key: 'studio', title: 'AI Studio', to: '/app/studio', icon: Wand2,
    video: '/landing/aistudio.mp4', poster: '',
    tagline: 'Posts, images, product shots & avatars',
  },
  {
    key: 'films', title: 'Ad Films', to: '/app/films', icon: Clapperboard,
    video: '/landing/adfilm.mp4', poster: '/formats/yt_short.jpg',
    tagline: 'A full ad film, brief to broadcast',
  },
  {
    key: 'pm', title: 'Performance Marketing', to: '/app/home', icon: Target, feature: 'marketing',
    video: '/landing/pm.mp4', poster: '/landing/pm-analytics.jpg',
    tagline: 'Campaigns, pipeline & analytics',
  },
];

const FILM_STATUS = { draft: 'Draft', production: 'In progress', delivered: 'Delivered' };

function SectionHead({ title, to, navigate }) {
  return (
    <div className="flex items-center justify-between mb-3 mt-10">
      <h2 className="font-display text-lg font-semibold tracking-tight text-ink">{title}</h2>
      {to && (
        <button type="button" onClick={() => navigate(to)} className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-ink bg-transparent">
          View all <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function AppLauncher() {
  const navigate = useNavigate();
  const { user } = useAppAuth();
  const { workspace, org, canManageWorkspaces, planInfo } = useWorkspace();
  const setupPending = canManageWorkspaces && org?.onboarding && !org.onboarding.completed;
  const first = (user?.name || '').trim().split(' ')[0];

  const { data: films = [] } = useQuery({ queryKey: ['films', workspace?.id], queryFn: () => effyApi.listFilms(workspace.id), enabled: !!workspace });
  const { data: shots = [] } = useQuery({ queryKey: ['product-shots', workspace?.id], queryFn: () => effyApi.listProductShots(workspace.id), enabled: !!workspace });
  const { data: media = [] } = useQuery({ queryKey: ['media', workspace?.id], queryFn: () => effyApi.listMedia(workspace.id), enabled: !!workspace });

  // Recent sessions = films + product-shot projects, newest first.
  const sessions = [
    ...films.map((f) => ({ id: `f${f.id}`, title: f.title || f.product || 'Untitled film', kind: 'Ad Film', icon: FilmIcon,
      thumb: f.posterUrl || '', status: FILM_STATUS[f.status] || 'Draft', at: f.updatedAt || f.createdAt, to: `/app/films/${f.id}` })),
    ...shots.map((s) => ({ id: `s${s.id}`, title: s.title || s.product || 'Product shot', kind: 'Product Shot', icon: Package,
      thumb: s.sourceUrl || '', status: s.status === 'delivered' ? 'Ready' : s.status === 'production' ? 'In progress' : 'Draft', at: s.updatedAt || s.createdAt, to: `/app/studio?productShot=${s.id}` })),
  ].sort((a, b) => String(b.at || '').localeCompare(String(a.at || ''))).slice(0, 4);

  const generations = media.filter((m) => m.url).slice(0, 8);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-7">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: '#FF6A5C' }}>EffySocial</div>
        <h1 className="font-display text-3xl sm:text-[2.1rem] font-semibold tracking-tight text-ink">
          {first ? `Welcome back, ${first}` : 'Welcome to EffySocial'}
        </h1>
        <p className="mt-2 text-ink-soft">Where do you want to start today?</p>
      </div>

      {setupPending && (
        <div role="region" aria-label="Finish setting up" className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
          <span className="flex-1 min-w-[200px] text-sm text-ink-soft">
            <span className="font-semibold text-ink">Finish setting up EffySocial.</span> Your answers so far are saved — pick up where you left off.
          </span>
          <button type="button" onClick={() => navigate('/onboarding')} className="inline-flex items-center gap-1 rounded-lg bg-coral px-3.5 py-2 text-xs font-bold text-white">
            Continue setup <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* App cards — 3 across, compact */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {APPS.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.key}
              className="group flex flex-col rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              style={{ background: '#141518', border: '1px solid #24262C', boxShadow: '0 10px 34px -20px rgba(0,0,0,0.85)' }}
              onClick={() => navigate(a.to)}>
              <div className="relative" style={{ aspectRatio: '16 / 10', background: '#0D0E12' }}>
                <video className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline poster={a.poster}>
                  <source src={a.video} type="video/mp4" />
                </video>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(20,21,24,0) 55%, rgba(20,21,24,0.9) 100%)' }} />
                <span className="absolute top-2.5 left-2.5 grid place-items-center w-8 h-8 rounded-lg bg-black/45 backdrop-blur-sm text-white">
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 p-4">
                <div className="min-w-0">
                  <h2 className="font-display text-[15px] font-semibold tracking-tight truncate">
                    {a.title}
                    {a.feature && !hasFeature(planInfo, a.feature) && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold align-middle"><Lock className="w-3 h-3" /> {FEATURES[a.feature].plan}</span>
                    )}
                  </h2>
                  <p className="text-[12px] mt-0.5 truncate" style={{ color: 'rgba(237,238,240,0.5)' }}>{a.tagline}</p>
                </div>
                <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: '#EDEEF0' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Sessions */}
      <SectionHead title="Recent sessions" to={sessions.length ? '/app/films' : null} navigate={navigate} />
      {sessions.length ? (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {sessions.map((s) => {
            const SIcon = s.icon;
            return (
              <button key={s.id} type="button" onClick={() => navigate(s.to)}
                className="text-left rounded-xl overflow-hidden bg-transparent transition hover:-translate-y-0.5"
                style={{ background: '#141518', border: '1px solid #24262C' }}>
                <div className="relative" style={{ aspectRatio: '16 / 10', background: '#0D0E12' }}>
                  {s.thumb ? <img src={s.thumb} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                    : <span className="absolute inset-0 grid place-items-center text-white/20"><SIcon className="w-6 h-6" /></span>}
                  <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-black/55 text-white/85 backdrop-blur-sm">{s.kind}</span>
                </div>
                <div className="p-2.5">
                  <div className="text-[13px] font-semibold text-ink truncate">{s.title}</div>
                  <div className="text-[11px] text-ink-faint">{s.status}</div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl p-6 text-sm text-ink-soft" style={{ background: '#141518', border: '1px solid #24262C' }}>
          Your recent films and product shots will appear here. Start one in <button onClick={() => navigate('/app/studio')} className="font-bold text-coral-ink bg-transparent">AI Studio</button> or <button onClick={() => navigate('/app/films')} className="font-bold text-coral-ink bg-transparent">Ad Films</button>.
        </div>
      )}

      {/* Recent Generations */}
      <SectionHead title="Recent generations" to={generations.length ? '/app/media' : null} navigate={navigate} />
      {generations.length ? (
        <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 lg:grid-cols-6">
          {generations.map((m) => (
            <button key={m.id} type="button" onClick={() => navigate('/app/media')} title={m.prompt || ''}
              className="relative rounded-lg overflow-hidden bg-transparent transition hover:-translate-y-0.5"
              style={{ aspectRatio: '1 / 1', background: '#0D0E12', border: '1px solid #24262C' }}>
              {m.kind === 'video'
                ? <video src={m.url} muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
                : <img src={m.url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />}
              {m.kind === 'video' && <span className="absolute bottom-1.5 right-1.5 grid place-items-center w-5 h-5 rounded-full bg-black/55 text-white"><Play className="w-3 h-3" /></span>}
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-xl p-6 text-sm text-ink-soft flex items-center gap-2" style={{ background: '#141518', border: '1px solid #24262C' }}>
          <Images className="w-4 h-4 text-ink-faint" /> Your generated images and videos will show up here.
        </div>
      )}
    </div>
  );
}
