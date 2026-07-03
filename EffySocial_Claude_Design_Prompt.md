# CLAUDE DESIGN MASTER PROMPT — EFFYSOCIAL

You are designing a complete, production-grade SaaS web application called **EffySocial**.

EffySocial is not merely an AI post generator or social-media scheduler. It is an **AI-powered social growth and performance marketing operating system** that takes a business from strategy and content creation to publishing, advertising, lead generation, conversion tracking, customer follow-up and revenue reporting.

## Core positioning

Use this positioning as the product’s strategic anchor:

> **Plan, create, publish, advertise and convert—from one AI-powered social growth platform.**

Alternative product line:

> **From your first post to your next paying customer.**

The product must visually and functionally communicate this connected journey:

**Strategy → Content → Publishing → Engagement → Advertising → Leads → Follow-up → Customer → Revenue attribution**

Do not design EffySocial as a collection of disconnected dashboards. Every major object—brand, campaign, content item, ad, landing page, lead, conversation and conversion—must be connected throughout the application.

---

# 1. YOUR ROLE AND EXPECTED OUTPUT

Act as a senior SaaS product designer, UX architect, design-system lead and growth-product strategist.

Create a complete application design, not a marketing landing-page mock-up.

The output must include:

1. A coherent design direction for the full product.
2. Complete information architecture and navigation.
3. Every primary screen described below.
4. High-fidelity desktop layouts for all major screens.
5. Responsive behaviour for tablet and mobile.
6. Reusable component system.
7. Empty, loading, error, success, permission-restricted and disconnected-integration states.
8. Realistic sample data so the product looks operational.
9. Clear user flows for organic social management and performance marketing.
10. Role-based experiences for agencies, businesses, clients and internal teams.
11. A practical phased implementation structure so the designs can be developed incrementally.

Do not omit a feature simply because the feature set is large. Organise the product intelligently and use progressive disclosure, tabs, drawers, command menus, filters and contextual panels to prevent clutter.

---

# 2. PRODUCT USERS

Design for the following users:

- Agency owner
- Business owner
- Workspace administrator
- Account manager
- Content strategist
- Copywriter
- Graphic designer
- Video creator
- Performance marketer
- Community manager
- Salesperson
- Analyst
- Client approver
- View-only stakeholder

The product should work for:

- A single small business managing its own social presence
- An agency managing many clients
- A distributed content and advertising team
- A client who only needs approvals and reports
- A sales team receiving social and advertising leads

---

# 3. EXPERIENCE PRINCIPLES

## 3.1 End-to-end, not tool-by-tool

A campaign should contain its strategy, target audience, content, ads, creatives, landing pages, forms, leads, conversion events, budget and final results.

## 3.2 Business outcomes over vanity metrics

Likes, reach and followers are useful, but the interface must consistently connect them to:

- Enquiries
- WhatsApp conversations
- Calls
- Forms submitted
- Appointments
- Qualified leads
- Customers
- Revenue
- Cost per lead
- Customer acquisition cost
- Return on ad spend

## 3.3 AI must explain itself

Do not use unexplained “AI scores.” Recommendations should include:

- What was detected
- Why it matters
- The recommended action
- Expected impact
- Confidence or evidence
- Whether the action needs approval

## 3.4 Human control over spend and publishing

AI can recommend, draft and automate, but campaign launches, material budget changes and sensitive public replies should have clear approval controls.

## 3.5 Agency-ready from the beginning

Multi-workspace switching, client permissions, approvals, white-labelled reports and account-level oversight are first-class product requirements.

## 3.6 India-first without appearing region-limited

Support workflows common to Indian SMBs and agencies:

- WhatsApp lead generation and follow-up
- Click-to-WhatsApp campaigns
- Phone-call leads
- Local businesses and appointment-based services
- English, Hindi, Hinglish and additional languages
- INR currency formatting
- Meta and Google advertising

The design must still feel globally competitive and suitable for international clients.

---

# 4. VISUAL DESIGN DIRECTION

Create a premium, modern B2B SaaS interface with the clarity of Linear and Vercel, the confidence of high-end analytics products, and enough visual warmth to feel creative rather than purely technical.

## Recommended appearance

- Desktop-first application shell
- Neutral near-white canvas in light mode
- Deep charcoal or near-black navigation rail
- Optional complete dark mode
- One primary electric accent—violet, indigo or blue-violet
- Supporting semantic colours only for success, warning, error and information
- Clean sans-serif typography
- Compact but breathable information density
- Strong hierarchy through typography, spacing and grouping rather than heavy borders
- Soft cards and panels with subtle elevation
- Charts that are clear, restrained and highly legible
- Rounded corners, but not overly playful
- High-quality icons with consistent stroke weight
- Real screenshots or realistic creative thumbnails instead of generic blank placeholders

## Avoid

