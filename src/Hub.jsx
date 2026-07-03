import React from 'react';
import { Link } from 'react-router-dom';
import { SITE_NAME } from './config/brand';
import FluidBackground from './components/FluidBackground';
import './Hub.css';

// EffySocial app hub — product-led bento. Media Creator anchors as the flagship
// tile (with a mini output preview); the rest fan out around it. Themed to the
// EffySocial palette with a per-app accent on each tile.

const MediaIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3l1.8 4.9L19 9.7l-4.2 2.9L16 18l-4-3-4 3 1.2-5.4L5 9.7l5.2-1.8L12 3z"
      stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);
const LipSyncIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 9v6M8 6v12M12 4v16M16 7v10M20 10v4" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const CallerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 4h3l1.5 4.5L7.5 10a11 11 0 005 5l1.5-2 4.5 1.5V18a2 2 0 01-2 2A15 15 0 014 6a2 2 0 011-2z"
      stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);
const CampaignIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 11v2a1 1 0 001 1h2l4 4V6L6 10H4a1 1 0 00-1 1zM14 8a4 4 0 010 8M17 5a8 8 0 010 14"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PhotoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M8 6l1.5-2h5L16 6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="hub-arrow-svg">
    <path d="M5 12h13M12 6l6 6-6 6" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const APPS = [
  {
    key: 'media', area: 'media', flagship: true, to: '/studio',
    name: 'Media Creator', tagline: 'Posts · captions · images', icon: <MediaIcon />,
    description: 'Generate trend-aware social posts, captions, hashtags and visuals for any platform — in seconds.',
    accent: '#e84a33', tint: '#ffe7e2',
  },
  {
    key: 'lipsync', area: 'lipsync', to: '/lipsync',
    name: 'Lip Sync', tagline: 'Talking-head video', icon: <LipSyncIcon />,
    description: 'A photo or video, perfectly lip-synced — any voice, any language.',
    accent: '#db2777', tint: '#fce7f1',
  },
  {
    key: 'caller', area: 'caller', to: '/caller',
    name: 'AI Caller', tagline: 'AI voice agent', icon: <CallerIcon />,
    description: 'An AI agent that calls, qualifies and follows up with customers, 24/7.',
    accent: '#0f766e', tint: '#d4f0ec',
  },
  {
    key: 'campaign', area: 'campaign', to: '/campaign',
    name: 'AI Campaign Generator', tagline: 'Compliant partner drafts', icon: <CampaignIcon />,
    description: 'Compliant campaign drafts — concept, WhatsApp, script, poster and regional variants.',
    accent: '#b45309', tint: '#fcecd2',
  },
  {
    key: 'photo', area: 'photo', to: '/photo',
    name: 'Leadership Photo', tagline: 'CEO photo booth', icon: <PhotoIcon />,
    description: 'Capture a guest photo and frame them with the CEO — a branded event memory.',
    accent: '#be185d', tint: '#fce4ef',
  },
];

function PostPreview() {
  // A lightweight faux "generated post" so the flagship tile shows the output.
  return (
    <div className="hub-preview" aria-hidden="true">
      <div className="hub-preview-media">
        <span className="hub-preview-sparkle"><MediaIcon /></span>
      </div>
      <div className="hub-preview-actions">
        <span /><span /><span />
      </div>
      <span className="hub-skel hub-skel-1" />
      <span className="hub-skel hub-skel-2" />
      <div className="hub-preview-tags">
        <span>#ai</span><span>#social</span><span>#reels</span>
      </div>
    </div>
  );
}

export default function Hub() {
  return (
    <div className="hub">
      <FluidBackground className="hub-fluid" />
      <div className="hub-glow" aria-hidden="true" />
      <div className="hub-glow hub-glow-2" aria-hidden="true" />

      <header className="hub-header">
        <div className="hub-brand">
          <span className="hub-logo">✦</span>
          <span className="hub-name">{SITE_NAME}</span>
        </div>
        <Link to="/caller" className="hub-cta">
          Talk to the AI <Arrow />
        </Link>
      </header>

      <section className="hub-hero">
        <span className="hub-eyebrow">✦ AI Media Suite</span>
        <h1>Your AI media <span className="hub-grad">studio</span>.</h1>
        <p>Create trend-aware posts, talking-head videos and AI calls — every tool your brand needs, in one place.</p>
        <div className="hub-hero-actions">
          <a href="#apps" className="hub-btn-primary">Explore the apps <Arrow /></a>
          <Link to="/studio" className="hub-btn-ghost">Start creating</Link>
        </div>
        <div className="hub-trust">
          <span>5 live AI tools</span><i />
          <span>No setup</span><i />
          <span>Powered by EffyBiz</span>
        </div>
      </section>

      <section id="apps" className="hub-bento" aria-label="Apps">
        {APPS.map((app) => (
          <Link
            key={app.key}
            to={app.to}
            className={`hub-card hub-area-${app.area}${app.flagship ? ' is-flagship' : ''}`}
            style={{ '--app': app.accent, '--app-tint': app.tint }}
          >
            <div className="hub-card-top">
              <span className="hub-card-icon">{app.icon}</span>
              <span className="hub-card-arrow"><Arrow /></span>
            </div>

            {app.flagship && <PostPreview />}

            <div className="hub-card-body">
              <span className="hub-card-tagline">{app.tagline}</span>
              <h2>{app.name}</h2>
              <p>{app.description}</p>
            </div>

            <span className="hub-card-open">
              Open{app.flagship ? ` ${app.name}` : ''} <Arrow />
            </span>
          </Link>
        ))}
      </section>

      <footer className="hub-footer">
        <div className="hub-foot-brand">
          <span className="hub-logo hub-logo-sm">✦</span>
          <span>{SITE_NAME}</span>
        </div>
        <span className="hub-foot-note">Your AI media studio — powered by EffyBiz.</span>
      </footer>
    </div>
  );
}
