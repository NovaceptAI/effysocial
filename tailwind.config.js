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
        num: ['Manrope', 'ui-monospace', 'sans-serif'],
      },
      colors: {
        // Bright Studio — coral + cream, warm neutrals
        canvas: '#faf6f0',
        cream: '#fbf4ea',
        surface: '#ffffff',
        surface2: '#f5efe6',
        line: '#ece2d6',
        ink: { DEFAULT: '#2a2320', soft: '#6f645c', faint: '#a89d93' },
        coral: {
          DEFAULT: '#e84a33', // primary action
          soft: '#ffe7e2',
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
        xs: '8px', sm: '10px', md: '14px', lg: '18px', xl: '24px',
      },
      boxShadow: {
        e1: '0 1px 2px rgba(42,35,32,0.06), 0 1px 3px rgba(42,35,32,0.05)',
        e2: '0 8px 28px rgba(42,35,32,0.08)',
        e3: '0 20px 48px rgba(42,35,32,0.12)',
      },
      backgroundImage: {
        aurora: 'linear-gradient(100deg, #ff6b5e 0%, #fb7185 48%, #f59e0b 100%)',
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
