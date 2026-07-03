// Platform + post-type catalogue mirrored from the backend's PLATFORM_RULES.
export const PLATFORMS = [
  {
    id: 'instagram',
    label: 'Instagram',
    color: '#E1306C',
    postTypes: [
      { id: 'post', label: 'Post' },
      { id: 'carousel', label: 'Carousel' },
      { id: 'reel', label: 'Reel' },
      { id: 'story', label: 'Story' },
    ],
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    color: '#0f1419',
    postTypes: [
      { id: 'post', label: 'Post' },
      { id: 'thread', label: 'Thread' },
      { id: 'video', label: 'Video' },
    ],
  },
  {
    id: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    postTypes: [
      { id: 'post', label: 'Post' },
      { id: 'reel', label: 'Reel' },
      { id: 'video', label: 'Video' },
    ],
  },
  {
    id: 'youtube',
    label: 'YouTube',
    color: '#FF0000',
    postTypes: [
      { id: 'short', label: 'Short' },
      { id: 'video', label: 'Video' },
      { id: 'thumbnail', label: 'Thumbnail' },
    ],
  },
];

export const VIDEO_TYPES = new Set(['reel', 'short', 'video', 'story']);

export const TONES = [
  'professional yet friendly',
  'bold and witty',
  'inspirational',
  'educational and clear',
  'premium and minimal',
];

export const INDUSTRIES = [
  'Banking',
  'Real Estate',
  'Healthcare',
  'Retail',
  'Technology',
  'Education',
  'Hospitality',
  'Other',
];

export const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Hinglish'];
