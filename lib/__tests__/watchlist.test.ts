import { matchedKeywords, normalizeKeyword } from '@/lib/watchlist';
import type { Item } from '@/types';

const item = (overrides: Partial<Item> = {}): Item => ({
  id: 'abc',
  section: 'news',
  title: 'Meta expands Advantage+ to all advertisers',
  url: 'https://example.com/a',
  source: 'Digiday',
  publishedAt: '2026-10-25T08:00:00Z',
  summary: 'The change affects campaign structure for Performance Max style automation.',
  platforms: ['meta'],
  tags: ['automation'],
  importance: 4,
  roles: {
    performance: { relevance: 3, soWhat: 'Audit manual campaigns.' },
    ua: { relevance: 1, soWhat: '' },
    brand: { relevance: 0, soWhat: '' },
  },
  enriched: true,
  ...overrides,
});

describe('matchedKeywords', () => {
  it('matches case-insensitively on whole words', () => {
    expect(matchedKeywords(item(), ['meta', 'Performance Max'])).toEqual(['meta', 'Performance Max']);
  });

  it('does not match inside other words', () => {
    expect(matchedKeywords(item({ title: 'Metadata changes', summary: '', platforms: [], tags: [] }), ['meta'])).toEqual([]);
  });

  it('treats regex characters literally', () => {
    expect(matchedKeywords(item({ title: 'What C++ teaches ad ops', summary: '' }), ['C++'])).toEqual(['C++']);
  });

  it('returns nothing for an empty watchlist', () => {
    expect(matchedKeywords(item(), [])).toEqual([]);
  });
});

describe('normalizeKeyword', () => {
  it('trims and collapses whitespace', () => {
    expect(normalizeKeyword('  Performance   Max ')).toBe('Performance Max');
  });
});