- Excessive gradients
- Excessive glassmorphism
- Giant marketing-style cards inside the application
- Neon cyberpunk styling
- Heavy skeuomorphism
- Too many colours
- Dense enterprise tables without visual hierarchy
- Hiding all important actions inside three-dot menus
- Dashboard layouts that repeat the same metric-card pattern everywhere

## Density modes

Provide comfortable and compact density modes for agencies and power users.

---

# 5. GLOBAL APPLICATION SHELL

## 5.1 Left navigation

Use the following navigation structure:

### Overview
- Home / Overview

### Strategy
- Marketing Plan
- Campaigns
- Trends
- Competitors
- Social Listening

### Content
- Ideas
- AI Studio
- Media Library
- Templates
- Brand Brain

### Publish
- Calendar
- Scheduled
- Approvals
- Published

### Engage
- Unified Inbox
- Comments
- Reviews
- Leads

### Advertise
- Campaigns
- Creatives
- Audiences
- Budgets
- Automated Rules

### Convert
- Landing Pages
- Forms
- Lead Pipeline
- Follow-ups
- Conversion Tracking

### Analytics
- Organic
- Advertising
- Leads
- Revenue
- Creative Performance
- Reports

### Administration
- Clients
- Team
- Integrations
- Billing
- Settings

Use collapsible groups. Preserve the user’s last-open sections. Include notification badges where meaningful.

## 5.2 Top bar

Include:

- Global search / command palette
- Workspace and client switcher
- Current date range
- Create button
- AI assistant entry point
- Notifications
- Help
- User profile

The global Create button should open a menu for:

- Campaign
- Social post
- Ad creative
- Landing page
- Form
- Report
- Automation rule
- Client workspace

## 5.3 Contextual right panel

Use a right-side contextual panel for:

- AI recommendations
- Object details
- Comments
- Approval history
- Activity history
- Quick edits
- Performance explanations

This prevents users from constantly leaving their current workflow.

## 5.4 Global command palette

Support commands such as:

- Switch workspace
- Create post
- Create campaign
- Find a lead
- Open calendar
- Review approvals
- Connect an account
- Generate monthly report
- Ask Effy AI

---

# 6. ONBOARDING AND INITIAL SETUP

Design a guided onboarding flow that can be completed quickly but expanded later.

## Step 1: Organisation type

- Business
- Marketing agency
- Freelancer / consultant

## Step 2: Business or agency details

- Name
- Website
- Industry
- Primary location
- Time zone
- Currency
- Team size

## Step 3: Goals

- Increase awareness
- Grow engagement
- Generate leads
- Drive WhatsApp conversations
- Get phone calls
- Book appointments
- Increase ecommerce sales
- Improve customer care

## Step 4: Connect accounts

- Facebook
- Instagram
- LinkedIn
- X
- YouTube
- TikTok
- Google Business Profile
- Meta Ads
- Google Ads
- Google Analytics 4
- CRM
- WhatsApp

Show connected, partially connected, expired-permission and unavailable states.

## Step 5: Build Brand Brain

Allow users to:

- Import website
- Upload brochure or catalogue
- Upload brand guidelines
- Add products and services
- Add tone of voice
- Add audience
- Add competitors
- Add legal or compliance restrictions

## Step 6: Invite team or client

## Step 7: Generate first marketing plan

End with a personalised Overview dashboard instead of a generic success screen.

---

# 7. OVERVIEW DASHBOARD

Create distinct views based on role.

## 7.1 Business owner overview

Prioritise:

- Revenue attributed to social and advertising
- Total spend
- Leads
- Qualified leads
- Customers
- Cost per customer
- ROAS
- Best channel
- Best campaign
- Upcoming content
- Leads requiring action
- Critical alerts

## 7.2 Agency owner overview

Prioritise:

- All client workspaces
- Account health
- Spend under management
- Clients needing attention
- Pending approvals
- Failed publishing
- Campaign anomalies
- Overdue work
- Team workload
- Client report status
- Retainer or billing status where available

## 7.3 Social manager overview

Prioritise:

- Content due
- Posts awaiting approval
- Calendar gaps
- Publishing failures
- Engagement changes
- Inbox items
- Best-performing content

## 7.4 Performance marketer overview

Prioritise:

- Spend
- Budget pacing
- CPL
- Cost per qualified lead
- CAC
- ROAS
- Conversion rate
- Creative fatigue
- Tracking health
- Ads requiring action

## Dashboard behaviour

- Customisable widgets
- Drag-and-drop widget ordering
- Date and client filters
- Compare with previous period
- Export / share
- AI-generated morning summary
- Explanations for unusual changes
- Drill-down from every metric

---

# 8. WORKSPACES, CLIENTS AND BRAND SETUP

## 8.1 Client list

Display:

- Client logo
- Industry
- Account manager
- Connected channels
- Organic health
- Paid health
- Monthly spend
- Leads
- Approval backlog
- Alerts
- Last report date

