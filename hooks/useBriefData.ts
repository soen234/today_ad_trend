import { useQueries, useQuery } from '@tanstack/react-query';
import { fetchEdition, fetchFeed, fetchLatest, fetchPulse } from '@/lib/api';
import type { Item, Role, Section } from '@/types';

export const useLatest = () =>
  useQuery({
    queryKey: ['latest'],
    queryFn: fetchLatest,
  });

export const useEdition = (role: Role) => {
  const latest = useLatest();
  const path = latest.data?.editions[role] ?? null;
  const edition = useQuery({
    queryKey: ['edition', path],
    queryFn: () => fetchEdition(path as string),
    enabled: path !== null,
    // 에디션 파일은 날짜별로 한 번 만들어지고 바뀌지 않는다
    staleTime: Infinity,
  });
  return { latest, edition, hasEdition: path !== null };
};

export const useFeed = (section: Exclude<Section, 'creative'>) => {
  const latest = useLatest();
  const path = latest.data?.feeds[section] ?? null;
  const feed = useQuery({
    queryKey: ['feed', path],
    queryFn: () => fetchFeed(path as string),
    enabled: path !== null,
  });
  return { latest, feed };
};

export const usePulse = () => {
  const latest = useLatest();
  const path = latest.data?.pulse ?? null;
  const pulse = useQuery({
    queryKey: ['pulse', path],
    queryFn: () => fetchPulse(path as string),
    enabled: path !== null,
    staleTime: Infinity,
  });
  return { latest, pulse, hasPulse: path !== null };
};

const TEXT_SECTIONS: Exclude<Section, 'creative'>[] = ['news', 'platform', 'expert'];

// 워치리스트 매칭용: 텍스트 피드 세 개를 합쳐 최신순으로 반환
export const useAllFeedItems = () => {
  const latest = useLatest();
  const results = useQueries({
    queries: TEXT_SECTIONS.map((section) => {
      const path = latest.data?.feeds[section] ?? null;
      return {
        queryKey: ['feed', path],
        queryFn: () => fetchFeed(path as string),
        enabled: path !== null,
      };
    }),
  });
  const items: Item[] = results
    .flatMap((r) => r.data?.items ?? [])
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return {
    items,
    isLoading: latest.isLoading || results.some((r) => r.isLoading),
    isError: latest.isError || results.some((r) => r.isError),
    refetch: () => Promise.all([latest.refetch(), ...results.map((r) => r.refetch())]),
  };
};
