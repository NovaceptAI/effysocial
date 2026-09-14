import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('lets the later Tailwind class win a conflict', () => {
    expect(cn('px-2 text-sm', 'px-4')).toBe('text-sm px-4');
  });

  it('drops falsy parts and flattens conditionals', () => {
    expect(cn('a', false, null, undefined, 0, { b: true, c: false }, ['d'])).toBe('a b d');
  });
});