Provide table and card views.

## 8.2 Client workspace profile

Include:

- Business profile
- Industry and sub-industry
- Products and services
- Target locations
- Target audiences
- Competitors
- Social accounts
- Advertising accounts
- Team members
- Brand assets
- Content history
- Campaign history

## 8.3 Brand Brain

Design this as a living knowledge centre, not a settings form.

Sections:

- Brand summary
- Tone and personality
- Approved words
- Prohibited words
- Products and services
- Offers and pricing
- Audience personas
- FAQs
- Objections and responses
- Competitors
- Past winning content
- Colours and typography
- Logos and usage rules
- Legal disclaimers
- Industry compliance rules
- Uploaded sources
- Source freshness and confidence

Each generated item should indicate which Brand Brain sources influenced it.

Include:

- Website import
- Document upload
- Manual entry
- Suggested extraction
- Conflict resolution
- Version history
- “Needs review” state
- Test generation area to verify brand voice

---

# 9. STRATEGY MODULE

## 9.1 Marketing Plan

Create an AI-guided planning experience.

Inputs:

- Business objective
- Product or service
- Target audience
- Location
- Monthly budget
- Important dates
- Current offer
- Desired result
- Available content resources
- Preferred channels

Outputs:

- Monthly strategy
- Recommended platforms
- Organic and paid split
- Content pillars
- Campaign themes
- Posting frequency
- Recommended ad objectives
- Funnel structure
- Creative requirements
- Suggested KPIs
- Budget recommendation
- Risks and assumptions

Allow users to edit, approve and convert recommendations into campaigns and calendar items.

## 9.2 Content pillars

Allow allocation by percentage, for example:

- Educational: 30%
- Product: 25%
- Engagement: 20%
- Customer proof: 15%
- Promotional: 10%

Show planned versus actual distribution and performance by pillar.

## 9.3 Campaign workspace

This is one of the product’s most important screens.

Every campaign workspace should contain:

- Campaign name
- Objective
- Status
- Owner
- Target audience
- Start and end dates
- Channels
- Content
- Ads
- Creatives
- Landing pages
- Lead forms
- Follow-up workflows
- Assigned team
- Budget
- KPIs
- Approvals
- Results
- Activity history

Recommended internal tabs:

- Overview
- Plan
- Content
- Ads
- Conversion assets
- Leads
- Analytics
- Activity

The Overview should show the complete funnel on one screen.

## 9.4 Trends

Surface:

- Industry trends
- Trending topics
- Keywords
- Formats
- Relevant news
- Seasonal opportunities
- Popular questions
- Content gaps
- Campaign angles
- Suggested hashtags

Allow saving a trend as an idea, post or campaign.

## 9.5 Competitors

Support:

- Competitor list
- Posting frequency
- Platform activity
- Top posts
- Engagement rate
- Formats
- Topics
- Offers
- Creative patterns
- Estimated share of voice
- Audience response
- Public advertising examples where available

Show comparisons without implying unavailable private data.

## 9.6 Social Listening

Track:

- Brand mentions
- Product mentions
- Competitor mentions
- Keywords
- Hashtags
- Sentiment
- Complaints
- Purchase-intent phrases
- Industry conversations

Views:

- Live stream
- Trend chart
- Topic clusters
- Sentiment
- Source
- Urgency
- Opportunity

Allow conversion of a mention into a response task, lead, issue or content idea.

---

# 10. CONTENT MODULE

## 10.1 Ideas board

Use list, card and Kanban views.

Stages:

- Captured
- Researching
- Ready to create
- In production
- Scheduled
- Archived

Features:

- Capture quick idea
- Save references
- Store competitor posts
- Add notes
- Add campaign
- Assign teammate
- Set due date
- Convert to post
- Convert to campaign
- AI-expand an idea

## 10.2 AI Studio

Support creation for:

- Instagram post
- Carousel
- Reel
- Story
- Facebook post
- Facebook Reel
- LinkedIn post
- LinkedIn article
- X post
- X thread
- TikTok video
- YouTube Short
- YouTube video
- Google Business Profile post
- Advertisement
- Blog
- Email
- WhatsApp promotional message

### Creation modes

- Start from brief
- Start from campaign
- Start from trend
- Start from product
- Start from URL
- Start from document
- Repurpose existing content
- Create variants from winning content

### AI copy tools

- Generate
- Rewrite
- Shorten
- Expand
- Change tone
- Add CTA
- Generate hooks
- Create platform variants
- Translate
- Generate Hinglish
- Add keywords
- Generate hashtags
- Build carousel copy
- Build video script
- Create caption from image or video
- Repurpose blog into posts
- Repurpose long video into clips
- Generate ad variants

### Visual tools

- AI image generation
- Template-based design
- Brand colours and fonts
- Background removal
- Resize
- Carousel builder
- Thumbnail generator
- Product mock-up
- Text overlay
- Logo placement
- Safe-zone validation
- Aspect-ratio conversion
- Video subtitles
- Short-video templates
- Audio or music library
- Stock-media integration

