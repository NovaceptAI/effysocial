// Publishing helpers shared by Studio's Share row, Published and Integrations.

// Instagram's caption limits, mirrored from the engine (publisher.caption_problem)
// so people are warned before they press Publish (PUBL-013). Same wording both sides.
export const INSTAGRAM_LIMITS = { characters: 2200, hashtags: 30, mentions: 20 };
const HASHTAG = /#[^\s#]+/gu;
const MENTION = /(?:^|[^\w.])@[A-Za-z0-9._]+/g;
const count = (n) => n.toLocaleString('en-US');

export function instagramCaptionProblem(caption = '') {
  const text = caption || '';
  const characters = [...text].length;
  if (characters > INSTAGRAM_LIMITS.characters) {
    return `Instagram captions can be up to ${count(INSTAGRAM_LIMITS.characters)} characters. This one has ${count(characters)}.`;
  }
  const hashtags = (text.match(HASHTAG) || []).length;
  if (hashtags > INSTAGRAM_LIMITS.hashtags) {
    return `Instagram allows up to ${INSTAGRAM_LIMITS.hashtags} hashtags. This caption has ${hashtags}.`;
  }
  const mentions = (text.match(MENTION) || []).length;
  if (mentions > INSTAGRAM_LIMITS.mentions) {
    return `Instagram allows up to ${INSTAGRAM_LIMITS.mentions} @ tags. This caption has ${mentions}.`;
  }
  return '';
}

// Studio keeps hashtags apart from the caption; what gets posted has both.
export function withHashtags(caption = '', hashtags = []) {
  const text = caption || '';
  const present = new Set((text.match(HASHTAG) || []).map((t) => t.toLowerCase()));
  const extra = [];
  for (const hashtag of hashtags || []) {
    const tag = `#${String(hashtag).trim().replace(/^#+/, '')}`;
    if (tag.length > 1 && !present.has(tag.toLowerCase())) {
      present.add(tag.toLowerCase());
      extra.push(tag);
    }
  }
  if (!extra.length) return text;
  return text.trim() ? `${text.trimEnd()}\n\n${extra.join(' ')}` : extra.join(' ');
}

// Instagram processes videos (and now and then an image) before they can go live.
// Asks the engine to follow up until the post is published or failed; gives up
// after `tries` and returns the post as it stands.
export const PUBLISH_CHECK_MS = 5000;

export async function followPublish(post, check, { every = PUBLISH_CHECK_MS, tries = 60 } = {}) {
  let current = post;
  for (let i = 0; current?.status === 'publishing' && i < tries; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => { setTimeout(resolve, every); });
    // eslint-disable-next-line no-await-in-loop
    current = (await check(current.id)).post;
  }
  return current;
}
