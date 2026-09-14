import { describe, expect, it } from 'vitest';
import { inr, num } from './WorkspaceContext';

describe('inr', () => {
  it('shows a dash for missing values', () => {
    expect(inr(null)).toBe('—');
    expect(inr(undefined)).toBe('—');
  });

  it('compacts to K, lakh and crore at their thresholds', () => {
    expect(inr(999)).toBe('₹999');
    expect(inr(1000)).toBe('₹1.0K');
    expect(inr(99999)).toBe('₹100.0K');
    expect(inr(100000)).toBe('₹1.0L');
    expect(inr(10000000)).toBe('₹1.0Cr');
  });

  it('uses Indian digit grouping when not compact', () => {
    expect(inr(1234567, { compact: false })).toBe('₹12,34,567');
    expect(inr(1499.6, { compact: false })).toBe('₹1,500');
  });
});

describe('num', () => {
  it('groups digits the Indian way and treats missing as zero', () => {
    expect(num(1234567)).toBe('12,34,567');
    expect(num(null)).toBe('0');
  });
});