### Editor layout

Use a three-panel editing experience:

- Left: brief, brand context and content settings
- Centre: live canvas or copy editor
- Right: variants, quality checks, comments and channel preview

Allow switching between desktop and mobile preview.

## 10.3 Creative scoring

Score and explain:

- Brand alignment
- Caption clarity
- Hook strength
- CTA strength
- Platform suitability
- Readability
- Visual hierarchy
- Ad-policy risk
- Text density
- Predicted engagement potential

Every score must have an explanation and suggested improvement.

## 10.4 Media Library

Support:

- Images
- Videos
- Logos
- Brand documents
- Templates
- Product shots
- Approved creatives
- Draft creatives
- Tags
- Folders
- Usage history
- Duplicate detection
- AI search by visual contents
- Rights and expiry information
- File details
- Related campaigns
- Performance history when used in posts or ads

## 10.5 Templates

Include:

- Industry templates
- Channel templates
- Campaign templates
- Reusable brand templates
- Team templates
- Locked elements for agencies
- Dynamic fields such as product, price, location and offer

---

# 11. PUBLISHING MODULE

## 11.1 Calendar

Views:

- Day
- Week
- Month
- Campaign
- Platform
- Client
- Team member
- Organic versus paid

Each calendar item should show:

- Channel icon
- Creative thumbnail
- Status
- Assignee
- Approval state
- Campaign
- Publish time
- Error state

Allow drag-and-drop rescheduling with conflict warning.

## 11.2 Publishing features

Support:

- Publish now
- Schedule
- Draft
- Queue
- Recurring posts
- Evergreen recycling
- Bulk CSV upload
- Duplicate and modify
- Cross-post
- Platform-specific customisation
- Best-time recommendation
- Time-zone handling
- First-comment scheduling
- Instagram grid preview
- Channel preview
- Failed-publishing alerts
- Retry queue
- Link tracking
- UTM generation

## 11.3 Scheduled view

Include filters by client, platform, status, campaign, owner and date.

## 11.4 Published view

Show:

- Published preview
- Organic performance
- Paid boost status
- Comments and conversations
- Attribution
- Repurpose action
- Create ad from post
- Add to report

## 11.5 Approval workflow

Stages:

**Idea → Draft → Internal Review → Client Review → Approved → Scheduled → Published**

Features:

- Internal comments
- Client comments
- Mentions
- Request changes
- Approve one item
- Approve campaign batch
- Bulk approval
- Version history
- Compare versions
- Lock approved content
- Deadline reminders
- Email and WhatsApp approval links
- Approval without full account
- Audit trail

Create a dedicated approvals inbox with grouped review sessions.

---

# 12. ENGAGEMENT MODULE

## 12.1 Unified Inbox

Combine where APIs allow:

- Comments
- Replies
- Direct messages
- Mentions
- Reviews
- Lead-form responses
- Ad comments
- Google Business interactions
- Escalated complaints

Inbox layout:

- Left: channels, queues and saved filters
- Centre: conversation list
- Right: full conversation and customer context

Features:

- Assign
- Tag
- Priority
- Sentiment
- Internal notes
- Saved replies
- AI-suggested replies
- Translation
- Spam detection
- Sales-intent detection
- Complaint detection
- Convert to lead
- Escalate to human
- SLA timer
- Conversation history
- Customer profile

## 12.2 AI community manager

The AI should:

- Draft replies
- Detect intent
- Detect anger and urgency
- Answer FAQs from Brand Brain
- Avoid unsafe or sensitive automatic replies
- Suggest sales follow-up
- Route legal, medical, financial or complaint matters to a human
- Learn from approved replies

Show clearly whether a response is suggested, approved, scheduled or sent.

## 12.3 Reviews

Include:

- Review feed
- Rating distribution
- Source
- Sentiment
- Response status
- Suggested reply
- Escalation
- Common themes
- Review-request campaigns

## 12.4 Leads inside Engage

Show conversational leads that originated from DMs, comments or reviews and allow direct hand-off to the lead pipeline.

---

# 13. PERFORMANCE MARKETING / ADVERTISE MODULE

Performance marketing must be deeply integrated into the product, not a disconnected page.

## 13.1 Performance campaign creation flow

### Step 1: Select business goal

- Awareness
- Website traffic
- Engagement
- Lead generation
- WhatsApp conversations
- Calls
- Appointment bookings
- App installations
- Online sales
- Store visits

### Step 2: Build funnel

Recommend:

- Platform
- Campaign type
- Audience
- Offer
- Creative formats
- Landing page
- Lead form
- Follow-up workflow
- Conversion event
- Budget allocation

### Step 3: Generate assets

Generate:

