// Shared UI constants (channel branding + post-status labels).
// These are product configuration, not data — kept separate from any API state.

export const CHANNELS = {
  instagram: { label: 'Instagram', color: '#E1306C' },
  facebook: { label: 'Facebook', color: '#1877F2' },
  linkedin: { label: 'LinkedIn', color: '#0A66C2' },
  youtube: { label: 'YouTube', color: '#FF0000' },
  twitter: { label: 'X', color: '#0f1419' },
};

export const POST_STATUS = {
  idea: { label: 'Idea', tone: 'default' },
  draft: { label: 'Draft', tone: 'default' },
  internal_review: { label: 'Internal review', tone: 'warning' },
  client_review: { label: 'Client review', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  scheduled: { label: 'Scheduled', tone: 'info' },
  published: { label: 'Published', tone: 'success' },
  failed: { label: 'Failed', tone: 'error' },
};
