import { describe, expect, it, vi } from 'vitest';
import { followPublish, instagramCaptionProblem, withHashtags } from './publishing';

// PUBL-013: the same limits and wording as the engine's publisher.caption_problem,
// so the warning before publishing matches what Instagram would be told.
describe('Instagram caption limits', () => {
  it('flags length, hashtags and @ tags with the engine’s wording', () => {
    expect(instagramCaptionProblem('x'.repeat(2300))).toBe('Instagram captions can be up to 2,200 characters. This one has 2,300.');
    expect(instagramCaptionProblem(Array.from({ length: 35 }, (_, i) => `#tag${i}`).join(' ')))
      .toBe('Instagram allows up to 30 hashtags. This caption has 35.');
    expect(instagramCaptionProblem(Array.from({ length: 21 }, (_, i) => `@friend${i}`).join(' ')))
      .toBe('Instagram allows up to 20 @ tags. This caption has 21.');
  });

  it('accepts what Instagram accepts', () => {
    expect(instagramCaptionProblem('x'.repeat(2200))).toBe('');
    expect(instagramCaptionProblem(`Mail hello@clinic.in ${Array.from({ length: 30 }, (_, i) => `#t${i}`).join(' ')}`)).toBe('');
    expect(instagramCaptionProblem('🌧️'.repeat(1000))).toBe(''); // counted as characters, not UTF-16 units
    expect(instagramCaptionProblem(undefined)).toBe('');
  });
});

describe('withHashtags', () => {
  it('adds Studio’s hashtags under the caption once', () => {
    expect(withHashtags('Rain or shine.', ['smile', '#Monsoon'])).toBe('Rain or shine.\n\n#smile #Monsoon');
    expect(withHashtags('Rain or shine. #smile', ['Smile', 'teeth', 'teeth'])).toBe('Rain or shine. #smile\n\n#teeth');
    expect(withHashtags('Just words', [])).toBe('Just words');
    expect(withHashtags('', ['smile'])).toBe('#smile');
    expect(withHashtags('Caption', undefined)).toBe('Caption');
  });
});

describe('followPublish', () => {
  it('checks until Instagram has an outcome', async () => {
    const check = vi.fn()
      .mockResolvedValueOnce({ post: { id: 4, status: 'publishing' } })
      .mockResolvedValueOnce({ post: { id: 4, status: 'published', permalink: 'https://www.instagram.com/p/M4/' } });
    const post = await followPublish({ id: 4, status: 'publishing' }, check, { every: 0 });
    expect(post.permalink).toBe('https://www.instagram.com/p/M4/');
    expect(check).toHaveBeenCalledTimes(2);
  });

  it('returns an outcome straight away and gives up after its tries', async () => {
    const check = vi.fn().mockResolvedValue({ post: { id: 5, status: 'publishing' } });
    expect(await followPublish({ id: 1, status: 'published' }, check, { every: 0 })).toEqual({ id: 1, status: 'published' });
    expect(check).not.toHaveBeenCalled();
    expect((await followPublish({ id: 5, status: 'publishing' }, check, { every: 0, tries: 3 })).status).toBe('publishing');
    expect(check).toHaveBeenCalledTimes(3);
  });
});