- Primary text
- Headlines
- Descriptions
- CTA variations
- Static creatives
- Carousel creatives
- Video scripts
- Short video
- Audience variations
- Landing-page copy

### Step 4: Tracking setup

Include a Tracking Centre for:

- Meta Pixel
- Meta Conversions API
- Google tag
- Google Analytics 4
- Google Ads conversions
- TikTok Pixel and Events API
- UTM parameters
- Lead-form tracking
- WhatsApp click tracking
- Call tracking
- Coupon codes
- CRM outcomes
- Offline purchases
- Appointment completion
- Payment confirmation

### Step 5: Review and launch

Create a final launch checklist with:

- Objective
- Platforms
- Audience
- Creative
- Placements
- Budget
- Dates
- Tracking
- Landing-page health
- Approval
- Estimated outcomes
- Policy warnings

## 13.2 Supported campaign types by phase

Early phases:

- Meta lead campaigns
- Meta sales campaigns
- Click-to-WhatsApp campaigns
- Facebook and Instagram boosted content
- Google Search campaigns
- Google Performance Max
- Google Demand Gen

Later phases:

- TikTok campaigns
- LinkedIn campaigns
- Additional channels

The UI must identify integrations that are read-only, fully manageable, beta or planned.

## 13.3 Advertising dashboard

Show:

- Spend
- Impressions
- Reach
- Frequency
- CPM
- Clicks
- CTR
- CPC
- Leads
- Qualified leads
- CPL
- Cost per qualified lead
- Purchases
- Revenue
- CAC
- ROAS
- Budget pacing
- Conversion rate

Allow hierarchy drill-down:

**All accounts → Channel → Account → Campaign → Ad set / group → Ad / creative**

## 13.4 Campaign list

Include:

- Platform
- Objective
- Status
- Spend
- Budget
- Pacing
- Leads
- Qualified leads
- CPL
- ROAS
- Trend
- Tracking status
- Recommendation count

## 13.5 Campaign details

Tabs:

- Overview
- Ad sets or groups
- Ads
- Creatives
- Audience
- Budget
- Conversions
- Recommendations
- Change history

## 13.6 Live optimisation and alerts

Detect:

- Overspending
- Underspending
- CPL above target
- Falling conversion rate
- Creative fatigue
- High frequency
- Low CTR
- Landing-page drop-off
- Poor lead quality
- Broken tracking
- Disapproved ads
- Too few creative variants

Each alert should show severity, cause, evidence, impact and recommended action.

## 13.7 Automated rules

Examples:

- Pause an ad if spend exceeds ₹3,000 without a lead
- Increase daily budget by 15% when seven-day ROAS remains above 4
- Notify manager when cost per qualified lead rises above ₹500
- Pause creative when frequency is high and CTR declines
- Shift budget toward the best-performing city

Rule builder design:

- Trigger
- Conditions
- Action
- Schedule
- Scope
- Approval requirement
- Notification recipients
- Safety limit
- Preview affected campaigns
- Execution log

Start with recommendation-only or approval-required automation. Clearly distinguish fully automatic rules.

## 13.8 Creative performance

Connect each creative to:

- Campaigns used
- Spend
- CTR
- Leads
- Qualified leads
- Revenue
- ROAS
- Fatigue
- Audience segments
- Placement performance
- Creative attributes

Allow “Create variant from winner.”

## 13.9 Audiences

Support:

- Saved audience definitions
- Customer lists
- Website audiences
- Engagement audiences
- Lookalike audiences
- Exclusions
- Geographic targeting
- Demographic targeting
- Interest targeting
- Retargeting windows

Make platform-specific limitations clear.

## 13.10 Budgets

Show:

- Monthly budget
- Allocated budget
- Spent
- Forecast spend
- Remaining
- Channel split
- Campaign split
- Pacing
- Recommended reallocation
- Change history

---

# 14. CONVERSION MODULE

## 14.1 Landing-page builder

Support:

- Industry templates
- Drag-and-drop sections
- AI copy
- Forms
- Appointment booking
- WhatsApp CTA
- Call CTA
- Product catalogue
- Testimonials
- Payment links
- Thank-you pages
- Conversion tracking
- A/B tests
- Custom domains
- Mobile optimisation

Builder layout:

- Left: sections and elements
- Centre: page canvas
- Right: properties, brand settings, tracking and AI copy

Include desktop and mobile preview.

## 14.2 Link-in-bio pages

Support:

- Custom page
- Products and services
- Social links
- Lead form
- WhatsApp
- Appointments
- Payments
- Featured posts
- Click analytics
- UTM tracking
- Retargeting pixels

## 14.3 Forms

Support:

- Lead form
- Contact form
- Appointment form
- Quote request
- Survey
- Quiz
- Event registration

Features:

- Conditional logic
- Hidden UTM fields
- Consent
- Spam protection
- CRM mapping
- Thank-you actions
- Notifications
- Conversion-event mapping

