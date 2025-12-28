import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Ad, AdFormat } from '@/types';

interface UseAdsParams {
  format?: AdFormat;
  categoryId?: string;
  period?: '7d' | '30d' | 'all';
  sortBy?: 'latest' | 'popular';
}

const PAGE_SIZE = 20;

export function useAds(params: UseAdsParams = {}) {
  const { format, categoryId, period, sortBy = 'latest' } = params;

  return useInfiniteQuery({
    queryKey: ['ads', format, categoryId, period, sortBy],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('ads')
        .select('*')
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      if (format) {
        query = query.eq('format', format);
      }

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (period && period !== 'all') {
        const days = period === '7d' ? 7 : 30;
        const date = new Date();
        date.setDate(date.getDate() - days);
        query = query.gte('collected_at', date.toISOString());
      }

      if (sortBy === 'latest') {
        query = query.order('collected_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Ad[];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length * PAGE_SIZE;
    },
    initialPageParam: 0,
  });
}

export function useHotAds() {
  return useQuery({
    queryKey: ['ads', 'hot'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('collected_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Ad[];
    },
  });
}
