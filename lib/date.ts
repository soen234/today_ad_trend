// 사용자의 기기 시간대 기준 날짜 키 (YYYY-MM-DD). 스트릭과 읽음 기록은 모두 이 키를 쓴다.
export const localDateKey = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const previousDateKey = (key: string): string => {
  const [y, m, d] = key.split('-').map(Number);
  return localDateKey(new Date(y, m - 1, d - 1));
};

export const relativeTime = (iso: string, now: Date = new Date()): string => {
  const diffMs = now.getTime() - new Date(iso).getTime();
  if (Number.isNaN(diffMs)) return '';
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// 에디션 날짜(YYYY-MM-DD)는 달력 날짜이므로 시간대 변환 없이 표시한다.
export const formatEditionDate = (date: string): string => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (hour: number, minute: number): string =>
  new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
