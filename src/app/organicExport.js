import { formatInZone } from './timezone';

// Organic Analytics as a CSV (launch plan 5.9, G41): what's on the page, in sections a
// spreadsheet opens cleanly — summary, daily reach, top posts, audience and best times.
// Unknown numbers stay blank, never zero, so nobody reads "no data" as "nothing happened".
const cell = (v) => {
  const text = v == null ? '' : String(v);
  const guarded = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;   // post titles are free text
  return /[",\n]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded;
};
const line = (...values) => values.map(cell).join(',');

export function organicCsv(a, zone) {
  const k = a.kpis;
  const ig = a.sources.instagram;
  const out = [
    line('Summary'),
    line('Measure', 'Value', 'Source'),
    line('Instagram account', a.account ? `instagram.com/${a.account.username}` : (ig.error || ig.reason || 'Not connected'), 'Instagram'),
    line('Followers', k.followers, 'Instagram, now'),
    line('Reach (28 days)', k.reach28, 'Instagram'),
    line('Views (28 days)', k.views28, 'Instagram'),
    line('Profile views (28 days)', k.profileViews28, 'Instagram'),
    line('Accounts engaged (28 days)', k.accountsEngaged28, 'Instagram'),
    line('Interactions (28 days)', k.interactions28, 'Instagram'),
    line('Link taps (28 days)', k.linkTaps28, 'Instagram'),
    line('Average post engagement %', k.postEngagement, `${a.sources.posts.measured} of ${a.sources.posts.published} published posts measured`),
    '',
    line('Daily reach'),
    line('Date', 'Reach'),
    ...a.reachSeries.map((d) => line(d.date, d.reach)),
    ...(a.reachSeries.length ? [] : [line('Not available', a.account ? 'Instagram returned no daily reach' : 'Instagram not connected')]),
    '',
    line('Top posts'),
    line('Title', 'Type', 'Published', 'Reach', 'Engagement %', 'Likes', 'Comments', 'Saves', 'Shares', 'Link'),
    ...a.topPosts.map((p) => line(
      p.title, p.type, p.publishedAt ? formatInZone(p.publishedAt, zone, { day: 'numeric', month: 'short', year: 'numeric' }) : '',
      p.metrics.reach, p.metrics.engagement, p.metrics.likes, p.metrics.comments, p.metrics.saved, p.metrics.shares, p.permalink,
    )),
    '',
    line('Audience'),
  ];
  if (a.audience?.available) {
    out.push(line('Group', 'Label', 'Share %'));
    [['Age', a.audience.age], ['Gender', a.audience.gender], ['City', a.audience.cities]]
      .forEach(([group, rows]) => rows.forEach((r) => out.push(line(group, r.label, r.value))));
  } else {
    out.push(line('Not available', a.audience?.reason || 'Instagram not connected'));
  }
  out.push('', line('Best posting times'));
  if (a.bestTimes.available) {
    out.push(line('Day', ...a.bestTimes.parts.map((p) => `${p} engagement %`)));
    a.bestTimes.rows.forEach((r) => out.push(line(r.day, ...r.cells.map((c) => c.engagement))));
  } else {
    out.push(line('Not available', a.bestTimes.reason));
  }
  return out.join('\r\n');
}

export function downloadCsv(name, text) {
  const url = URL.createObjectURL(new Blob([`﻿${text}`], { type: 'text/csv;charset=utf-8' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
