export interface Ad {
  id: string;
  advertiser_name: string;
  advertiser_logo_url: string | null;
  creative_type: 'image' | 'video' | 'playable';
  creative_url: string;
  thumbnail_url: string | null;
  format: AdFormat;
  category_id: string;
  landing_url: string | null;
  collected_at: string;
  country_code: string;
  view_count: number;
  created_at: string;
}

export type AdFormat =
  | 'banner'
  | 'interstitial'
  | 'rewarded'
  | 'native'
  | 'playable'
  | 'app_open';

export interface Category {
  id: string;
  name_ko: string;
  name_en: string;
  tier: 1 | 2;
  parent_id: string | null;
  icon_name: string;
  display_order: number;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
}

export interface SavedAd {
  id: string;
  user_id: string;
  ad_id: string;
  collection_id: string | null;
  saved_at: string;
}
