import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './styleguide.css';

// EffySocial Design System — "Bright Studio". The single source of truth for
// tokens + core components. Every tool and app screen should be built from
// these pieces so the product feels like one thing.

const Spark = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="sg-i">
    <path d="M12 3l1.8 4.9L19 9.7l-4.2 2.9L16 18l-4-3-4 3 1.2-5.4L5 9.7l5.2-1.8L12 3z"
      fill="currentColor" />
  </svg>
);
const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="sg-i">
    <path d="M5 12h13M12 6l6 6-6 6" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="sg-i">
    <path d="M5 12l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.4"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Section({ id, title, sub, children }) {
  return (
    <section className="sg-section" id={id}>
      <header className="sg-section-head">
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </header>
      {children}
    </section>
  );
}

function Swatch({ name, value, varName, dark }) {
  return (
    <div className="sg-swatch">
      <div className="sg-swatch-chip" style={{ background: value }}>
        {dark && <span className="sg-swatch-on" style={{ color: dark }}>Aa</span>}
      </div>
      <div className="sg-swatch-meta">
        <strong>{name}</strong>
        <code>{varName}</code>
        <span>{value}</span>
      </div>
    </div>
  );
}

const TOOLS = [
  { name: 'Media Creator', accent: '#e84a33', tint: '#ffe7e2' },
  { name: 'Lip Sync', accent: '#db2777', tint: '#fce7f1' },
  { name: 'AI Caller', accent: '#0f766e', tint: '#d4f0ec' },
  { name: 'Campaign', accent: '#b45309', tint: '#fcecd2' },
  { name: 'Leadership Photo', accent: '#be185d', tint: '#fce4ef' },
];

const CHART = [
  { label: 'Mon', value: 62, c: 'var(--dv-1)' },
  { label: 'Tue', value: 80, c: 'var(--dv-2)' },
  { label: 'Wed', value: 47, c: 'var(--dv-3)' },
  { label: 'Thu', value: 95, c: 'var(--dv-4)' },
  { label: 'Fri', value: 71, c: 'var(--dv-5)' },
  { label: 'Sat', value: 58, c: 'var(--dv-6)' },
];

