// Disposable event kiosk config. Delete src/event/ + the /event route to remove.

// Client-side gate only (UX, not security) — unlocks publish/delete for volunteers.
export const EVENT_PIN = '2468';

// Fast, publishable image formats for the Quick Create tile (video lives in the
// other tiles). `type` matches the studio format ids the backend already knows.
export const QUICK_FORMATS = [
  { id: 'ig_post', label: 'Instagram Post', aspect: '4 / 5', platform: 'instagram' },
  { id: 'fb_post', label: 'Facebook', aspect: '1 / 1', platform: 'facebook' },
  { id: 'li_post', label: 'LinkedIn', aspect: '1 / 1', platform: 'linkedin' },
  { id: 'wa_promo', label: 'WhatsApp', aspect: '1 / 1', platform: 'whatsapp' },
];

// Format object the reused Storyboard component expects for YouTube Story.
export const YT_STORY_FORMAT = { id: 'yt_story', label: 'YouTube Story', platform: 'youtube', aspect: '16 / 9', storyboard: true };
