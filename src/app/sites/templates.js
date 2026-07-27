// Site Builder registry — vertical metadata (for the picker) + style variants
// (visual tokens applied over the brand's logo palette by the renderer).
// Vertical KEYS must match VERTICALS in the backend sites.py.

export const VERTICALS = [
  { key: 'retail', label: 'Retail / Shop', blurb: 'Products, offers & a shopfront.' },
  { key: 'restaurant', label: 'Restaurant / Café', blurb: 'Menu, ambience & reservations.' },
  { key: 'clinic', label: 'Clinic / Healthcare', blurb: 'Services, trust & appointments.' },
  { key: 'salon', label: 'Salon / Spa', blurb: 'Treatments, gallery & bookings.' },
  { key: 'real_estate', label: 'Real Estate', blurb: 'Listings, enquiries & credibility.' },
  { key: 'services', label: 'Professional Services', blurb: 'Services, proof & quotes.' },
];

// Each style is a set of visual tokens. Colours ALWAYS come from the brand logo
// (resolveTheme); styles only change typography, shape, spacing and layout.
export const STYLES = {
  bold: {
    label: 'Bold', blurb: 'Big type, strong colour blocks.',
    googleFonts: 'Poppins:wght@600;700;800&family=Inter:wght@400;500;600',
    fontHead: "'Poppins', system-ui, sans-serif", fontBody: "'Inter', system-ui, sans-serif",
    radius: '18px', hero: 'left', card: 'shadow', band: 'solid', navUpper: true, headWeight: 800,
  },
  minimal: {
    label: 'Minimal', blurb: 'Clean, airy, lots of white space.',
    googleFonts: 'Inter:wght@400;500;600;700',
    fontHead: "'Inter', system-ui, sans-serif", fontBody: "'Inter', system-ui, sans-serif",
    radius: '12px', hero: 'center', card: 'border', band: 'tint', navUpper: false, headWeight: 700,
  },
  classic: {
    label: 'Classic', blurb: 'Elegant serif, timeless.',
    googleFonts: 'Playfair+Display:wght@600;700&family=Lora:wght@400;500',
    fontHead: "'Playfair Display', Georgia, serif", fontBody: "'Lora', Georgia, serif",
    radius: '6px', hero: 'center', card: 'border', band: 'tint', navUpper: false, headWeight: 700,
  },
  warm: {
    label: 'Warm', blurb: 'Friendly, rounded, inviting.',
    googleFonts: 'Fraunces:opsz,wght@9..144,600;9..144,700&family=Nunito:wght@400;600;700',
    fontHead: "'Fraunces', Georgia, serif", fontBody: "'Nunito', system-ui, sans-serif",
    radius: '24px', hero: 'split', card: 'shadow', band: 'solid', navUpper: false, headWeight: 700,
  },
  editorial: {
    label: 'Editorial', blurb: 'Magazine feel, refined.',
    googleFonts: 'Libre+Baskerville:wght@400;700&family=Inter:wght@400;500;600',
    fontHead: "'Libre Baskerville', Georgia, serif", fontBody: "'Inter', system-ui, sans-serif",
    radius: '2px', hero: 'left', card: 'flat', band: 'tint', navUpper: true, headWeight: 700,
  },
};

export const STYLE_LIST = Object.entries(STYLES).map(([key, v]) => ({ key, ...v }));
