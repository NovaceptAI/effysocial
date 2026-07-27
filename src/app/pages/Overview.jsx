import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity, ArrowRight, BarChart3, CircleDollarSign, ImageIcon,
  Library, Megaphone, Play, Plug, Rocket, Sparkles, TrendingUp, Users, Wand2,
} from 'lucide-react';
import { useWorkspace, inr, num } from '../context/WorkspaceContext';
import { usePosts } from '../api/hooks';
import { effyApi } from '../api/effyApi';
import { Badge, Button, Card, MetricCard, PageHeader, Pacing, StatusBadge } from '../../ui';

// Agency overview (spec §7.2) — org-wide rollup across all client workspaces.
function AgencyOverview({ onSwitchView }) {
  const { org, workspaces, setWorkspaceId } = useWorkspace();
  const totals = workspaces.reduce((t, w) => ({
    spend: t.spend + (w.monthlySpend || 0), leads: t.leads + (w.leads || 0),
    approvals: t.approvals + (w.approvals || 0), alerts: t.alerts + (w.alerts || 0),
  }), { spend: 0, leads: 0, approvals: 0, alerts: 0 });

  return (
    <div>
      <PageHeader
        title={`${org.name} — all clients`}
        subtitle={`${workspaces.length} workspaces under management`}
        actions={<Button variant="secondary" onClick={onSwitchView}>Client view</Button>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Spend under management" value={inr(totals.spend)} hint="per month" />
        <MetricCard label="Leads (all clients)" value={num(totals.leads)} hint="all time" />
        <MetricCard label="Pending approvals" value={num(totals.approvals)} hint="across clients" />
        <MetricCard label="Active alerts" value={num(totals.alerts)} hint="needs action" />
      </div>
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-ink">Clients</h3>
          <Link to="/app/clients" className="text-xs font-bold text-coral-ink">Full client list →</Link>
        </div>
        <ul className="divide-y divide-line">
          {workspaces.map((w) => (
            <li key={w.id}>
              <button onClick={() => { setWorkspaceId(w.id); onSwitchView(); }} className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-surface2/60 rounded-lg px-2 -mx-2">
                <span className="grid place-items-center w-8 h-8 rounded-lg text-base" style={{ background: w.accent + '22' }}>{w.logo}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-ink truncate">{w.name}</span>
                  <span className="block text-xs text-ink-faint">{w.industry || '—'}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-ink-faint" />
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

const POST_ART = {
  instagram: '/formats/ig_post.jpg',
  facebook: '/formats/fb_post.jpg',
  linkedin: '/formats/li_post.jpg',
  youtube: '/formats/yt_short.jpg',
  whatsapp: '/formats/wa_promo.jpg',
  twitter: '/formats/x_post.jpg',
  x: '/formats/x_post.jpg',
};

const CAMPAIGN_STATUSES = ['live', 'active'];
const PUBLISHED_STATUSES = ['published', 'live'];

function HeroCard({ className = '', image, eyebrow, title, body, to, cta, icon: Icon, accent = false, children }) {
  return (
    <Card className={`group relative min-h-[330px] overflow-hidden border border-line/70 ${className}`}>
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
      />
      <div className={`absolute inset-0 ${accent
        ? 'bg-gradient-to-br from-[#2a0f0a]/95 via-[#3a1711]/80 to-[#120c0a]/35'
        : 'bg-gradient-to-t from-black/95 via-black/55 to-black/10'}`}
      />
      <div className="relative flex min-h-[330px] flex-col justify-between p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <Badge className="border border-white/20 bg-black/35 text-white backdrop-blur-md">{eyebrow}</Badge>
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/20 bg-black/30 text-white backdrop-blur-md">
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <div className="max-w-xl">
          {children}
          <h2 className="font-display text-3xl font-semibold leading-[1.02] tracking-tight text-white sm:text-[2.15rem]">{title}</h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75 sm:text-[0.95rem]">{body}</p>
          <Link
            to={to}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#201a17] shadow-lg transition hover:-translate-y-0.5 hover:bg-white/95"
          >
            {cta} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

function CreationCard({ item }) {
  const isMedia = item.itemType === 'media';
  const isVideo = isMedia && item.kind === 'video';
  const art = isMedia ? item.url : (POST_ART[(item.channel || '').toLowerCase()] || '/formats/ig_post.jpg');
  const title = isMedia ? (item.name || item.prompt || 'Untitled creation') : (item.title || 'Untitled post');
  const meta = isMedia ? (item.source || item.kind || 'AI Studio') : (item.status || item.channel || 'Post');
  const destination = isMedia ? `/app/studio?image=${encodeURIComponent(item.url || '')}` : '/app/calendar';

  return (
    <Link to={destination} className="group block min-w-0">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink shadow-e1 transition group-hover:-translate-y-1 group-hover:shadow-e3">
        {isVideo ? (
          <video
            src={art}
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
            onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
          />
        ) : (
          <img src={art} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" />
        <span className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-lg bg-black/45 text-white backdrop-blur-md">
          {isVideo ? <Play className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <p className="truncate text-sm font-bold text-white">{title}</p>
          <p className="mt-0.5 truncate text-[0.7rem] font-semibold capitalize text-white/65">{String(meta).replace('_', ' ')}</p>
        </div>
      </div>
    </Link>
  );
}

function JourneyStep({ number, icon: Icon, title, body, to, active }) {
  return (
    <Link to={to} className="group flex min-w-0 flex-1 items-start gap-3 rounded-2xl p-3 transition hover:bg-surface2">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${active ? 'bg-coral text-white shadow-coral' : 'bg-surface2 text-ink-soft'}`}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-ink-faint">Step {number}</span>
        <span className="mt-0.5 block text-sm font-bold text-ink">{title}</span>
        <span className="mt-1 block text-xs leading-relaxed text-ink-faint">{body}</span>
      </span>
    </Link>
  );
}

function AnalyticsLink({ to, icon: Icon, title, body }) {
  return (
    <Link to={to} className="group flex items-center gap-3 rounded-2xl border border-line/70 bg-surface p-4 shadow-e1 transition hover:-translate-y-0.5 hover:shadow-e2">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-coral-tint text-coral-ink">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-ink">{title}</span>
        <span className="block truncate text-xs text-ink-faint">{body}</span>
      </span>
      <ArrowRight className="h-4 w-4 text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-coral-ink" />
    </Link>
  );
}

export default function Overview() {
  const { workspace, org } = useWorkspace();
  const isAgency = org?.type === 'agency';
  const [view, setView] = useState(isAgency ? 'agency' : 'client');

  const { data: posts = [] } = usePosts(workspace);
  const { data: media = [] } = useQuery({
    queryKey: ['media', workspace?.id, ''],
    queryFn: () => effyApi.listMedia(workspace.id),
    enabled: !!workspace,
  });
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns', workspace?.id],
    queryFn: () => effyApi.listCampaigns(workspace.id),
    enabled: !!workspace,
  });
  const { data: leads = [] } = useQuery({
    queryKey: ['leads', workspace?.id],
    queryFn: () => effyApi.listLeads(workspace.id),
    enabled: !!workspace,
  });
  const { data: ads } = useQuery({
    queryKey: ['ads', workspace?.id],
    queryFn: () => effyApi.adsDashboard(workspace.id),
    enabled: !!workspace,
  });

  if (isAgency && view === 'agency') return <AgencyOverview onSwitchView={() => setView('client')} />;

  const recentCreations = [
    ...media.map((item) => ({ ...item, itemType: 'media' })),
    ...posts.map((item) => ({ ...item, itemType: 'post' })),
  ].slice(0, 6);
  const recentCampaigns = campaigns.slice(0, 3);
  const activeCampaigns = campaigns.filter((campaign) => CAMPAIGN_STATUSES.includes(campaign.status)).length;
  const publishedPosts = posts.filter((post) => PUBLISHED_STATUSES.includes(post.status)).length;
  const connectedAds = ['meta', 'google'].includes(ads?.provider) && ads?.totals;
  const analyticsAvailable = connectedAds || posts.length > 0 || campaigns.length > 0 || leads.length > 0;

  return (
    <div>
      {isAgency && (
        <button onClick={() => setView('agency')} className="mb-3 text-sm font-bold text-coral-ink">← Agency overview</button>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-coral-ink">Create → promote → grow</p>
          <h1 className="font-display text-[2rem] font-semibold leading-tight tracking-tightest text-ink">Dashboard</h1>
          <p className="mt-1.5 text-sm text-ink-soft">Start with standout content, then turn the winners into performance campaigns.</p>
        </div>
        <Link to="/app/studio">
          <Button variant="spark" size="lg"><Sparkles className="h-4 w-4" /> Create with AI</Button>
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <HeroCard
          className="xl:col-span-7"
          image="/formats/ig_reel.jpg"
          eyebrow="Start here · AI Studio"
          title="Make scroll-stopping content in minutes"
          body="Create on-brand images, reels, stories and posts. Your best creative is already one click away from becoming a campaign."
          to="/app/studio"
          cta="Open AI Studio"
          icon={Wand2}
        >
          <div className="mb-4 flex -space-x-2">
            {['/formats/ig_post.jpg', '/formats/yt_short.jpg', '/formats/li_post.jpg'].map((src) => (
              <img key={src} src={src} alt="" className="h-11 w-11 rounded-xl border-2 border-white/50 object-cover shadow-lg" />
            ))}
            <span className="grid h-11 w-11 place-items-center rounded-xl border-2 border-white/50 bg-white text-xs font-extrabold text-coral-ink shadow-lg">AI</span>
          </div>
        </HeroCard>

        <HeroCard
          className="xl:col-span-5"
          image="/formats/fb_post.jpg"
          eyebrow="Next · Performance Marketing"
          title="Turn great creative into growth"
          body="Build a complete campaign with channels, ads, lead capture and measurement connected from day one."
          to="/app/workflows"
          cta="Start a campaign"
          icon={Rocket}
          accent
        />
      </div>

      <Card className="mb-8 border border-line/70 p-3 sm:p-4">
        <div className="grid grid-cols-1 items-stretch md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <JourneyStep number="1" icon={Wand2} title="Create in AI Studio" body="Generate the content and creative that earns attention." to="/app/studio" active />
          <ArrowRight className="mx-2 hidden h-4 w-4 self-center text-ink-faint md:block" />
          <JourneyStep number="2" icon={Megaphone} title="Build a campaign" body="Choose channels, attach creative and define the outcome." to="/app/workflows" />
          <ArrowRight className="mx-2 hidden h-4 w-4 self-center text-ink-faint md:block" />
          <JourneyStep number="3" icon={TrendingUp} title="Measure and improve" body="Follow leads, spend and revenue back to the creative." to="/app/analytics/ads" />
        </div>
      </Card>

      <section className="mb-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-ink-faint">Your work</p>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-ink">Recently created</h2>
          </div>
          <Link to="/app/media" className="inline-flex items-center gap-1.5 text-xs font-bold text-coral-ink">
            Open media library <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {recentCreations.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {recentCreations.map((item) => <CreationCard key={`${item.itemType}-${item.id}`} item={item} />)}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center border border-dashed border-line px-6 py-12 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-coral-tint text-coral-ink"><Library className="h-5 w-5" /></span>
            <h3 className="mt-3 text-sm font-bold text-ink">Your creations will appear here</h3>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-faint">Generate your first image, reel or post in AI Studio and it will be ready to reuse in campaigns.</p>
            <Link to="/app/studio" className="mt-4"><Button size="sm"><Wand2 className="h-3.5 w-3.5" /> Create something</Button></Link>
          </Card>
        )}
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-ink-faint">Performance marketing</p>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-ink">Campaign activity</h2>
          </div>
          <Link to="/app/campaigns" className="inline-flex items-center gap-1.5 text-xs font-bold text-coral-ink">
            View all campaigns <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {recentCampaigns.length ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {recentCampaigns.map((campaign) => {
              const budget = Number(campaign.budget || 0);
              const spent = Number(campaign.spent || 0);
              return (
                <Link key={campaign.id} to={`/app/campaigns/${campaign.id}`}>
                  <Card className="h-full border border-line/70 p-5 transition hover:-translate-y-0.5 hover:shadow-e3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-coral-tint text-coral-ink"><Megaphone className="h-[18px] w-[18px]" /></span>
                      <StatusBadge status={campaign.status} />
                    </div>
                    <h3 className="mt-4 truncate text-base font-bold text-ink">{campaign.name}</h3>
                    <p className="mt-1 truncate text-xs capitalize text-ink-faint">
                      {(campaign.channels || []).join(' · ') || campaign.objective || 'Campaign'}
                    </p>
                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-[0.7rem] font-semibold text-ink-faint">
                        <span>Spend</span>
                        <span className="tabular-nums">{inr(spent)} / {inr(budget)}</span>
                      </div>
                      <Pacing value={spent} max={budget} tone={budget > 0 && spent / budget > 0.9 ? 'warning' : 'coral'} />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="grid gap-5 overflow-hidden border border-line/70 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <h3 className="font-display text-xl font-semibold tracking-tight text-ink">Ready to promote your best creative?</h3>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">Start a guided campaign and connect your creative to ads, landing pages, leads and reporting.</p>
            </div>
            <Link to="/app/workflows"><Button><Rocket className="h-4 w-4" /> Start a campaign</Button></Link>
          </Card>
        )}
      </section>

      <section>
        <div className="mb-4">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-ink-faint">Analytics</p>
          <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-ink">What is working</h2>
        </div>

        {connectedAds ? (
          <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard label="Ad spend" value={inr(ads.totals.spend)} hint={`Budget ${inr(ads.totals.budget)}`} />
            <MetricCard label="Leads" value={num(ads.totals.leads)} hint={`CPL ${inr(ads.totals.cpl, { compact: false })}`} />
            <MetricCard label="ROAS" value={`${ads.totals.roas}×`} hint="blended performance" />
            <MetricCard label="CTR" value={`${ads.totals.ctr}%`} hint="across active ads" />
          </div>
        ) : (
          <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard label="Creative assets" value={num(media.length)} hint="in your media library" />
            <MetricCard label="Published posts" value={num(publishedPosts)} hint={`${num(posts.length)} total posts`} />
            <MetricCard label="Active campaigns" value={num(activeCampaigns)} hint={`${num(campaigns.length)} total campaigns`} />
            <MetricCard label="Leads" value={num(leads.length)} hint="in your pipeline" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <AnalyticsLink to="/app/analytics/organic" icon={BarChart3} title="Organic content" body="Reach, engagement and growth" />
          <AnalyticsLink to="/app/analytics/ads" icon={Activity} title="Ad performance" body="Spend, CPL, CTR and ROAS" />
          <AnalyticsLink to="/app/analytics/leads" icon={Users} title="Lead analytics" body="Sources, quality and conversion" />
          <AnalyticsLink to="/app/analytics/revenue" icon={CircleDollarSign} title="Revenue" body="Attribution and return" />
        </div>

        {!connectedAds && analyticsAvailable && (
          <Card className="mt-4 flex flex-col gap-3 border border-line/70 p-4 sm:flex-row sm:items-center">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface2 text-ink-soft"><Plug className="h-[18px] w-[18px]" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">Connect an ad account for live performance</p>
              <p className="mt-0.5 text-xs text-ink-faint">Bring spend, CPL and ROAS into this dashboard without changing your existing campaign setup.</p>
            </div>
            <Link to="/app/integrations" className="shrink-0 text-xs font-bold text-coral-ink">Connect channels →</Link>
          </Card>
        )}
      </section>
    </div>
  );
}
