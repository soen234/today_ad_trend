import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { AdNews, AdNewsDigest, NewsCategory } from '@/types';

interface UseNewsOptions {
  category?: NewsCategory;
  date?: string; // YYYY-MM-DD format
}

export function useNews(options: UseNewsOptions = {}) {
  const { category = 'all', date } = options;
  const [news, setNews] = useState<AdNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase not configured');
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('ad_news')
        .select('*')
        .order('published_at', { ascending: false });

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      // Filter by date if provided
      if (date) {
        const startOfDay = `${date}T00:00:00.000Z`;
        const endOfDay = `${date}T23:59:59.999Z`;
        query = query.gte('published_at', startOfDay).lte('published_at', endOfDay);
      }

      const { data, error: fetchError } = await query.limit(50);

      if (fetchError) throw fetchError;
      setNews(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, date]);

  useEffect(() => {
    setLoading(true);
    fetchNews();
  }, [fetchNews]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchNews();
  }, [fetchNews]);

  return { news, loading, error, refreshing, refresh };
}

export function useNewsDigest() {
  const [digest, setDigest] = useState<AdNewsDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDigest() {
      if (!isSupabaseConfigured) {
        setError('Supabase not configured');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('ad_news_digest')
          .select('*')
          .order('digest_date', { ascending: false })
          .limit(1)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }
        setDigest(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching digest:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch digest');
      } finally {
        setLoading(false);
      }
    }

    fetchDigest();
  }, []);

  return { digest, loading, error };
}

export function useFeaturedNews() {
  const [featuredNews, setFeaturedNews] = useState<AdNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('ad_news')
          .select('*')
          .eq('is_featured', true)
          .order('published_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setFeaturedNews(data || []);
      } catch (err) {
        console.error('Error fetching featured news:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  return { featuredNews, loading };
}

// Fetch available dates that have news
export function useNewsDates() {
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDates() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        // Fetch news and extract unique dates from published_at
        const { data, error } = await supabase
          .from('ad_news')
          .select('published_at')
          .order('published_at', { ascending: false })
          .limit(200);

        if (error) throw error;

        // Extract unique dates (YYYY-MM-DD format)
        const uniqueDates = [
          ...new Set(
            data?.map((item) => item.published_at.split('T')[0]) || []
          ),
        ].sort((a, b) => b.localeCompare(a)); // Sort descending

        setDates(uniqueDates);
      } catch (err) {
        console.error('Error fetching news dates:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDates();
  }, []);

  return { dates, loading };
}

// Fetch digest for a specific date
export function useDigestByDate(date: string | null) {
  const [digest, setDigest] = useState<AdNewsDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDigest() {
      if (!isSupabaseConfigured || !date) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('ad_news_digest')
          .select('*')
          .eq('digest_date', date)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }
        setDigest(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching digest by date:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch digest');
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    fetchDigest();
  }, [date]);

  return { digest, loading, error };
}