## 14.4 Lead inbox

Every lead should show:

- Name
- Phone
- Email
- Source platform
- Campaign
- Ad
- Creative
- Landing page
- UTM data
- Time
- Location
- Product interest
- Conversation history
- Status
- Owner
- Lead quality
- Revenue

Include duplicate detection and source attribution.

## 14.5 Lead pipeline

Stages:

**New → Contacted → Qualified → Appointment → Proposal → Won / Lost**

Support:

- Kanban and table views
- Custom stages
- Assignment
- Notes
- Tasks
- Reminders
- Conversation timeline
- Deal value
- Lost reason
- Bulk update
- CRM sync

EffySocial is not a full CRM. Keep the pipeline focused on marketing-generated leads and allow external CRM integrations.

## 14.6 Follow-up automation

Actions:

- Instant WhatsApp response
- Email response
- SMS response
- AI voice callback
- Assign salesperson
- Follow-up reminder
- Appointment link
- Retargeting audience
- Nurture sequence
- Lost-lead reactivation

Design a visual workflow builder with trigger, condition, delay and action blocks.

## 14.7 Closed-loop optimisation

Sales users can mark:

- Invalid
- Duplicate
- Unreachable
- Qualified
- Appointment completed
- Purchase completed
- Revenue value

Show how these outcomes are returned to advertising platforms as offline conversion signals.

## 14.8 Conversion Tracking Centre

Create a dedicated diagnostics page with:

- All conversion sources
- Status
- Last event received
- Event count
- Match quality
- Duplicate warnings
- Domain verification
- Consent status
- Test-event tool
- Setup guide
- Fix recommendations

---

# 15. ANALYTICS MODULE

## 15.1 Organic analytics

Metrics:

- Followers
- Follower growth
- Reach
- Impressions
- Engagement
- Engagement rate
- Profile visits
- Link clicks
- Video views
- Watch time
- Saves
- Shares
- Comments
- Audience demographics
- Best posting times

Analysis:

- Best post
- Best format
- Best pillar
- Best topic
- Best hook
- Best CTA
- Best visual pattern
- Best day and time
- Underperforming posts
- Reusable winning ideas

## 15.2 Advertising analytics

Include all paid-media metrics and channel comparison.

## 15.3 Lead analytics

Show:

- Total leads
- Qualified leads
- Qualification rate
- Source
- Campaign
- Creative
- Location
- Product
- Response time
- Stage conversion
- Lost reasons
- Cost per qualified lead

## 15.4 Revenue analytics

Show:

- Attributed revenue
- Revenue by channel
- Revenue by campaign
- Revenue by creative
- Revenue by customer segment
- CAC
- ROAS
- Payback where data exists
- Attribution model

## 15.5 Creative analytics

Show visual thumbnails with sortable performance and creative attribute analysis.

## 15.6 Reports

Report types:

- Executive summary
- Organic report
- Advertising report
- Lead report
- Revenue report
- Campaign report
- Client monthly report
- Custom report

Features:

- Drag-and-drop report builder
- White labelling
- Custom metrics
- Annotations
- AI-written summary
- Recommended next actions
- PDF export
- Email schedule
- Public share link
- Password protection
- Client comments

Role-specific report defaults:

### Business owner
- Spend
- Leads
- Qualified leads
- Customers
- Revenue
- CAC
- ROAS

### Social manager
- Posts
- Reach
- Engagement
- Growth
- Best formats

### Performance marketer
- Spend
- CPM
- CTR
- CPC
- CPL
- Cost per qualified lead
- Conversion rate
- CAC
- ROAS
- Pacing
- Fatigue

---

# 16. AI ASSISTANT AND AGENTS

Create a persistent Effy AI assistant accessible from the top bar and relevant pages.

Agents:

## Strategy Agent
Creates monthly strategy and funnel recommendations.

## Content Agent
Generates and repurposes content.

## Creative Agent
Creates visuals and identifies winning creative elements.

## Publishing Agent
Plans the calendar and detects gaps.

## Community Agent
Suggests replies and identifies leads or complaints.

## Performance Agent
Monitors ads and recommends actions.

## Analytics Agent
Explains changes and next steps.

## Client Reporting Agent
Creates client-ready summaries.

All agents must use the same workspace, Brand Brain, campaign history and performance data.

## AI interaction patterns

- Chat with contextual citations to product data
- Suggested actions
- Preview before applying
- Undo
- Approval where required
- Activity history
- Explain recommendation
- Dismiss and provide feedback

Example prompts:

- “Build next month’s strategy for this client.”
- “Fill the calendar gaps for Instagram.”
- “Turn our best LinkedIn post into a Meta lead campaign.”
- “Why did CPL increase this week?”
- “Show leads that came from the Diwali campaign.”
- “Create a client report and explain the revenue change.”

---

# 17. ADMINISTRATION

## 17.1 Team and roles

Roles:

