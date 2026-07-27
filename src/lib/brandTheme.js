// Brand theme engine — turn a client's logo colours into a complete, accessible
// site palette. Pure functions, no deps. Used by the site builder preview and
// the public site renderer so a site always themes to the brand's real colours.

export function hexToRgb(hex) {
  if (typeof hex !== 'string') return null;
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

export function rgbToHex({ r, g, b }) {
  const c = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function relLuminance({ r, g, b }) {
  const ch = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

export function contrast(a, b) {
  const ra = hexToRgb(a); const rb = hexToRgb(b);
  if (!ra || !rb) return 1;
  const la = relLuminance(ra); const lb = relLuminance(rb);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// Best readable text colour on a given background (WCAG-driven).
export function readableInk(bg) {
  return contrast(bg, '#ffffff') >= contrast(bg, '#141417') ? '#ffffff' : '#141417';
}

function mix(a, b, t) {
  const ra = hexToRgb(a); const rb = hexToRgb(b);
  if (!ra || !rb) return a;
  return rgbToHex({ r: ra.r + (rb.r - ra.r) * t, g: ra.g + (rb.g - ra.g) * t, b: ra.b + (rb.b - ra.b) * t });
}
export const lighten = (hex, t) => mix(hex, '#ffffff', t);
export const darken = (hex, t) => mix(hex, '#000000', t);

const lum = (hex) => { const c = hexToRgb(hex); return c ? relLuminance(c) : 0.5; };
const isNearWhite = (hex) => lum(hex) > 0.82;
const isNearBlack = (hex) => lum(hex) < 0.05;

const FALLBACK = { primary: '#E5484D', accent: '#0D0E12' };

// colors: array of hex strings (from Brand Brain visual.colors).
// Returns a full resolved palette; safe for empty/dark/light-only inputs.
export function resolveTheme(colors = [], opts = {}) {
  const valid = (colors || []).map((c) => hexToRgb(c) && rgbToHex(hexToRgb(c))).filter(Boolean);

  // Primary = first colour that works as a brand accent (not near-white/black).
  let primary = valid.find((c) => !isNearWhite(c) && !isNearBlack(c)) || valid[0] || FALLBACK.primary;
  if (isNearWhite(primary)) primary = darken(primary, 0.55);
  if (isNearBlack(primary)) primary = lighten(primary, 0.15);

  // Accent = a distinct second colour, else a deepened primary.
  let accent = valid.find((c) => c !== primary && !isNearWhite(c) && contrast(c, primary) > 1.15)
    || darken(primary, 0.28);
  if (isNearWhite(accent)) accent = darken(accent, 0.5);

  const primaryInk = readableInk(primary);
  const accentInk = readableInk(accent);

  // Neutrals — a warm-tinted light scheme so the whole site feels on-brand.
  const bg = '#ffffff';
  const surface = lighten(primary, 0.94);      // barely-there brand tint for cards/bands
  const surfaceStrong = lighten(primary, 0.88);
  const ink = darken(primary, 0.82);           // near-black, brand-hued
  const muted = mix(ink, '#ffffff', 0.42);
  const border = lighten(primary, 0.82);

  return {
    primary, primaryInk, accent, accentInk,
    bg, surface, surfaceStrong, ink, muted, border,
    heroFrom: primary,
    heroTo: darken(accent, 0.12),
    hasColors: valid.length > 0,
    ...opts,
  };
}

// Emit the resolved theme as inline CSS custom properties for a wrapper element.
export function themeVars(theme) {
  return {
    '--bp': theme.primary, '--bp-ink': theme.primaryInk,
    '--ba': theme.accent, '--ba-ink': theme.accentInk,
    '--bg': theme.bg, '--surface': theme.surface, '--surface-2': theme.surfaceStrong,
    '--ink': theme.ink, '--muted': theme.muted, '--border': theme.border,
    '--hero-from': theme.heroFrom, '--hero-to': theme.heroTo,
  };
}
