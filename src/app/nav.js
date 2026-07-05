import {
  Home, ClipboardList, Megaphone, TrendingUp, Swords, Radio,
  Lightbulb, Wand2, Images, LayoutTemplate, Brain,
  Calendar, Clock3, CheckSquare, Send,
  Inbox, MessageSquare, Star, UserPlus,
  Target, Palette, UsersRound, Wallet, Zap,
  Globe, FileInput, GitBranch, Repeat2, Crosshair, AtSign,
  BarChart3, LineChart, PieChart, IndianRupee, ImagePlay, FileBarChart,
  Building2, Users, Plug, CreditCard, Settings,
} from 'lucide-react';

// phase: 1 available now, 2/3/4 = labelled "soon" but navigable to a placeholder.
export const NAV = [
  { group: 'Overview', items: [
    { label: 'Home', to: '/app', icon: Home, phase: 1, end: true },
  ]},
  { group: 'Strategy', items: [
    { label: 'Marketing Plan', to: '/app/plan', icon: ClipboardList, phase: 1 },
    { label: 'Campaigns', to: '/app/campaigns', icon: Megaphone, phase: 1 },
    { label: 'Trends', to: '/app/trends', icon: TrendingUp, phase: 1 },
    { label: 'Competitors', to: '/app/competitors', icon: Swords, phase: 1 },
    { label: 'Social Listening', to: '/app/listening', icon: Radio, phase: 1 },
  ]},
  { group: 'Content', items: [
    { label: 'Ideas', to: '/app/ideas', icon: Lightbulb, phase: 1 },
    { label: 'AI Studio', to: '/app/studio', icon: Wand2, phase: 1 },
    { label: 'Media Library', to: '/app/media', icon: Images, phase: 1 },
    { label: 'Templates', to: '/app/templates', icon: LayoutTemplate, phase: 1 },
    { label: 'Brand Brain', to: '/app/brand', icon: Brain, phase: 1 },
  ]},
  { group: 'Publish', items: [
    { label: 'Calendar', to: '/app/calendar', icon: Calendar, phase: 1 },
    { label: 'Scheduled', to: '/app/scheduled', icon: Clock3, phase: 1 },
    { label: 'Approvals', to: '/app/approvals', icon: CheckSquare, phase: 1, badge: 3 },
    { label: 'Published', to: '/app/published', icon: Send, phase: 1 },
  ]},
  { group: 'Engage', items: [
    { label: 'Unified Inbox', to: '/app/inbox', icon: Inbox, phase: 1, badge: 5 },
    { label: 'Comments', to: '/app/comments', icon: MessageSquare, phase: 1 },
    { label: 'Reviews', to: '/app/reviews', icon: Star, phase: 1 },
    { label: 'Leads', to: '/app/engage-leads', icon: UserPlus, phase: 1 },
  ]},
  { group: 'Advertise', items: [
    { label: 'Campaigns', to: '/app/ads', icon: Target, phase: 2 },
    { label: 'Creatives', to: '/app/creatives', icon: Palette, phase: 2 },
    { label: 'Audiences', to: '/app/audiences', icon: UsersRound, phase: 3 },
    { label: 'Budgets', to: '/app/budgets', icon: Wallet, phase: 3 },
    { label: 'Automated Rules', to: '/app/rules', icon: Zap, phase: 3 },
  ]},
  { group: 'Convert', items: [
    { label: 'Landing Pages', to: '/app/landing', icon: Globe, phase: 2 },
    { label: 'Link-in-bio', to: '/app/bio', icon: AtSign, phase: 2 },
    { label: 'Forms', to: '/app/forms', icon: FileInput, phase: 2 },
    { label: 'Lead Pipeline', to: '/app/pipeline', icon: GitBranch, phase: 2 },
    { label: 'Follow-ups', to: '/app/followups', icon: Repeat2, phase: 2 },
    { label: 'Conversion Tracking', to: '/app/tracking', icon: Crosshair, phase: 2 },
  ]},
  { group: 'Analytics', items: [
    { label: 'Organic', to: '/app/analytics/organic', icon: BarChart3, phase: 1 },
    { label: 'Advertising', to: '/app/analytics/ads', icon: LineChart, phase: 2 },
    { label: 'Leads', to: '/app/analytics/leads', icon: PieChart, phase: 2 },
    { label: 'Revenue', to: '/app/analytics/revenue', icon: IndianRupee, phase: 2 },
    { label: 'Creative Performance', to: '/app/analytics/creative', icon: ImagePlay, phase: 2 },
    { label: 'Reports', to: '/app/reports', icon: FileBarChart, phase: 1 },
  ]},
  { group: 'Administration', items: [
    { label: 'Clients', to: '/app/clients', icon: Building2, phase: 1 },
    { label: 'Team', to: '/app/team', icon: Users, phase: 1 },
    { label: 'Integrations', to: '/app/integrations', icon: Plug, phase: 1 },
    { label: 'Billing', to: '/app/billing', icon: CreditCard, phase: 1 },
    { label: 'Settings', to: '/app/settings', icon: Settings, phase: 1 },
  ]},
];

// Flat lookup for the command palette + breadcrumbs
export const NAV_ITEMS = NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.group })));
