// Business categories for onboarding, grouped so the list stays scannable. Aimed at
// covering most businesses, especially Indian SMBs, agencies' clients and co-operatives.
// Anything missing is typed in via "Other".
export const INDUSTRY_GROUPS = [
  ['Technology & digital', [
    'AI & automation services', 'Software & SaaS', 'IT services & consulting', 'Web & app development',
    'Cybersecurity', 'Data & analytics', 'Telecom & internet services', 'Electronics & gadgets', 'Gaming & esports',
  ]],
  ['Marketing, media & creative', [
    'Marketing & advertising agency', 'Digital marketing & SEO', 'PR & communications', 'Media & publishing',
    'Film, video & animation', 'Photography', 'Design & branding', 'Content creator & influencer',
    'Events & exhibitions', 'Music & performing arts',
  ]],
  ['Professional services', [
    'Business consulting', 'Accounting, tax & CA firm', 'Legal services', 'HR, staffing & recruitment',
    'Architecture', 'Engineering services', 'Printing & packaging', 'Translation & localisation', 'Coworking & office space',
  ]],
  ['Banking, finance & insurance', [
    'Bank', 'Cooperative bank & credit society', 'NBFC & lending', 'Microfinance', 'Insurance',
    'Wealth management & stock broking', 'Mutual fund distribution', 'Fintech & payments',
  ]],
  ['Real estate & construction', [
    'Real estate developer', 'Real estate agent & broker', 'Construction & contracting', 'Building materials & hardware',
    'Interior design & home improvement', 'Waterproofing, paints & coatings', 'Property management', 'Home services (plumbing, electrical, cleaning)',
  ]],
  ['Healthcare & wellness', [
    'Hospital', 'Clinic & doctor', 'Dental clinic', 'Eye care & optical', 'Diagnostics & pathology lab', 'Pharmacy',
    'Physiotherapy & rehab', 'Mental health & counselling', 'Ayurveda, homeopathy & alternative medicine',
    'IVF & fertility', 'Medical devices', 'Pharmaceuticals', 'Veterinary & pet care',
  ]],
  ['Beauty, fitness & lifestyle', [
    'Salon & spa', 'Cosmetics & skincare', 'Gym & fitness studio', 'Yoga & wellness', 'Nutrition & diet', 'Tattoo & body art',
  ]],
  ['Education & training', [
    'School', 'College & university', 'Coaching & test prep', 'Online courses & edtech', 'Skill & vocational training',
    'Preschool & daycare', 'Language learning', 'Study abroad & admissions consulting', 'Music, dance & art classes',
  ]],
  ['Food & hospitality', [
    'Restaurant & café', 'Cloud kitchen', 'Bakery, sweets & desserts', 'Catering', 'Hotel & resort', 'Homestay & serviced apartments',
    'Bar, pub & brewery', 'Packaged food & beverages', 'Tea, coffee & spices',
  ]],
  ['Retail & ecommerce', [
    'D2C brand', 'Online store & marketplace seller', 'Fashion & apparel', 'Jewellery', 'Footwear & accessories',
    'Furniture & home décor', 'Consumer electronics & appliances store', 'Supermarket & grocery', 'Books & stationery',
    'Toys & baby products', 'Sports & fitness equipment', 'Gifts & handicrafts', 'Mobile & computer store',
  ]],
  ['Automotive & transport', [
    'Car dealership', 'Two-wheeler dealership', 'Used cars', 'Auto service & repair', 'Auto parts & accessories',
    'Car rental & taxi', 'Logistics, courier & delivery', 'Electric vehicles & charging',
  ]],
  ['Travel & tourism', [
    'Travel agency & tour operator', 'Visa & immigration services', 'Airline & aviation', 'Adventure & experiences',
  ]],
  ['Manufacturing, trade & agriculture', [
    'Manufacturing', 'Textiles & garments manufacturing', 'Chemicals & plastics', 'Industrial machinery & equipment',
    'Import, export & trading', 'Wholesale & distribution', 'Agriculture & agri-inputs', 'Dairy & farm produce', 'FMCG',
  ]],
  ['Energy & utilities', [
    'Solar & renewable energy', 'Oil, gas & power', 'Water purification & treatment', 'Waste management & recycling',
  ]],
  ['Community, public & personal services', [
    'NGO & non-profit', 'Government & public sector', 'Religious & spiritual organisation', 'Political campaign',
    'Association, club & community', 'Wedding planning & services', 'Laundry & dry cleaning', 'Security services',
    'Pest control', 'Repair & maintenance services', 'Astrology & spiritual services', 'Driving school', 'Funeral services',
  ]],
];

export const INDUSTRIES = INDUSTRY_GROUPS.flatMap(([, items]) => items);
