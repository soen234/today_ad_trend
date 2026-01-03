-- Ad Trend Viewer - Database Schema
-- Supabase SQL Editor에서 실행하세요

-- 1. Categories 테이블
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  tier INTEGER NOT NULL CHECK (tier IN (1, 2)),
  parent_id TEXT REFERENCES categories(id),
  icon_name TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ads 테이블
CREATE TABLE IF NOT EXISTS ads (
  id TEXT PRIMARY KEY,
  advertiser_name TEXT NOT NULL,
  advertiser_logo_url TEXT,
  creative_type TEXT NOT NULL CHECK (creative_type IN ('image', 'video', 'playable')),
  creative_url TEXT NOT NULL,
  thumbnail_url TEXT,
  format TEXT NOT NULL CHECK (format IN ('banner', 'interstitial', 'rewarded', 'native', 'playable', 'app_open')),
  category_id TEXT NOT NULL REFERENCES categories(id),
  landing_url TEXT,
  collected_at TIMESTAMPTZ NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'KR',
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Collections 테이블 (사용자 컬렉션)
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Saved Ads 테이블 (저장된 광고)
CREATE TABLE IF NOT EXISTS saved_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_id TEXT NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ad_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_ads_category ON ads(category_id);
CREATE INDEX IF NOT EXISTS idx_ads_format ON ads(format);
CREATE INDEX IF NOT EXISTS idx_ads_view_count ON ads(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_ads_collected_at ON ads(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_ads_user ON saved_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_ads_collection ON saved_ads(collection_id);
CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);
