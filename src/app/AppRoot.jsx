import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { ThemeProvider } from './context/ThemeContext';
import { NAV_ITEMS } from './nav';
import AppShell from './shell/AppShell';
import NoOrganisation from './pages/NoOrganisation';
import { useAppAuth } from './context/AppAuth';

// Every page is its own chunk, loaded when first opened (G45).
const AppLauncher = lazy(() => import('./pages/AppLauncher'));
const Overview = lazy(() => import('./pages/Overview'));
const Clients = lazy(() => import('./pages/Clients'));
const Campaigns = lazy(() => import('./pages/Campaigns'));
const CampaignWorkspace = lazy(() => import('./pages/CampaignWorkspace'));
const BrandBrain = lazy(() => import('./pages/BrandBrain'));
const AIStudio = lazy(() => import('./pages/AIStudio'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Scheduled = lazy(() => import('./pages/Scheduled'));
const Approvals = lazy(() => import('./pages/Approvals'));
const Published = lazy(() => import('./pages/Published'));
const Inbox = lazy(() => import('./pages/Inbox'));
const Reviews = lazy(() => import('./pages/Reviews'));
const OrganicAnalytics = lazy(() => import('./pages/OrganicAnalytics'));
const Reports = lazy(() => import('./pages/Reports'));
const Integrations = lazy(() => import('./pages/Integrations'));
const GoogleBusiness = lazy(() => import('./pages/GoogleBusiness'));
const Team = lazy(() => import('./pages/Team'));
const MarketingPlan = lazy(() => import('./pages/MarketingPlan'));
const Trends = lazy(() => import('./pages/Trends'));
const Competitors = lazy(() => import('./pages/Competitors'));
const SocialListening = lazy(() => import('./pages/SocialListening'));
const Ideas = lazy(() => import('./pages/Ideas'));
const MediaLibrary = lazy(() => import('./pages/MediaLibrary'));
const Templates = lazy(() => import('./pages/Templates'));
const Billing = lazy(() => import('./pages/Billing'));
const Settings = lazy(() => import('./pages/Settings'));
const Comments = lazy(() => import('./pages/Comments'));
const EngageLeads = lazy(() => import('./pages/EngageLeads'));
const WorkspaceSelect = lazy(() => import('./pages/WorkspaceSelect'));
const Pipeline = lazy(() => import('./pages/Pipeline'));
const LeadDetail = lazy(() => import('./pages/LeadDetail'));
const Forms = lazy(() => import('./pages/Forms'));
const Playbooks = lazy(() => import('./pages/Playbooks'));
const Workflows = lazy(() => import('./pages/Workflows'));
const WorkflowRunner = lazy(() => import('./pages/WorkflowRunner'));
const Admin = lazy(() => import('./pages/Admin'));
const CampaignLaunch = lazy(() => import('./pages/CampaignLaunch'));
const LandingPages = lazy(() => import('./pages/LandingPages'));
const SiteBuilder = lazy(() => import('./pages/SiteBuilder'));
const Blog = lazy(() => import('./pages/Blog'));
const WhatsNew = lazy(() => import('./pages/WhatsNew'));
const PricingApp = lazy(() => import('./pages/PricingApp'));
const Films = lazy(() => import('./pages/Films'));
const FilmMaker = lazy(() => import('./pages/FilmMaker'));
const Tracking = lazy(() => import('./pages/Tracking'));
const Followups = lazy(() => import('./pages/Followups'));
const BioPages = lazy(() => import('./pages/BioPages'));
const AdsDashboard = lazy(() => import('./pages/AdsDashboard'));
const Creatives = lazy(() => import('./pages/Creatives'));
const Audiences = lazy(() => import('./pages/Audiences'));
const Budgets = lazy(() => import('./pages/Budgets'));
const Rules = lazy(() => import('./pages/Rules'));
const AdsAnalytics = lazy(() => import('./pages/AdsAnalytics'));
const LeadAnalytics = lazy(() => import('./pages/LeadAnalytics'));
const RevenueAnalytics = lazy(() => import('./pages/RevenueAnalytics'));
const CreativeAnalytics = lazy(() => import('./pages/CreativeAnalytics'));
const Acceptance = lazy(() => import('./pages/Acceptance'));
const ModulePlaceholder = lazy(() => import('./pages/ModulePlaceholder'));

const queryClient = new QueryClient();

// Routes that are fully built (override the auto-generated placeholders).
const BUILT = new Set([
  '/app', '/app/home', '/app/clients', '/app/campaigns', '/app/brand', '/app/studio',
  '/app/calendar', '/app/scheduled', '/app/approvals', '/app/published',
  '/app/inbox', '/app/reviews', '/app/analytics/organic', '/app/reports',
  '/app/integrations', '/app/team',
  '/app/plan', '/app/trends', '/app/competitors', '/app/listening',
  '/app/ideas', '/app/media', '/app/templates', '/app/films',
  '/app/billing', '/app/settings', '/app/comments', '/app/engage-leads',
  '/app/pipeline', '/app/forms', '/app/ads', '/app/creatives', '/app/audiences', '/app/budgets', '/app/rules',
  '/app/playbooks', '/app/launch', '/app/landing', '/app/tracking',
  '/app/followups', '/app/bio',
  '/app/analytics/ads', '/app/analytics/leads', '/app/analytics/revenue',
  '/app/analytics/creative', '/app/analytics/acceptance',
]);

// Strip the "/app" prefix to get the nested route path for each nav item.
const childPath = (to) => (to === '/app' ? '' : to.replace(/^\/app\//, ''));

export default function AppRoot() {
  const { bootstrap } = useAppAuth();
  if (bootstrap && !bootstrap.org) return <NoOrganisation />;
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <WorkspaceProvider>
        <Routes>
          {/* One platform, one shell. The dashboard (/app) is home — four
              video cards that are simply entry points into the same menu:
              AI Studio, Ad Films, Brand Brain, Performance Marketing. */}
          <Route path="apps" element={<Navigate to="/app" replace />} />
          <Route path="studio-app" element={<Navigate to="/app/studio" replace />} />
          <Route path="films-app" element={<Navigate to="/app/films" replace />} />
          <Route path="films-app/:id" element={<Navigate to="/app/films" replace />} />

          <Route element={<AppShell />}>
            <Route index element={<AppLauncher />} />
            <Route path="studio" element={<AIStudio />} />
            <Route path="films" element={<Films />} />
            <Route path="home" element={<Overview />} />
            <Route path="clients" element={<Clients />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="campaigns/:id" element={<CampaignWorkspace />} />
            <Route path="brand" element={<BrandBrain />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="scheduled" element={<Scheduled />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="published" element={<Published />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="analytics/organic" element={<OrganicAnalytics />} />
            <Route path="reports" element={<Reports />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="google-business" element={<GoogleBusiness />} />
            <Route path="team" element={<Team />} />
            <Route path="plan" element={<MarketingPlan />} />
            <Route path="trends" element={<Trends />} />
            <Route path="competitors" element={<Competitors />} />
            <Route path="listening" element={<SocialListening />} />
            <Route path="ideas" element={<Ideas />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="blog" element={<Blog />} />
            <Route path="whats-new" element={<WhatsNew />} />
            <Route path="pricing" element={<PricingApp />} />
            <Route path="templates" element={<Templates />} />
            <Route path="billing" element={<Billing />} />
            <Route path="settings" element={<Settings />} />
            <Route path="comments" element={<Comments />} />
            <Route path="engage-leads" element={<EngageLeads />} />
            <Route path="workspaces" element={<WorkspaceSelect />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="pipeline/:id" element={<LeadDetail />} />
            <Route path="forms" element={<Forms />} />
            <Route path="playbooks" element={<Playbooks />} />
            <Route path="workflows" element={<Workflows />} />
            <Route path="workflows/:id" element={<WorkflowRunner />} />
            <Route path="admin" element={<Admin />} />
            <Route path="launch" element={<CampaignLaunch />} />
            <Route path="landing" element={<LandingPages />} />
            <Route path="sites" element={<SiteBuilder />} />
            <Route path="tracking" element={<Tracking />} />
            <Route path="followups" element={<Followups />} />
            <Route path="bio" element={<BioPages />} />
            <Route path="ads" element={<AdsDashboard />} />
            <Route path="creatives" element={<Creatives />} />
            <Route path="audiences" element={<Audiences />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="rules" element={<Rules />} />
            <Route path="analytics/ads" element={<AdsAnalytics />} />
            <Route path="analytics/leads" element={<LeadAnalytics />} />
            <Route path="analytics/revenue" element={<RevenueAnalytics />} />
            <Route path="analytics/creative" element={<CreativeAnalytics />} />
            <Route path="analytics/acceptance" element={<Acceptance />} />
            {NAV_ITEMS.filter((i) => !BUILT.has(i.to)).map((i) => (
              <Route key={i.to} path={childPath(i.to)} element={<ModulePlaceholder />} />
            ))}
            <Route path="*" element={<ModulePlaceholder />} />
          </Route>
          {/* The film Maker is a deliberate full-screen theatre takeover. */}
          <Route path="films/:id" element={<Suspense fallback={<div className="min-h-dvh bg-[#0B0C0E]" />}><FilmMaker /></Suspense>} />
        </Routes>
      </WorkspaceProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
