/** @type {import('tailwindcss').Config} */
export default {
  // Scope content scanning to the new app + shared UI. Existing plain-CSS
  // pages are unaffected because preflight is disabled below.
  content: [
    './index.html',
    './src/app/**/*.{js,jsx}',
    './src/ui/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
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
        // Bright Studio — coral + cream, warm neutrals
        canvas: '#faf6f0',
        cream: '#fbf4ea',
        surface: '#ffffff',
        surface2: '#f5efe6',
        line: '#eadfd1',
        hair: '#f0e7db',      // hairline — softer than line, for luxe dividers
        ink: { DEFAULT: '#27201d', soft: '#6f645c', faint: '#a89d93' },
        coral: {
          DEFAULT: '#e84a33', // primary action
          deep: '#d13a24',    // gradient end / pressed
          soft: '#ffe7e2',
          tint: '#fff3ef',    // faintest coral wash
          light: '#ff6b5e',   // spark
          ink: '#c2410c',     // text/links on light
        },
        // Warm-charcoal navigation rail
        rail: {
          DEFAULT: '#241f1d',
          soft: '#322b27',
          line: '#3d3531',
          ink: '#e9e2da',
          muted: '#a89d93',
        },
        success: { DEFAULT: '#0e9f6e', soft: '#d6f3e7' },
        warning: { DEFAULT: '#d97706', soft: '#fdecd2' },
        error: { DEFAULT: '#e5484d', soft: '#fde7e7' },
        info: { DEFAULT: '#3b82f6', soft: '#e3edff' },
        // Data-viz categorical
        dv: { 1: '#ff6b5e', 2: '#f59e0b', 3: '#14b8a6', 4: '#ec4899', 5: '#38bdf8', 6: '#475569' },
      },
      borderRadius: {
        xs: '8px', sm: '10px', md: '14px', lg: '18px', xl: '24px', '2xl': '20px',
      },
      boxShadow: {
        // Warmer, more diffuse, layered — reads as soft depth, not a hard drop.
        e1: '0 1px 1px rgba(39,32,29,0.04), 0 2px 6px rgba(39,32,29,0.05)',
        e2: '0 2px 4px rgba(39,32,29,0.04), 0 10px 30px -8px rgba(39,32,29,0.10)',
        e3: '0 8px 16px -8px rgba(39,32,29,0.10), 0 28px 56px -16px rgba(39,32,29,0.16)',
        coral: '0 6px 16px -4px rgba(232,74,51,0.32), 0 2px 4px rgba(232,74,51,0.20)',
        'coral-lg': '0 12px 28px -6px rgba(232,74,51,0.38), 0 2px 6px rgba(232,74,51,0.22)',
        // Inner top-highlight that gives white cards a subtle glassy lift.
        sheen: 'inset 0 1px 0 rgba(255,255,255,0.7)',
      },
      backgroundImage: {
        // Cohesive coral→amber warmth (no off-palette pink).
        aurora: 'linear-gradient(105deg, #ff6b5e 0%, #f0512f 46%, #f59e0b 100%)',
        'coral-btn': 'linear-gradient(180deg, #ef5942 0%, #e84a33 55%, #dc4029 100%)',
        'card-sheen': 'linear-gradient(180deg, #ffffff 0%, #fdfaf6 100%)',
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
