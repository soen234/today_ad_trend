import { localDateKey, previousDateKey } from '@/lib/date';

export interface Streak {
  count: number;
  lastDate: string | null;
}

// 오늘 브리핑을 하나라도 읽으면 호출. 같은 날 여러 번 읽어도 한 번만 센다.
export const recordActivity = (streak: Streak, today: string = localDateKey()): Streak => {
  if (streak.lastDate === today) return streak;
  if (streak.lastDate === previousDateKey(today)) {
    return { count: streak.count + 1, lastDate: today };
  }
  return { count: 1, lastDate: today };
};

// 화면에 보여줄 현재 스트릭. 어제까지 이어졌으면 아직 살아있고, 그보다 오래됐으면 0.
export const currentStreak = (streak: Streak, today: string = localDateKey()): number => {
  if (!streak.lastDate) return 0;
  if (streak.lastDate === today || streak.lastDate === previousDateKey(today)) {
    return streak.count;
  }
  return 0;
};
