import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Flame, Check } from 'lucide-react';
import {
  Button, Card, Badge, MetricCard, StatusBadge, Tabs, Pacing, EmptyState, PageHeader,
} from '../ui';

const GRADIENTS = [
  { name: 'aurora', label: 'Aurora (signature)', css: 'linear-gradient(105deg, #ff6b5e → #f0512f → #f59e0b)', cls: 'bg-aurora' },
  { name: 'coral-btn', label: 'Coral button', css: 'linear-gradient(180deg, #ef5942 → #e84a33 → #dc4029)', cls: 'bg-coral-btn' },
  { name: 'card-sheen', label: 'Card sheen', css: 'linear-gradient(180deg, #ffffff → #fdfaf6)', cls: 'bg-card-sheen border border-hair' },
];

const COLORS = [
  ['Coral', '#e84a33', 'bg-coral'], ['Coral deep', '#d13a24', 'bg-coral-deep'], ['Coral light', '#ff6b5e', 'bg-coral-light'],
  ['Coral soft', '#ffe7e2', 'bg-coral-soft'], ['Coral tint', '#fff3ef', 'bg-coral-tint border border-hair'],
  ['Canvas', '#faf6f0', 'bg-canvas border border-hair'], ['Surface', '#ffffff', 'bg-surface border border-hair'],
  ['Surface 2', '#f5efe6', 'bg-surface2'], ['Line', '#eadfd1', 'bg-line'],
  ['Ink', '#27201d', 'bg-ink'], ['Ink soft', '#6f645c', 'bg-ink-soft'], ['Ink faint', '#a89d93', 'bg-ink-faint'],
  ['Rail', '#241f1d', 'bg-rail'],
  ['Success', '#0e9f6e', 'bg-success'], ['Warning', '#d97706', 'bg-warning'], ['Error', '#e5484d', 'bg-error'], ['Info', '#3b82f6', 'bg-info'],
];

const SHADOWS = [
  ['e1', 'shadow-e1'], ['e2', 'shadow-e2'], ['e3', 'shadow-e3'], ['coral', 'shadow-coral'], ['coral-lg', 'shadow-coral-lg'],
];

function Section({ title, children }) {
  return (
    <section className="mb-12">
      <h2 className="font-display text-[1.6rem] font-semibold tracking-tight mb-5 pb-2 border-b border-hair">{title}</h2>
      {children}
    </section>
  );
}

export default function StyleGuide() {
  const [tab, setTab] = React.useState('a');
  return (
    <div className="app-root min-h-dvh bg-canvas text-ink font-sans">
      <header className="sticky top-0 z-20 bg-canvas/70 backdrop-blur-xl border-b border-hair">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid place-items-center w-8 h-8 rounded-[10px] bg-aurora text-white shadow-coral">✦</span>
            <span className="font-display font-semibold text-[1.2rem] tracking-tight">EffySocial</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"><ArrowLeft className="w-4 h-4" /> Home</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-coral-ink bg-coral-tint ring-1 ring-inset ring-coral/20 px-3.5 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" /> Design system
          </span>
          <h1 className="mt-4 font-display text-[2.6rem] font-semibold tracking-tightest leading-tight">Bright Studio</h1>
          <p className="mt-2 text-ink-soft max-w-2xl leading-relaxed">The living reference for EffySocial's UI — gradients, colour, elevation, type and components, rendered from the real tokens (<code className="text-coral-ink">tailwind.config.js</code> + <code className="text-coral-ink">src/ui</code>).</p>
        </div>

        {/* Gradients */}
        <Section title="Gradients">
          <div className="grid sm:grid-cols-3 gap-4">
            {GRADIENTS.map((g) => (
              <div key={g.name} className="rounded-2xl overflow-hidden border border-hair shadow-e1">
                <div className={`h-28 ${g.cls}`} />
                <div className="p-3 bg-surface">
                  <div className="font-bold text-sm">{g.label}</div>
                  <div className="text-[0.7rem] text-ink-faint mt-0.5">bg-{g.name}</div>
                  <div className="text-[0.65rem] text-ink-faint mt-1 font-mono break-words">{g.css}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Colours */}
        <Section title="Colour">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {COLORS.map(([name, hex, cls]) => (
              <div key={name}>
                <div className={`h-16 rounded-xl shadow-e1 ${cls}`} />
                <div className="text-xs font-semibold mt-1.5">{name}</div>
                <div className="text-[0.65rem] text-ink-faint font-mono">{hex}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Elevation */}
        <Section title="Elevation">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {SHADOWS.map(([name, cls]) => (
              <div key={name} className={`h-24 rounded-2xl bg-surface grid place-items-center text-sm font-bold text-ink-soft ${cls}`}>{name}</div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">Display — Fraunces</p>
            <p className="font-display text-5xl font-semibold tracking-tightest">Grow your brand</p>
            <p className="font-display text-3xl font-semibold tracking-tight">Section heading</p>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-faint pt-4">Body — Manrope</p>
            <p className="text-lg text-ink">Large body — plan, create, publish and convert.</p>
            <p className="text-sm text-ink-soft">Default body — from your first post to your next paying customer.</p>
            <p className="text-xs text-ink-faint">Caption / meta — supporting detail.</p>
            <p className="text-2xl font-extrabold tabular-nums tracking-tightest pt-2">₹4,20,000 · 342 · 4.2×</p>
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Button>Primary</Button>
            <Button variant="spark"><Sparkles className="w-4 h-4" /> Spark</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badges & status">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <Badge>Default</Badge>
            <Badge tone="coral"><Flame className="w-3 h-3" /> Coral</Badge>
            <Badge tone="new">New</Badge>
            <Badge tone="success"><Check className="w-3 h-3" /> Success</Badge>
            <Badge tone="warning">Warning</Badge>
            <Badge tone="error">Error</Badge>
            <Badge tone="info">Info</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {['live', 'scheduled', 'draft', 'paused', 'good', 'attention', 'poor'].map((s) => <StatusBadge key={s} status={s} />)}
          </div>
        </Section>

        {/* Components */}
        <Section title="Components">
          <div className="grid sm:grid-cols-3 gap-4 mb-5">
            <MetricCard label="Revenue" value="₹4.2L" delta="18%" deltaDir="up" hint="vs last month" />
            <MetricCard label="Leads" value="342" delta="12%" deltaDir="up" hint="this cycle" />
            <MetricCard label="CPL" value="₹307" delta="4%" deltaDir="down" hint="improving" />
          </div>
          <Card className="p-5 mb-5">
            <h3 className="font-bold mb-3">Card with tabs & pacing</h3>
            <Tabs tabs={[{ id: 'a', label: 'Overview' }, { id: 'b', label: 'Details', count: 3 }]} active={tab} onChange={setTab} />
            <div className="space-y-3">
              <div><div className="flex justify-between text-xs mb-1"><span className="font-semibold">Budget pacing</span><span className="text-ink-soft">₹28k / ₹40k</span></div><Pacing value={28} max={40} /></div>
              <div><div className="flex justify-between text-xs mb-1"><span className="font-semibold">At risk</span><span className="text-ink-soft">92%</span></div><Pacing value={92} max={100} tone="warning" /></div>
            </div>
          </Card>
          <EmptyState icon="🎯" title="Nothing here yet" body="Empty states use a soft coral tile, serif heading and a clear next action." action={<Button>Take action</Button>} />
        </Section>

        <p className="text-center text-xs text-ink-faint py-8">EffySocial · Bright Studio design system · rendered live from tokens</p>
      </main>
    </div>
  );
}
