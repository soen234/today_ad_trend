// News types from Supabase ad_news table
export interface News {
  id: string;
  title: string;
  title_ko: string | null;
  summary: string | null;
  summary_ko: string | null;
  category: string;
  source: string | null;
  source_url: string | null;
  image_url: string | null;
  published_at: string | null;
  is_featured: boolean | null;
  created_at: string | null;
}

// News digest from Supabase ad_news_digest table
export interface NewsDigest {
  id: string;
  digest_date: string;
  summary: string | null;
  summary_ko: string | null;
  adtech_count: number | null;
  martech_count: number | null;
  general_count: number | null;
  total_news_count: number | null;
  created_at: string | null;
}

export type NewsCategory = 'All' | 'AdTech' | 'MarTech' | 'General';

export const NEWS_CATEGORIES: NewsCategory[] = ['All', 'AdTech', 'MarTech', 'General'];
