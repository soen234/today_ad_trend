import { ReactNode, useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { focusManager, QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

const DAY = 1000 * 60 * 60 * 24;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15,
      // 오프라인에서도 마지막 브리핑을 보여주기 위해 캐시를 디스크에 오래 보관한다
      gcTime: DAY * 3,
      retry: 2,
      // 앱이 포그라운드로 돌아오면 (15분 이상 지난) 데이터를 다시 받는다
      refetchOnWindowFocus: true,
    },
  },
});

const persister = createAsyncStoragePersister({ storage: AsyncStorage, key: 'tat-query-cache' });

// React Native에는 window focus 이벤트가 없으므로 AppState를 TanStack focusManager에 연결한다
const useAppStateFocus = () => {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    focusManager.setEventListener((handleFocus) => {
      const sub = AppState.addEventListener('change', (state) => handleFocus(state === 'active'));
      return () => sub.remove();
    });
  }, []);
};

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  useAppStateFocus();
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: DAY * 3, buster: 'v1' }}>
      {children}
    </PersistQueryClientProvider>
  );
};
