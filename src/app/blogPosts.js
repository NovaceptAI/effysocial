// Blog articles, newest first. Deliberately empty at launch: every article here is
// published under EffySocial's name, so the words are the owner's to write and approve
// — the shell below renders whatever is added, and Blog says "coming soon" until then.
//
// Shape of an entry:
//   { slug, title, summary, category, date: 'YYYY-MM-DD', readingMinutes, body: [ 'paragraph', … ] }
export const BLOG_POSTS = [];

export const BLOG_CATEGORIES = [...new Set(BLOG_POSTS.map((p) => p.category))];

export const newestFirst = (posts = BLOG_POSTS) => [...posts].sort((a, b) => b.date.localeCompare(a.date));
