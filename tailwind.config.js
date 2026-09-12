/** @type {import('tailwindcss').Config} */
export default {
  // Scope content scanning to the new app + shared UI. Existing plain-CSS
  // pages are unaffected because preflight is disabled below.
  content: [
    './index.html',
    './src/app/**/*.{js,jsx}',
    './src/ui/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/marketing/**/*.{js,jsx}',
    './src/event/**/*.{js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'Cambria', 'serif'],
        num: ['Manrope', 'ui-monospace', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.03em',
      },
      colors: {
        // Neutral + coral tokens are CSS-variable-backed (RGB channels) so the
        // product app (.app-root) can render a luxury-dark theme while the
        // marketing site keeps the light defaults. See src/styles/theme.css.
        canvas: 'rgb(var(--ui-canvas) / <alpha-value>)',
        cream: 'rgb(var(--ui-cream) / <alpha-value>)',
        surface: 'rgb(var(--ui-surface) / <alpha-value>)',
        surface2: 'rgb(var(--ui-surface2) / <alpha-value>)',
        line: 'rgb(var(--ui-line) / <alpha-value>)',
        hair: 'rgb(var(--ui-hair) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--ui-ink) / <alpha-value>)',
          soft: 'rgb(var(--ui-ink-soft) / <alpha-value>)',
          faint: 'rgb(var(--ui-ink-faint) / <alpha-value>)',
        },
        coral: {
          DEFAULT: 'rgb(var(--ui-coral) / <alpha-value>)', // primary action
          deep: '#d13a24',    // gradient end / pressed (static)
          soft: 'rgb(var(--ui-coral-soft) / <alpha-value>)',
          tint: 'rgb(var(--ui-coral-tint) / <alpha-value>)',
          light: '#ff6b5e',   // spark (static)
          ink: 'rgb(var(--ui-coral-ink) / <alpha-value>)', // text/links
        },
        // Navigation rail — variable-backed so it flips with the dark/light
        // app theme (see --ui-rail-* in src/styles/theme.css).
        rail: {
          DEFAULT: 'rgb(var(--ui-rail) / <alpha-value>)',
          soft: 'rgb(var(--ui-rail-soft) / <alpha-value>)',
          line: 'rgb(var(--ui-rail-line) / <alpha-value>)',
          ink: 'rgb(var(--ui-rail-ink) / <alpha-value>)',
          muted: 'rgb(var(--ui-rail-muted) / <alpha-value>)',
          active: {
            DEFAULT: 'rgb(var(--ui-rail-active) / <alpha-value>)',
            ink: 'rgb(var(--ui-rail-active-ink) / <alpha-value>)',
          },
        },
        success: { DEFAULT: 'rgb(var(--ui-success) / <alpha-value>)', soft: 'rgb(var(--ui-success-soft) / <alpha-value>)' },
        warning: { DEFAULT: 'rgb(var(--ui-warning) / <alpha-value>)', soft: 'rgb(var(--ui-warning-soft) / <alpha-value>)' },
        error: { DEFAULT: 'rgb(var(--ui-error) / <alpha-value>)', soft: 'rgb(var(--ui-error-soft) / <alpha-value>)' },
        info: { DEFAULT: 'rgb(var(--ui-info) / <alpha-value>)', soft: 'rgb(var(--ui-info-soft) / <alpha-value>)' },
        // Data-viz categorical
        dv: { 1: '#ff6b5e', 2: '#f59e0b', 3: '#14b8a6', 4: '#ec4899', 5: '#38bdf8', 6: '#475569' },
      },
      borderRadius: {
        // Softer, larger radii — nothing boxy.
        xs: '10px', sm: '12px', md: '16px', lg: '20px', xl: '26px', '2xl': '22px',
      },
      boxShadow: {
        // Variable-backed so cards gain a hairline + soft depth on dark while
        // staying feather-light on the light marketing theme.
        e1: 'var(--ui-e1)',
        e2: 'var(--ui-e2)',
        e3: 'var(--ui-e3)',
        coral: '0 4px 14px -6px rgba(232,74,51,0.30)',
        'coral-lg': '0 8px 22px -8px rgba(232,74,51,0.34)',
        sheen: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      backgroundImage: {
        // Cohesive coral→amber warmth (no off-palette pink).
        aurora: 'linear-gradient(105deg, #ff6b5e 0%, #f0512f 46%, #f59e0b 100%)',
        'coral-btn': 'linear-gradient(180deg, #ef5942 0%, #e84a33 55%, #dc4029 100%)',
        'card-sheen': 'var(--ui-card-sheen)',
      },
    },
  },
  corePlugins: {
    // Disabled so Tailwind's CSS reset does NOT alter the existing
    // plain-CSS marketing + tool pages. The app shell adds its own scoped reset.
    preflight: false,
  },
  plugins: [],
};
