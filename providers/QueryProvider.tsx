import { ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

const DAY = 1000 * 60 * 60 * 24;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15,
      // 오프라인에서도 마지막 브리핑을 보여주기 위해 캐시를 디스크에 오래 보관한다
      gcTime: DAY * 3,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const persister = createAsyncStoragePersister({ storage: AsyncStorage, key: 'tat-query-cache' });

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => (
  <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: DAY * 3, buster: 'v1' }}>
    {children}
  </PersistQueryClientProvider>
);
