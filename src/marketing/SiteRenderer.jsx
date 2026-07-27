import React, { useEffect } from 'react';
import { resolveTheme } from '../lib/brandTheme';
import { STYLES } from '../app/sites/templates.js';

// Shared presentational renderer for a generated brand site. Colours come from
// the brand logo (resolveTheme); typography/shape/layout come from the style.
// Used by the public hosted page and the in-app builder preview.

function useGoogleFont(spec) {
  useEffect(() => {
    if (!spec) return undefined;
    const href = `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;
    if (document.querySelector(`link[data-sitefont="${spec}"]`)) return undefined;
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = href; link.dataset.sitefont = spec;
    document.head.appendChild(link);
    return undefined;
  }, [spec]);
}

const waLink = (n) => {
  const d = String(n || '').replace(/[^0-9]/g, '');
  return d ? `https://wa.me/${d}` : '';
};

function Btn({ theme, style, children, onClick, href, variant = 'primary' }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
    padding: '12px 22px', borderRadius: style.radius, fontWeight: 700, fontSize: 15,
    textDecoration: 'none', border: '1.5px solid transparent', transition: 'opacity .15s',
  };
  const skin = variant === 'primary'
    ? { background: theme.primary, color: theme.primaryInk }
    : { background: 'transparent', color: theme.primary, borderColor: theme.primary };
  const props = { style: { ...base, ...skin }, onClick };
  return href ? <a href={href} target="_blank" rel="noreferrer" {...props}>{children}</a> : <button {...props}>{children}</button>;
}

function Section({ children, bg, theme, style, pad = 88 }) {
  return (
    <section style={{ background: bg || theme.bg, padding: `${pad}px 24px` }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

const H = (theme, style, size) => ({
  fontFamily: style.fontHead, fontWeight: style.headWeight, color: theme.ink,
  fontSize: size, lineHeight: 1.12, letterSpacing: '-0.01em', margin: 0,
});

function Hero({ s, theme, style, cta, onCta }) {
  const left = style.hero === 'left' || style.hero === 'split';
  const onDark = style.band === 'solid';
  const bg = onDark ? undefined : theme.bg;
  const wrapStyle = onDark
    ? { background: `linear-gradient(135deg, ${theme.heroFrom}, ${theme.heroTo})`, color: theme.primaryInk }
    : { background: theme.surface };
  const ink = onDark ? theme.primaryInk : theme.ink;
  const sub = onDark ? theme.primaryInk : theme.muted;
  return (
    <section style={{ ...wrapStyle, padding: '110px 24px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: left ? 'left' : 'center' }}>
        {s.kicker && <div style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 12, fontWeight: 700, opacity: 0.85, marginBottom: 16, color: onDark ? theme.primaryInk : theme.primary }}>{s.kicker}</div>}
        <h1 style={{ ...H(theme, style, 'clamp(34px, 5vw, 60px)'), color: ink, maxWidth: left ? 760 : 860, marginInline: left ? 0 : 'auto' }}>{s.headline}</h1>
        {s.sub && <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: sub, marginTop: 20, maxWidth: 620, marginInline: left ? 0 : 'auto', lineHeight: 1.6 }}>{s.sub}</p>}
        <div style={{ marginTop: 30, display: 'flex', gap: 12, justifyContent: left ? 'flex-start' : 'center', flexWrap: 'wrap' }}>
          <Btn theme={onDark ? { ...theme, primary: theme.primaryInk, primaryInk: theme.primary } : theme} style={style} onClick={onCta}>{s.cta || cta}</Btn>
        </div>
      </div>
    </section>
  );
}

function About({ s, theme, style }) {
  return (
    <Section theme={theme} style={style}>
      <div style={{ maxWidth: 760 }}>
        <h2 style={H(theme, style, 'clamp(26px,3vw,38px)')}>{s.title}</h2>
        <p style={{ fontSize: 18, color: theme.muted, marginTop: 18, lineHeight: 1.75, whiteSpace: 'pre-line' }}>{s.body}</p>
      </div>
    </Section>
  );
}

function cardSkin(theme, style) {
  if (style.card === 'shadow') return { background: theme.bg, boxShadow: '0 10px 30px -18px rgba(0,0,0,0.35)', border: `1px solid ${theme.border}` };
  if (style.card === 'border') return { background: theme.bg, border: `1px solid ${theme.border}` };
  return { background: theme.surface };
}

function Grid({ s, theme, style, bg }) {
  return (
    <Section theme={theme} style={style} bg={bg}>
      <h2 style={{ ...H(theme, style, 'clamp(24px,3vw,34px)'), marginBottom: 28 }}>{s.title}</h2>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {(s.items || []).map((it, i) => (
          <div key={i} style={{ ...cardSkin(theme, style), borderRadius: style.radius, padding: 22 }}>
            <div style={{ width: 40, height: 4, background: theme.primary, borderRadius: 4, marginBottom: 14 }} />
            <div style={{ fontFamily: style.fontHead, fontWeight: 700, fontSize: 18, color: theme.ink }}>{it.name}</div>
            {it.desc && <div style={{ color: theme.muted, marginTop: 8, fontSize: 15, lineHeight: 1.6 }}>{it.desc}</div>}
          </div>
        ))}
      </div>
    </Section>
  );
}

function Faq({ s, theme, style }) {
  return (
    <Section theme={theme} style={style} bg={theme.surface}>
      <h2 style={{ ...H(theme, style, 'clamp(24px,3vw,34px)'), marginBottom: 24 }}>{s.title}</h2>
      <div style={{ maxWidth: 780, display: 'grid', gap: 14 }}>
        {(s.items || []).map((it, i) => (
          <div key={i} style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: style.radius, padding: '18px 22px' }}>
            <div style={{ fontWeight: 700, color: theme.ink, fontSize: 16 }}>{it.q}</div>
            {it.a && <div style={{ color: theme.muted, marginTop: 8, lineHeight: 1.6 }}>{it.a}</div>}
          </div>
        ))}
      </div>
    </Section>
  );
}

