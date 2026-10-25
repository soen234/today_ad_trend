import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { localDateKey } from '@/lib/date';

// 앱이 메모리에 남아 있다가 다음 날 다시 열려도 날짜/스트릭/완료 상태가 갱신되도록 한다
export const useTodayKey = (): string => {
  const [key, setKey] = useState(localDateKey);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setKey(localDateKey());
    });
    return () => sub.remove();
  }, []);
  return key;
};
