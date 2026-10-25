import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { DataError, fetchEdition, fetchFeed, fetchLatest, fetchPulse } from '@/lib/api';
import type { Item, Role, Section } from '@/types';

// refetch()는 enabled:false를 무시하므로, 경로가 없을 때는 명확한 에러를 던진다
const requirePath = (path: string | null): string => {
  if (!path) throw new DataError('Not published yet', 404);
  return path;
};

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
    queryFn: () => fetchEdition(requirePath(path)),
    enabled: path !== null,
  });
  return { latest, edition, hasEdition: path !== null };
};

export const useFeed = (section: Exclude<Section, 'creative'>) => {
  const latest = useLatest();
  const path = latest.data?.feeds[section] ?? null;
  const feed = useQuery({
    queryKey: ['feed', path],
    queryFn: () => fetchFeed(requirePath(path)),
    enabled: path !== null,
  });
  return { latest, feed, hasFeed: path !== null };
};

export const usePulse = () => {
  const latest = useLatest();
  const path = latest.data?.pulse ?? null;
  // pulse는 항상 같은 경로(pulse/latest.json)로 갱신되므로 latest의 generatedAt을 키에 넣는다
  const version = latest.data?.generatedAt ?? null;
  const pulse = useQuery({
    queryKey: ['pulse', path, version],
    queryFn: () => fetchPulse(requirePath(path)),
    enabled: path !== null,
    placeholderData: (prev) => prev,
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
        queryFn: () => fetchFeed(requirePath(path)),
        enabled: path !== null,
      };
    }),
  });
  const [news, platform, expert] = results.map((r) => r.data);
  const items: Item[] = useMemo(
    () =>
      [news, platform, expert]
        .flatMap((f) => f?.items ?? [])
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    [news, platform, expert]
  );
  return {
    items,
    isPending: latest.isPending || results.some((r) => r.isPending && r.fetchStatus !== 'idle'),
  };
};