function Cta({ s, theme, style, onCta }) {
  return (
    <section style={{ background: `linear-gradient(135deg, ${theme.heroFrom}, ${theme.heroTo})`, color: theme.primaryInk, padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ ...H(theme, style, 'clamp(26px,3.4vw,40px)'), color: theme.primaryInk }}>{s.headline}</h2>
        {s.sub && <p style={{ marginTop: 14, fontSize: 18, opacity: 0.9 }}>{s.sub}</p>}
        <div style={{ marginTop: 26 }}>
          <Btn theme={{ ...theme, primary: theme.primaryInk, primaryInk: theme.primary }} style={style} onClick={onCta}>{s.cta}</Btn>
        </div>
      </div>
    </section>
  );
}

function Contact({ s, theme, style }) {
  const wa = waLink(s.whatsapp);
  return (
    <Section theme={theme} style={style}>
      <h2 style={{ ...H(theme, style, 'clamp(24px,3vw,34px)'), marginBottom: 20 }}>{s.title || 'Get in touch'}</h2>
      <div style={{ display: 'grid', gap: 10, color: theme.muted, fontSize: 16 }}>
        {s.address && <div>📍 {s.address}</div>}
        {s.phone && <div>📞 <a href={`tel:${s.phone}`} style={{ color: theme.primary }}>{s.phone}</a></div>}
        {s.email && <div>✉️ <a href={`mailto:${s.email}`} style={{ color: theme.primary }}>{s.email}</a></div>}
      </div>
      {wa && <div style={{ marginTop: 22 }}><Btn theme={theme} style={style} href={wa}>Message us on WhatsApp</Btn></div>}
    </Section>
  );
}

function renderSection(s, i, theme, style, cta, onCta) {
  switch (s.type) {
    case 'hero': return <Hero key={i} s={s} theme={theme} style={style} cta={cta} onCta={onCta} />;
    case 'about': return <About key={i} s={s} theme={theme} style={style} />;
    case 'services': return <Grid key={i} s={s} theme={theme} style={style} />;
    case 'offers': return <Grid key={i} s={s} theme={theme} style={style} bg={theme.surface} />;
    case 'faq': return <Faq key={i} s={s} theme={theme} style={style} />;
    case 'cta': return <Cta key={i} s={s} theme={theme} style={style} onCta={onCta} />;
    case 'contact': return <Contact key={i} s={s} theme={theme} style={style} />;
    default: return null;
  }
}

export default function SiteRenderer({ site, activePage, onNav }) {
  const style = STYLES[site?.style] || STYLES.minimal;
  const theme = resolveTheme(site?.theme?.colors || []);
  useGoogleFont(style.googleFonts);
  const pages = site?.pages || [];
  const page = pages.find((p) => p.key === activePage) || pages[0];
  const cta = (page?.sections?.find((s) => s.type === 'hero')?.cta) || 'Get started';
  const logoUrl = site?.theme?.logoUrl;
  const contactPage = pages.find((p) => (p.sections || []).some((s) => s.type === 'contact')) || pages[pages.length - 1];
  const onCta = () => onNav?.(contactPage?.key || pages[0]?.key);

  if (!page) return null;

  return (
    <div style={{ background: theme.bg, color: theme.ink, fontFamily: style.fontBody, minHeight: '100%' }}>
      {/* Nav */}
      <header style={{ position: 'sticky', top: 0, zIndex: 10, background: theme.bg, borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => onNav?.(pages[0].key)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', cursor: 'pointer', border: 0 }}>
            {logoUrl
              ? <img src={logoUrl} alt="" style={{ height: 34, width: 'auto', objectFit: 'contain' }} />
              : <span style={{ fontFamily: style.fontHead, fontWeight: style.headWeight, fontSize: 20, color: theme.ink }}>{site.name?.replace(/ — website$/, '')}</span>}
          </button>
          <nav style={{ marginLeft: 'auto', display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            {pages.map((p) => (
              <button key={p.key} onClick={() => onNav?.(p.key)}
                style={{
                  background: 'transparent', border: 0, cursor: 'pointer', padding: '8px 12px', borderRadius: 8,
                  fontSize: 14, fontWeight: 600, color: p.key === page.key ? theme.primary : theme.muted,
                  textTransform: style.navUpper ? 'uppercase' : 'none', letterSpacing: style.navUpper ? '0.08em' : 0,
                }}>{p.nav}</button>
            ))}
            <span style={{ marginLeft: 8 }}><Btn theme={theme} style={{ ...style, radius: style.radius }} onClick={onCta}>{cta}</Btn></span>
          </nav>
        </div>
      </header>

      {/* Sections */}
      {(page.sections || []).map((s, i) => renderSection(s, i, theme, style, cta, onCta))}

      {/* Footer */}
      <footer style={{ background: theme.ink, color: theme.bg, padding: '40px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', opacity: 0.85, fontSize: 14 }}>
          <span>© {new Date().getFullYear()} {site.name?.replace(/ — website$/, '')}</span>
          <span>Built with EffySocial</span>
        </div>
      </footer>
    </div>
  );
}
