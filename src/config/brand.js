// Single source of branding truth. A white-label client fork changes ONLY
// this file (+ .env VITE_SITE_NAME) — nothing else references the platform
// name directly.
export const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'EffySocial';

// Platform chrome: the "Console" link + NovaceptAI footer. A client fork
// flips this to false to remove every platform reference in one move.
export const SHOW_PLATFORM_CHROME = false;

export const PLATFORM_NAME = 'NovaceptAI';
export const CONSOLE_URL = '/console';
export const ENGINES_TAG = 'LOGOS · NEXUS';
