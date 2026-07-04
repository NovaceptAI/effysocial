import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { NAV_ITEMS } from './nav';
import AppShell from './shell/AppShell';
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
import Forms from './pages/Forms';
import AdsDashboard from './pages/AdsDashboard';
import ModulePlaceholder from './pages/ModulePlaceholder';

const queryClient = new QueryClient();

// Routes that are fully built (override the auto-generated placeholders).
const BUILT = new Set([
  '/app', '/app/clients', '/app/campaigns', '/app/brand', '/app/studio',
  '/app/calendar', '/app/scheduled', '/app/approvals', '/app/published',
  '/app/inbox', '/app/reviews', '/app/analytics/organic', '/app/reports',
  '/app/integrations', '/app/team',
  '/app/plan', '/app/trends', '/app/competitors', '/app/listening',
  '/app/ideas', '/app/media', '/app/templates',
  '/app/billing', '/app/settings', '/app/comments', '/app/engage-leads',
  '/app/pipeline', '/app/forms', '/app/ads',
]);

// Strip the "/app" prefix to get the nested route path for each nav item.
const childPath = (to) => (to === '/app' ? '' : to.replace(/^\/app\//, ''));

export default function AppRoot() {
  return (
    <QueryClientProvider client={queryClient}>
      <WorkspaceProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Overview />} />
            <Route path="clients" element={<Clients />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="campaigns/:id" element={<CampaignWorkspace />} />
            <Route path="brand" element={<BrandBrain />} />
            <Route path="studio" element={<AIStudio />} />
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
            <Route path="templates" element={<Templates />} />
            <Route path="billing" element={<Billing />} />
            <Route path="settings" element={<Settings />} />
            <Route path="comments" element={<Comments />} />
            <Route path="engage-leads" element={<EngageLeads />} />
            <Route path="workspaces" element={<WorkspaceSelect />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="forms" element={<Forms />} />
            <Route path="ads" element={<AdsDashboard />} />
            {NAV_ITEMS.filter((i) => !BUILT.has(i.to)).map((i) => (
              <Route key={i.to} path={childPath(i.to)} element={<ModulePlaceholder />} />
            ))}
            <Route path="*" element={<ModulePlaceholder />} />
          </Route>
        </Routes>
      </WorkspaceProvider>
    </QueryClientProvider>
  );
}