- Agency owner
- Workspace admin
- Account manager
- Strategist
- Copywriter
- Designer
- Performance marketer
- Analyst
- Client approver
- View-only

Permissions should work by workspace and feature.

## 17.2 Integrations

Create categories:

- Social publishing
- Advertising
- Analytics
- CRM
- Messaging
- Storage
- Commerce
- Scheduling
- Payments

Each integration card should show:

- Connected account
- Permission health
- Last sync
- Data available
- Actions supported
- Reconnect
- Disconnect
- Troubleshoot

## 17.3 Billing

Support:

- Subscription plan
- Seats
- Workspaces
- Usage
- AI credits
- Publishing limits
- Reporting limits
- Ad-account limits
- Invoices
- Payment method
- Upgrade

## 17.4 White label

For agency plans:

- Agency logo
- Accent colour
- Custom report branding
- Client portal branding
- Custom email sender
- Custom domain where applicable

## 17.5 Audit and security

Include:

- Login history
- Active sessions
- Two-factor authentication
- Activity log
- Approval log
- Ad-spend change log
- Data export
- Account deletion

---

# 18. NOTIFICATIONS AND ALERTS

Notification types:

- Approval requested
- Approval overdue
- Post failed
- Token expired
- Comment needs response
- Complaint detected
- Lead unassigned
- Lead follow-up overdue
- Campaign overspending
- Tracking broken
- Ad disapproved
- Budget pacing issue
- Creative fatigue
- Report ready

Allow notification preferences by in-app, email and WhatsApp where supported.

---

# 19. REQUIRED STATES

Design all major screens with:

- First-use empty state
- No-results state
- Loading skeleton
- Partial data state
- Integration disconnected state
- Expired permission state
- Error state
- Success state
- Warning state
- Permission-restricted state
- Plan-upgrade state
- Archived state
- Deleted or unavailable external object state

Do not use generic “Something went wrong” errors. Provide recovery actions.

---

# 20. RESPONSIVE DESIGN

## Desktop

Primary work environment. Support wide analytics dashboards, editors and split panes.

## Tablet

- Collapsible navigation
- Two-column layouts where possible
- Drawers for contextual details
- Touch-friendly calendar and approval workflows

## Mobile

Focus on high-value mobile tasks:

- Overview summary
- Notifications
- Approvals
- Content preview
- Schedule changes
- Inbox replies
- Lead follow-up
- Campaign alerts
- Quick reporting

Do not force full desktop ad-building or page-building workflows into cramped mobile screens. Provide view, approval and light-edit modes.

---

# 21. ACCESSIBILITY AND CONTENT DESIGN

- WCAG-conscious contrast
- Keyboard navigation
- Visible focus states
- Screen-reader labels
- Do not rely on colour alone
- Accessible charts and data tables
- Plain language
- Consistent metric definitions
- Tooltips for marketing terminology
- Date, currency and time-zone clarity
- Confirmations for destructive actions and spend changes

---

# 22. COMPONENT SYSTEM

Create reusable components for:

- Application shell
- Navigation groups
- Workspace switcher
- Command palette
- Metric cards
- Trend chips
- Alerts
- Recommendations
- Data tables
- Filter bars
- Saved views
- Date range selector
- Channel selector
- Status badge
- Campaign badge
- Creative thumbnail
- Post preview
- Ad preview
- Conversation item
- Lead card
- Pipeline card
- Approval card
- Calendar item
- Chart container
- Funnel visualisation
- Attribution path
- Integration card
- Rule-builder blocks
- Workflow-builder blocks
- AI explanation panel
- Activity timeline
- Empty state
- Upgrade state
- Modal
- Drawer
- Toast
- Stepper
- Tabs
- Bulk action bar

Document component states and variants.

---

# 23. DATA VISUALISATION

Use the right visual for each question:

- Time series for trends
- Funnel for stage conversion
- Bar chart for channel and campaign comparisons
- Stacked bar for budget allocation
- Heat map for posting time and audience activity
- Table with sparklines for campaign monitoring
- Sankey-like flow only when attribution paths are genuinely useful
- Creative thumbnail grid for creative analysis
- Geographic map for lead or spend distribution

Always include exact values, legends, tooltips and accessible table alternatives.

---

# 24. SAMPLE DATA

Use realistic sample clients such as:

- Dental clinic
- Cooperative bank
- Pet-care brand
- Real-estate broker
- Restaurant or food business
- D2C ecommerce brand

Use realistic campaigns, INR budgets, channel names, lead statuses, performance metrics, comments and creative thumbnails.

Avoid lorem ipsum and meaningless placeholder charts.

---

# 25. PHASED PRODUCT IMPLEMENTATION

The full design should show the final product, but label components by implementation phase.

## Phase 1 — Full organic social product

