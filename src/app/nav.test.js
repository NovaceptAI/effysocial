import { describe, expect, it } from 'vitest';
import { railMode } from './nav';

// Which rail shows (G45, SHELL-002): shared routes keep the rail you came from.
describe('railMode', () => {
  it.each([
    ['/app', 'pm', 'hub'], ['/app/', 'pm', 'hub'],                   // Home is always the hub
    ['/app/campaigns', 'hub', 'pm'], ['/app/home', null, 'pm'],      // marketing routes always the deep rail
    ['/app/studio', 'pm', 'pm'], ['/app/media', 'pm', 'pm'], ['/app/settings', 'pm', 'pm'], ['/app/films/3', 'pm', 'pm'],
    ['/app/studio', 'hub', 'hub'], ['/app/settings', null, 'hub'],   // from the hub, or a fresh load, stay on the hub
  ])('%s after %s → %s', (path, previous, expected) => {
    expect(railMode(path, previous)).toBe(expected);
  });
});
