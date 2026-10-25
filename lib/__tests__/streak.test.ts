import { currentStreak, recordActivity } from '@/lib/streak';

describe('recordActivity', () => {
  it('starts a streak on first activity', () => {
    expect(recordActivity({ count: 0, lastDate: null }, '2026-10-25')).toEqual({ count: 1, lastDate: '2026-10-25' });
  });

  it('counts the same day only once', () => {
    const s = { count: 3, lastDate: '2026-10-25' };
    expect(recordActivity(s, '2026-10-25')).toBe(s);
  });

  it('extends the streak on the next day, across month boundaries', () => {
    expect(recordActivity({ count: 3, lastDate: '2026-10-31' }, '2026-11-01')).toEqual({ count: 4, lastDate: '2026-11-01' });
  });

  it('resets after a missed day', () => {
    expect(recordActivity({ count: 9, lastDate: '2026-10-22' }, '2026-10-25')).toEqual({ count: 1, lastDate: '2026-10-25' });
  });
});

describe('currentStreak', () => {
  it('is still alive the day after the last activity', () => {
    expect(currentStreak({ count: 5, lastDate: '2026-10-24' }, '2026-10-25')).toBe(5);
  });

  it('is zero once a full day was missed', () => {
    expect(currentStreak({ count: 5, lastDate: '2026-10-23' }, '2026-10-25')).toBe(0);
  });

  it('is zero with no history', () => {
    expect(currentStreak({ count: 0, lastDate: null }, '2026-10-25')).toBe(0);
  });
});
