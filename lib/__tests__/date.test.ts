import { localDateKey, previousDateKey, relativeTime } from '@/lib/date';

describe('date helpers', () => {
  it('formats a local date key', () => {
    expect(localDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('steps back across a year boundary', () => {
    expect(previousDateKey('2026-01-01')).toBe('2025-12-31');
  });

  it('describes recent times relatively', () => {
    const now = new Date('2026-10-25T12:00:00Z');
    expect(relativeTime('2026-10-25T11:30:00Z', now)).toBe('30m ago');
    expect(relativeTime('2026-10-25T07:00:00Z', now)).toBe('5h ago');
    expect(relativeTime('2026-10-23T12:00:00Z', now)).toBe('2d ago');
  });
});
