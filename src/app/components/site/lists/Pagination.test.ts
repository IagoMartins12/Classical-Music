import { describe, expect, it } from 'vitest';
import { pageWindow } from './Pagination';

describe('pageWindow', () => {
  it('shows every page when there are few', () => {
    expect(pageWindow(2, 4)).toEqual([1, 2, 3, 4]);
  });
  it('keeps the edges and two around the current, with gaps', () => {
    expect(pageWindow(6, 120)).toEqual([1, null, 4, 5, 6, 7, 8, null, 120]);
    expect(pageWindow(1, 120)).toEqual([1, 2, 3, null, 120]);
  });
});