- Workspaces and clients
- Brand Brain
- Team roles
- AI strategy
- Content creation
- AI images and templates
- Media library
- Calendar
- Approvals
- Instagram and Facebook integration
- LinkedIn integration
- Publishing
- Basic analytics
- Reports
- Client portal

## Phase 2 — Performance Marketing Starter

- Meta and Google account connection
- Read-only ad dashboard
- Campaign brief builder
- Ad copy and creative variants
- UTM builder
- Landing pages
- Lead forms
- Lead inbox
- WhatsApp follow-up
- Pixel and conversion setup checklist
- Tracking health
- Cross-channel reporting
- CPL and ROAS reporting

## Phase 3 — Campaign Execution

- Create Meta campaigns
- Create Google campaigns
- Budget management
- Audience configuration
- Publish ads
- Pause and resume
- Automated rules
- Creative tests
- Budget pacing
- Lead-quality feedback
- Offline conversion upload

## Phase 4 — Advanced Intelligence

- Multi-touch attribution
- Creative element analysis
- Predictive lead quality
- Revenue forecasting
- Budget recommendations
- Anomaly detection
- Automated optimisation
- Incrementality experiments
- Media mix modelling for larger clients

Do not visually overpromise unavailable Phase 4 capabilities as ready in Phase 1. Use “planned,” “beta,” “requires data” or “enterprise” states appropriately.

---

# 26. PRIMARY USER FLOWS TO DESIGN

Create end-to-end screens for all of the following:

## Flow A: New agency client onboarding

Create client → import website → build Brand Brain → connect channels → invite client approver → generate first plan.

## Flow B: Monthly organic content cycle

Create marketing plan → approve pillars → generate ideas → create assets → internal review → client approval → schedule → publish → analyse → repurpose winner.

## Flow C: Performance campaign

Select objective → build funnel → generate ads → create landing page and form → verify tracking → approve budget → launch → monitor → optimise → qualify leads → upload revenue outcome → report ROAS.

## Flow D: Click-to-WhatsApp campaign

Create offer → generate creative → launch Meta campaign → receive WhatsApp lead → automated first response → assign salesperson → mark qualified → appointment → sale → send outcome back to ad platform.

## Flow E: Community issue

Negative comment detected → urgency and sentiment classified → assigned to human → Brand Brain context shown → response drafted → approval → reply → conversation tagged and closed.

## Flow F: Client approval

Client receives approval link → views campaign context and all creatives → comments → requests change or approves → team receives notification → approved items scheduled.

## Flow G: Campaign anomaly

CPL rises → alert generated → Analytics Agent explains cause → recommended actions shown → marketer previews affected ads → approves action → change logged.

## Flow H: Monthly reporting

Select client and date → generate report → AI summary → manager edits commentary → white-labelled PDF/share link → client views and comments.

---

# 27. SCREEN DELIVERABLE CHECKLIST

Produce high-fidelity designs for at least the following:

1. Login
2. Onboarding
3. Workspace selection
4. Business overview
5. Agency overview
6. Client list
7. Client workspace
8. Brand Brain
9. Marketing Plan
10. Campaign list
11. Campaign workspace
12. Trends
13. Competitors
14. Social Listening
15. Ideas board
16. AI Studio copy mode
17. AI Studio visual mode
18. Media Library
19. Templates
20. Calendar month view
21. Calendar campaign view
22. Scheduled posts
23. Approval inbox
24. Approval detail
25. Published content
26. Unified Inbox
27. Conversation detail
28. Reviews
29. Ad dashboard
30. Ad campaign list
31. Campaign creation wizard
32. Ad campaign details
33. Creative performance
34. Audiences
35. Budgets
36. Automated rule builder
37. Landing-page list
38. Landing-page builder
39. Link-in-bio builder
40. Form builder
41. Lead inbox
42. Lead pipeline
43. Lead detail
44. Follow-up workflow builder
45. Conversion Tracking Centre
46. Organic analytics
47. Advertising analytics
48. Lead analytics
49. Revenue analytics
50. Reports list
51. Report builder
52. Client report view
53. Team and permissions
54. Integrations
55. Billing
56. Settings
57. Notification centre
58. Effy AI assistant
59. Mobile approvals
60. Mobile lead follow-up

---

# 28. FINAL DESIGN REQUIREMENTS

- Keep the product coherent across all modules.
- Use the same objects and terminology everywhere.
- Make relationships visible: campaign ↔ content ↔ ad ↔ lead ↔ revenue.
- Make every dashboard actionable, not merely descriptive.
- Use realistic sample data and polished content.
- Do not omit performance marketing.
- Do not reduce EffySocial to scheduling.
- Do not create a generic admin template.
- Do not use placeholder screens for important modules.
- Clearly separate final vision from phased availability.
- Present the final result as a premium, credible application that an agency could sell to clients and use daily.

Begin by establishing the design system and application shell, then design the core end-to-end campaign flow before expanding into every module. Preserve all requirements in this prompt throughout the design process.