export default function StyleGuide() {
  const [toggle, setToggle] = useState(true);

  return (
    <div className="sg">
      <header className="sg-top">
        <div className="sg-top-inner">
          <Link to="/" className="sg-back">← EffySocial</Link>
          <span className="sg-pill"><Spark /> Bright Studio</span>
        </div>
        <div className="sg-hero">
          <h1>EffySocial <span className="sg-grad">Design System</span></h1>
          <p>The living source of truth — tokens and components that every tool and screen is built from. Light, warm, professional.</p>
        </div>
      </header>

      <main className="sg-main">
        {/* COLOR */}
        <Section title="Color" sub="Indigo brand, a coral spark, warm cream, and a categorical palette for analytics.">
          <h3 className="sg-h3">Brand &amp; spark</h3>
          <div className="sg-swatches">
            <Swatch name="Coral (primary)" value="#e84a33" varName="--accent" dark="#fff" />
            <Swatch name="Coral soft" value="#ffe7e2" varName="--accent-soft" dark="#c23a2e" />
            <Swatch name="Light coral (spark)" value="#ff6b5e" varName="--spark" dark="#fff" />
            <Swatch name="Deep coral (text)" value="#c2410c" varName="--accent-ink" dark="#fff" />
            <Swatch name="Cream" value="#fbf4ea" varName="--cream" dark="#2a2320" />
          </div>

          <h3 className="sg-h3">Neutrals (warm)</h3>
          <div className="sg-swatches">
            <Swatch name="Background" value="#faf6f0" varName="--bg" dark="#2a2320" />
            <Swatch name="Surface" value="#ffffff" varName="--surface" dark="#2a2320" />
            <Swatch name="Ink" value="#2a2320" varName="--ink" dark="#fff" />
            <Swatch name="Ink soft" value="#6f645c" varName="--ink-soft" dark="#fff" />
            <Swatch name="Line" value="#ece2d6" varName="--line" dark="#6f645c" />
          </div>

          <h3 className="sg-h3">Semantic</h3>
          <div className="sg-swatches">
            <Swatch name="Success" value="#0e9f6e" varName="--success" dark="#fff" />
            <Swatch name="Warning" value="#d97706" varName="--warning" dark="#fff" />
            <Swatch name="Error" value="#e5484d" varName="--error" dark="#fff" />
            <Swatch name="Info" value="#3b82f6" varName="--info" dark="#fff" />
          </div>

          <h3 className="sg-h3">Data-viz palette</h3>
          <div className="sg-swatches">
            <Swatch name="DV 1" value="#ff6b5e" varName="--dv-1" dark="#fff" />
            <Swatch name="DV 2" value="#f59e0b" varName="--dv-2" dark="#2a2320" />
            <Swatch name="DV 3" value="#14b8a6" varName="--dv-3" dark="#fff" />
            <Swatch name="DV 4" value="#ec4899" varName="--dv-4" dark="#fff" />
            <Swatch name="DV 5" value="#38bdf8" varName="--dv-5" dark="#2a2320" />
            <Swatch name="DV 6" value="#475569" varName="--dv-6" dark="#fff" />
          </div>

          <h3 className="sg-h3">Aurora gradient</h3>
          <div className="sg-aurora">indigo → violet → coral · <code>--aurora</code></div>
        </Section>

        {/* TYPOGRAPHY */}
        <Section title="Typography" sub="Manrope across the board. Tabular figures for all metrics.">
          <div className="sg-type">
            <p className="sg-t-display">Display · 48 / 800</p>
            <p className="sg-t-h1">Heading 1 · 36 / 800</p>
            <p className="sg-t-h2">Heading 2 · 28 / 700</p>
            <p className="sg-t-h3">Heading 3 · 22 / 700</p>
            <p className="sg-t-body">Body · 16 / 400 — Create trend-aware posts, talking-head videos and AI calls in one place.</p>
            <p className="sg-t-small">Small · 14 / 500 — secondary text and helpers.</p>
            <p className="sg-t-caption">CAPTION · 12 / 700 · UPPERCASE</p>
            <p className="sg-t-num">Metrics · 1,284 · 96.4% · ₹12,480</p>
          </div>
        </Section>

        {/* BUTTONS */}
        <Section title="Buttons" sub="One primary action per screen. Spark for the standout / AI moment.">
          <div className="sg-row">
            <button className="sg-btn sg-btn-primary">Primary <Arrow /></button>
            <button className="sg-btn sg-btn-spark"><Spark /> Generate</button>
            <button className="sg-btn sg-btn-secondary">Secondary</button>
            <button className="sg-btn sg-btn-ghost">Ghost</button>
            <button className="sg-btn sg-btn-primary" disabled>Disabled</button>
          </div>
          <div className="sg-row">
            <button className="sg-btn sg-btn-primary sg-btn-sm">Small</button>
            <button className="sg-btn sg-btn-primary">Medium</button>
            <button className="sg-btn sg-btn-primary sg-btn-lg">Large</button>
          </div>
        </Section>

        {/* FORM CONTROLS */}
        <Section title="Form controls" sub="Soft, rounded, with an indigo focus ring.">
          <div className="sg-form">
            <label className="sg-field">
              <span>Brand name</span>
              <input className="sg-input" placeholder="e.g. Axis Bank" defaultValue="" />
            </label>
            <label className="sg-field">
              <span>Platform</span>
              <select className="sg-input">
                <option>Instagram</option><option>X (Twitter)</option><option>YouTube</option>
              </select>
            </label>
            <label className="sg-field sg-field-wide">
              <span>Topic</span>
              <textarea className="sg-input" rows={2} placeholder="What is this post about?" />
            </label>
            <div className="sg-field-inline">
              <button
                type="button"
                role="switch"
                aria-checked={toggle}
                className={`sg-switch ${toggle ? 'is-on' : ''}`}
                onClick={() => setToggle((v) => !v)}
              >
                <span className="sg-switch-dot" />
              </button>
              <span className="sg-switch-label">Auto-publish when approved</span>
            </div>
          </div>
        </Section>

        {/* BADGES */}
        <Section title="Tags & badges" sub="Status, AI/new spark, and per-tool chips.">
          <div className="sg-row">
            <span className="sg-tag">Default</span>
            <span className="sg-tag sg-tag-spark"><Spark /> AI</span>
            <span className="sg-tag sg-tag-new">New</span>
            <span className="sg-tag sg-tag-success">Published</span>
            <span className="sg-tag sg-tag-warning">Draft</span>
            <span className="sg-tag sg-tag-error">Failed</span>
            <span className="sg-tag sg-tag-info">Scheduled</span>
          </div>
          <div className="sg-row">
            {TOOLS.map((t) => (
              <span key={t.name} className="sg-toolchip" style={{ '--app': t.accent, '--app-tint': t.tint }}>
                <i /> {t.name}
              </span>
            ))}
          </div>
        </Section>

        {/* CARDS */}
        <Section title="Cards" sub="Soft surfaces, gentle elevation. Tool cards carry their accent.">
          <div className="sg-cards">
            <div className="sg-card">
              <h4>Basic card</h4>
              <p>A surface with one elevation step and the standard radius. Used everywhere.</p>
              <button className="sg-btn sg-btn-secondary sg-btn-sm">Action</button>
            </div>

            {TOOLS.slice(0, 2).map((t) => (
              <div key={t.name} className="sg-card sg-toolcard" style={{ '--app': t.accent, '--app-tint': t.tint }}>
                <span className="sg-toolcard-icon"><Spark /></span>
                <h4>{t.name}</h4>
                <p>Tool card — accent on icon, title link and hover border.</p>
                <span className="sg-toolcard-open">Open <Arrow /></span>
              </div>
            ))}

            <div className="sg-card sg-stat">
              <span className="sg-stat-label">Engagement rate</span>
              <span className="sg-stat-value">8.4%</span>
              <span className="sg-stat-delta sg-up"><Check /> +1.2 pts</span>
            </div>
          </div>
        </Section>

        {/* DATA VIZ */}
        <Section title="Data visualisation" sub="Rounded bars, warm palette, legible — built for the analytics side.">
          <div className="sg-card sg-chartcard">
            <div className="sg-chart">
              {CHART.map((d) => (
                <div className="sg-bar-col" key={d.label}>
                  <div className="sg-bar" style={{ height: `${d.value}%`, background: d.c }} />
                  <span className="sg-bar-label">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* FEEDBACK */}
        <Section title="Feedback" sub="Alerts and empty states.">
          <div className="sg-alert sg-alert-success"><Check /> Post published successfully.</div>
          <div className="sg-alert sg-alert-warning">Heads up — this draft needs compliance approval.</div>
          <div className="sg-alert sg-alert-error">Generation failed. Please try again.</div>
          <div className="sg-alert sg-alert-info">Scheduled for tomorrow at 9:00 AM.</div>

          <div className="sg-empty">
            <span className="sg-empty-orb"><Spark /></span>
            <h4>Nothing here yet</h4>
            <p>Create your first post and it'll show up right here.</p>
            <button className="sg-btn sg-btn-primary sg-btn-sm"><Spark /> Create a post</button>
          </div>
        </Section>

        {/* TOKENS REFERENCE */}
        <Section title="Radius & elevation" sub="Soft, consistent, tactile.">
          <div className="sg-row sg-radius-row">
            {['--r-xs', '--r-sm', '--r-md', '--r-lg', '--r-xl'].map((r) => (
              <div key={r} className="sg-radius-demo" style={{ borderRadius: `var(${r})` }}><code>{r}</code></div>
            ))}
          </div>
          <div className="sg-row sg-elev-row">
            {['--e1', '--e2', '--e3'].map((e) => (
              <div key={e} className="sg-elev-demo" style={{ boxShadow: `var(${e})` }}><code>{e}</code></div>
            ))}
          </div>
        </Section>
      </main>

      <footer className="sg-foot">EffySocial · Bright Studio design system</footer>
    </div>
  );
}
