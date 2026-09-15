// Posts are planned in the organisation's timezone (the engine's publisher.org_zone,
// sent as org.timezone), so the calendar's "today" and published times use it too,
// not whatever timezone the browser happens to be in.
export const DEFAULT_ZONE = 'Asia/Kolkata';

const LABELS = {
  'Asia/Kolkata': 'India time', 'Asia/Dubai': 'UAE time', 'Asia/Singapore': 'Singapore time',
  'Europe/London': 'UK time', 'America/New_York': 'New York time', UTC: 'UTC',
};

export const zoneLabel = (zone) => LABELS[zone] || zone;
export const orgZone = (org) => org?.timezone || DEFAULT_ZONE;

function parts(moment, zone) {
  const format = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  return Object.fromEntries(format.formatToParts(moment).map((p) => [p.type, p.value]));
}

// { date: 'YYYY-MM-DD', time: 'HH:MM' } as the clock reads in `zone`.
export function nowIn(zone = DEFAULT_ZONE, moment = new Date()) {
  const p = parts(moment, zone);
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

export const todayIn = (zone, moment) => nowIn(zone, moment).date;

export function formatInZone(iso, zone = DEFAULT_ZONE, options = { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) {
  return new Date(iso).toLocaleString('en-IN', { ...options, timeZone: zone });
}

// 'YYYY-MM-DD' plus n days, by the calendar (no timezone involved).
export function addDays(ymd, n) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

// "Thu 17 Sep" for a 'YYYY-MM-DD'.
export function dayLabel(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
}
