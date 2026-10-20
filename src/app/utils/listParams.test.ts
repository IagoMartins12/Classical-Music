import { describe, expect, it } from 'vitest';
import {
  COMPOSER_KEYS,
  listHref,
  parseComposerParams,
  parseWorkParams,
  toListQuery,
} from './listParams';

const ERA = '685d59e11e3db0c5aaa8942d';

describe('parseComposerParams', () => {
  it('keeps valid filters and drops the rest', () => {
    const params = parseComposerParams(
      {
        epoch: ERA,
        instrument: 'nope',
        page: '3',
        sort: 'oldest',
        portrait: '1',
        verified: '1',
        from: '1700',
        to: '99999',
        country: 'German',
      },
      (c) => (c === 'German' ? ['German', 'Alemão'] : undefined)
    );
    expect(params).toEqual({
      page: 3,
      sort: 'oldest',
      search: undefined,
      epochId: ERA,
      nationality: ['German', 'Alemão'],
      instrumentId: undefined,
      withPortrait: true,
      verified: true,
      bornFrom: 1700,
      bornTo: undefined,
    });
  });

  it('falls back to page 1 and the featured order', () => {
    const params = parseComposerParams(
      { page: '-2', sort: 'popular' },
      () => undefined
    );
    expect(params.page).toBe(1);
    expect(params.sort).toBe('featured');
  });
});

describe('parseWorkParams', () => {
  it('orders by arrival without filters and A–Z with them', () => {
    expect(parseWorkParams({}).sort).toBe('newest');
    expect(parseWorkParams({ genre: 'noturnos' }).sort).toBe('title');
    expect(parseWorkParams({ genre: 'noturnos', sort: 'newest' }).sort).toBe(
      'newest'
    );
  });

  it('knows the featured and oldest orders, and the verified filter', () => {
    expect(parseWorkParams({ sort: 'featured' }).sort).toBe('featured');
    expect(parseWorkParams({ sort: 'oldest' }).sort).toBe('oldest');
    expect(parseWorkParams({ verified: '1' }).verified).toBe(true);
    expect(parseWorkParams({ verified: '0' }).verified).toBeUndefined();
    // A verified-only list is a filtered one: A–Z, like any other filter.
    expect(parseWorkParams({ verified: '1' }).sort).toBe('title');
  });

  it('accepts only known levels', () => {
    expect(parseWorkParams({ level: 'ADVANCED' }).level).toBe('ADVANCED');
    expect(parseWorkParams({ level: 'EXPERT' }).level).toBeUndefined();
  });
});

describe('listHref', () => {
  const query = toListQuery(
    { epoch: ERA, page: '4', junk: 'x' },
    COMPOSER_KEYS
  );

  it('drops unknown keys and resets the page on any change', () => {
    expect(listHref('/composers', query, { sort: 'name' })).toBe(
      `/composers?epoch=${ERA}&sort=name`
    );
  });

  it('keeps the filters when paging, and page 1 has no parameter', () => {
    expect(listHref('/composers', query, { page: '5' })).toBe(
      `/composers?epoch=${ERA}&page=5`
    );
    expect(listHref('/composers', query, { page: '1' })).toBe(
      `/composers?epoch=${ERA}`
    );
  });

  it('removes a filter set to undefined', () => {
    expect(listHref('/composers', query, { epoch: undefined })).toBe(
      '/composers'
    );
  });
});
