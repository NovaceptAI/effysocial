// Brand Brain sample content — a living knowledge centre per workspace.
// Generic, realistic template personalised by industry. Swapped for real
// RAG-extracted data (pgvector over uploaded sources) when the backend lands.

export const SECTIONS = [
  { id: 'summary', label: 'Brand summary', kind: 'paragraph' },
  { id: 'tone', label: 'Tone & personality', kind: 'chips' },
  { id: 'approved', label: 'Approved words', kind: 'chips' },
  { id: 'prohibited', label: 'Prohibited words', kind: 'chips' },
  { id: 'products', label: 'Products & services', kind: 'list' },
  { id: 'offers', label: 'Offers & pricing', kind: 'list' },
  { id: 'personas', label: 'Audience personas', kind: 'personas' },
  { id: 'faqs', label: 'FAQs', kind: 'faqs' },
  { id: 'objections', label: 'Objections & responses', kind: 'faqs' },
  { id: 'competitors', label: 'Competitors', kind: 'list' },
  { id: 'visual', label: 'Colours & typography', kind: 'visual' },
  { id: 'legal', label: 'Legal & compliance', kind: 'list' },
  { id: 'sources', label: 'Uploaded sources', kind: 'sources' },
];

const INDUSTRY = {
  'Dental clinic': {
    products: [
      { title: 'Braces & Aligners', desc: 'Metal, ceramic and clear aligner treatments with EMI options.' },
      { title: 'Root Canal Treatment', desc: 'Single-sitting RCT with rotary endodontics.' },
      { title: 'Teeth Whitening', desc: 'In-clinic and take-home whitening.' },
      { title: 'Dental Implants', desc: 'Single and full-arch implant solutions.' },
    ],
    personas: [
      { name: 'Anxious First-Timer', age: '25–35', motivation: 'Wants painless, transparent pricing and gentle handling.' },
      { name: 'Parent of Teen', age: '38–48', motivation: 'Researching braces for a child; values trust and EMI.' },
    ],
    compliance: [
      { title: 'No guaranteed outcomes', desc: 'Never promise specific medical results; use "may help / typically".' },
      { title: 'Dental Council norms', desc: 'Avoid comparative claims vs named clinics; no before/after without consent.' },
    ],
  },
  'Cooperative bank': {
    products: [
      { title: 'Home Loans', desc: 'Competitive rates with quick sanction for salaried & self-employed.' },
      { title: 'Fixed Deposits', desc: 'Higher-than-market FD rates for members.' },
      { title: 'Gold Loans', desc: 'Instant gold loans at branch.' },
    ],
    personas: [
      { name: 'Local Saver', age: '35–55', motivation: 'Trusts the co-op brand; values safety and service.' },
      { name: 'Small Business Owner', age: '30–50', motivation: 'Needs working-capital and quick loans.' },
    ],
    compliance: [
      { title: 'RBI/AMFI disclaimers', desc: 'Investments subject to market risk; no assured returns language.' },
      { title: 'No fixed-return claims', desc: 'Avoid "guaranteed", "risk-free", specific % without [rate] placeholder.' },
    ],
  },
  'D2C ecommerce': {
    products: [
      { title: 'Glow Serum', desc: 'Vitamin-C brightening serum, dermat-tested.' },
      { title: 'Barrier Cream', desc: 'Ceramide moisturiser for sensitive skin.' },
    ],
    personas: [
      { name: 'Skincare Explorer', age: '22–32', motivation: 'Ingredient-conscious, reads reviews, shops on Instagram.' },
    ],
    compliance: [
      { title: 'Cosmetic claims only', desc: 'No medical/curative claims; "helps improve appearance of".' },
    ],
  },
};

const FALLBACK = {
  products: [{ title: 'Core Service', desc: 'Primary offering — add details from your website or catalogue.' }],
  personas: [{ name: 'Primary Customer', age: '25–45', motivation: 'Add motivations and pain points.' }],
  compliance: [{ title: 'Add compliance rules', desc: 'List any legal/industry restrictions for this brand.' }],
};

export function brandBrainFor(ws) {
  const ind = INDUSTRY[ws.industry] || FALLBACK;
  return {
    completeness: 78,
    needsReview: 3,
    lastUpdated: '2 days ago',
    summary: {
      status: 'good',
      sources: ['Website', 'Brand guidelines.pdf'],
      data: `${ws.name} is a ${ws.industry.toLowerCase()} based in ${ws.location}, known for trustworthy, friendly service and clear communication. The brand speaks warmly and professionally, avoids jargon, and always leads with the customer's benefit.`,
    },
    tone: { status: 'good', sources: ['Website'], data: ['Warm', 'Professional', 'Clear', 'Reassuring', 'Confident', 'Locally rooted'] },
    approved: { status: 'good', sources: ['Brand guidelines.pdf'], data: ['trusted', 'caring', 'transparent', 'affordable', 'expert', 'painless', 'book now'] },
    prohibited: { status: 'review', sources: ['Manual'], data: ['cheapest', 'guaranteed', 'best in city', '#1', 'risk-free'] },
    products: { status: 'good', sources: ['Website', 'Catalogue.pdf'], data: ind.products },
    offers: { status: 'review', sources: ['Manual'], data: [
      { title: 'Free first consultation', desc: 'Limited-time offer for new enquiries (verify validity).' },
      { title: 'EMI available', desc: 'No-cost EMI on treatments above [amount].' },
    ]},
    personas: { status: 'good', sources: ['Website', 'Past leads'], data: ind.personas },
    faqs: { status: 'good', sources: ['Website FAQ'], data: [
      { q: 'Where are you located?', a: `We're in ${ws.location}. Parking and easy access available.` },
      { q: 'Do you offer EMI?', a: 'Yes, no-cost EMI is available on eligible services.' },
    ]},
    objections: { status: 'review', sources: ['Sales calls'], data: [
      { q: '"It seems expensive."', a: 'Acknowledge, explain value + EMI, offer a free consult to assess actual cost.' },
      { q: '"I need to think about it."', a: 'Offer to hold a slot, share testimonials, set a gentle follow-up.' },
    ]},
    competitors: { status: 'good', sources: ['Social Listening'], data: [
      { title: 'Local Competitor A', desc: 'Heavy on festival offers; weak on educational content.' },
      { title: 'Local Competitor B', desc: 'Strong reels presence; limited reviews response.' },
    ]},
    visual: { status: 'good', sources: ['Brand guidelines.pdf'], data: {
      colors: [{ name: 'Primary', hex: ws.accent }, { name: 'Ink', hex: '#2a2320' }, { name: 'Cream', hex: '#fbf4ea' }],
      fonts: [{ role: 'Heading', name: 'Manrope' }, { role: 'Body', name: 'Manrope' }],
    }},
    legal: { status: 'review', sources: ['Manual'], data: ind.compliance },
    sources: { status: 'good', sources: [], data: [
      { name: `${ws.name} website`, type: 'website', confidence: 92, freshness: 'fresh', date: '2026-06-20' },
      { name: 'Brand guidelines.pdf', type: 'document', confidence: 88, freshness: 'fresh', date: '2026-06-10' },
      { name: 'Catalogue.pdf', type: 'document', confidence: 74, freshness: 'stale', date: '2026-03-02' },
      { name: 'Manual entries', type: 'manual', confidence: 100, freshness: 'fresh', date: '2026-06-22' },
    ]},
  };
}
