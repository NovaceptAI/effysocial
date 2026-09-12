import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { ThemeProvider } from './context/ThemeContext';
import { NAV_ITEMS } from './nav';
import AppShell from './shell/AppShell';
import AppLauncher from './pages/AppLauncher';
import Overview from './pages/Overview';
import Clients from './pages/Clients';
import Campaigns from './pages/Campaigns';
import CampaignWorkspace from './pages/CampaignWorkspace';
import BrandBrain from './pages/BrandBrain';
import AIStudio from './pages/AIStudio';
import Calendar from './pages/Calendar';
import Scheduled from './pages/Scheduled';
import Approvals from './pages/Approvals';
import Published from './pages/Published';
import Inbox from './pages/Inbox';
import Reviews from './pages/Reviews';
import OrganicAnalytics from './pages/OrganicAnalytics';
import Reports from './pages/Reports';
import Integrations from './pages/Integrations';
import Team from './pages/Team';
import MarketingPlan from './pages/MarketingPlan';
import Trends from './pages/Trends';
import Competitors from './pages/Competitors';
import SocialListening from './pages/SocialListening';
import Ideas from './pages/Ideas';
import MediaLibrary from './pages/MediaLibrary';
import Templates from './pages/Templates';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import Comments from './pages/Comments';
import EngageLeads from './pages/EngageLeads';
import WorkspaceSelect from './pages/WorkspaceSelect';
import Pipeline from './pages/Pipeline';
import LeadDetail from './pages/LeadDetail';
import Forms from './pages/Forms';
import Playbooks from './pages/Playbooks';
import Workflows from './pages/Workflows';
import WorkflowRunner from './pages/WorkflowRunner';
import Admin from './pages/Admin';
import CampaignLaunch from './pages/CampaignLaunch';
import LandingPages from './pages/LandingPages';
import SiteBuilder from './pages/SiteBuilder';
import Blog from './pages/Blog';
import WhatsNew from './pages/WhatsNew';
import PricingApp from './pages/PricingApp';
import Films from './pages/Films';
import FilmMaker from './pages/FilmMaker';
import Tracking from './pages/Tracking';
import Followups from './pages/Followups';
import BioPages from './pages/BioPages';
import AdsDashboard from './pages/AdsDashboard';
import Creatives from './pages/Creatives';
import Audiences from './pages/Audiences';
import Budgets from './pages/Budgets';
import Rules from './pages/Rules';
import AdsAnalytics from './pages/AdsAnalytics';
import LeadAnalytics from './pages/LeadAnalytics';
import RevenueAnalytics from './pages/RevenueAnalytics';
import CreativeAnalytics from './pages/CreativeAnalytics';
import ModulePlaceholder from './pages/ModulePlaceholder';

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
  '/app/analytics/creative',
]);

// Strip the "/app" prefix to get the nested route path for each nav item.
const childPath = (to) => (to === '/app' ? '' : to.replace(/^\/app\//, ''));

export default function AppRoot() {
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
            {NAV_ITEMS.filter((i) => !BUILT.has(i.to)).map((i) => (
              <Route key={i.to} path={childPath(i.to)} element={<ModulePlaceholder />} />
            ))}
            <Route path="*" element={<ModulePlaceholder />} />
          </Route>
          {/* The film Maker is a deliberate full-screen theatre takeover. */}
          <Route path="films/:id" element={<FilmMaker />} />
        </Routes>
      </WorkspaceProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
