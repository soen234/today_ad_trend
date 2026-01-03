-- Ad Trend Viewer - Seed Data
-- schema.sql, rls.sql 실행 후 이 파일을 실행하세요

-- 카테고리 데이터 (12개)
INSERT INTO categories (id, name_ko, name_en, tier, parent_id, icon_name, display_order) VALUES
  ('games', '게임', 'Games', 1, NULL, 'Gamepad2', 1),
  ('shopping', '쇼핑', 'Shopping', 1, NULL, 'ShoppingCart', 2),
  ('finance', '금융', 'Finance', 1, NULL, 'Wallet', 3),
  ('health', '건강', 'Health & Fitness', 1, NULL, 'Heart', 4),
  ('food', '음식', 'Food & Drink', 1, NULL, 'Utensils', 5),
  ('travel', '여행', 'Travel', 1, NULL, 'Plane', 6),
  ('entertainment', '엔터테인먼트', 'Entertainment', 1, NULL, 'Film', 7),
  ('education', '교육', 'Education', 1, NULL, 'GraduationCap', 8),
  ('lifestyle', '라이프스타일', 'Lifestyle', 1, NULL, 'Home', 9),
  ('beauty', '뷰티', 'Beauty & Fashion', 1, NULL, 'Sparkles', 10),
  ('tech', '테크', 'Technology', 1, NULL, 'Smartphone', 11),
  ('fashion', '패션', 'Fashion', 1, NULL, 'Shirt', 12)
ON CONFLICT (id) DO NOTHING;

-- 광고 데이터 (16개)
INSERT INTO ads (id, advertiser_name, advertiser_logo_url, creative_type, creative_url, thumbnail_url, format, category_id, landing_url, collected_at, country_code, view_count) VALUES
  ('1', '루이비통', NULL, 'image', 'https://images.unsplash.com/photo-1760787545864-b468b6fe2c92?w=800', 'https://images.unsplash.com/photo-1760787545864-b468b6fe2c92?w=400', 'banner', 'fashion', NULL, '2024-12-20T00:00:00Z', 'KR', 1200000),
  ('2', '삼성전자', NULL, 'video', 'https://images.unsplash.com/photo-1628130235364-9e412ffaae5a?w=800', 'https://images.unsplash.com/photo-1628130235364-9e412ffaae5a?w=400', 'interstitial', 'tech', NULL, '2024-12-19T00:00:00Z', 'KR', 2400000),
  ('3', '스타벅스', NULL, 'image', 'https://images.unsplash.com/photo-1581006855389-c17d881f3baf?w=800', 'https://images.unsplash.com/photo-1581006855389-c17d881f3baf?w=400', 'native', 'food', NULL, '2024-12-18T00:00:00Z', 'KR', 890000),
  ('4', '설화수', NULL, 'image', 'https://images.unsplash.com/photo-1590156221187-1710315f710b?w=800', 'https://images.unsplash.com/photo-1590156221187-1710315f710b?w=400', 'banner', 'beauty', NULL, '2024-12-17T00:00:00Z', 'KR', 1500000),
  ('5', '여행박사', NULL, 'video', 'https://images.unsplash.com/photo-1614088459293-5669fadc3448?w=800', 'https://images.unsplash.com/photo-1614088459293-5669fadc3448?w=400', 'interstitial', 'travel', NULL, '2024-12-16T00:00:00Z', 'KR', 720000),
  ('6', 'KB국민카드', NULL, 'image', 'https://images.unsplash.com/photo-1643391448659-8e58f99958b6?w=800', 'https://images.unsplash.com/photo-1643391448659-8e58f99958b6?w=400', 'native', 'finance', NULL, '2024-12-15T00:00:00Z', 'KR', 650000),
  ('7', '넥슨', NULL, 'video', 'https://images.unsplash.com/photo-1604846887565-640d2f52d564?w=800', 'https://images.unsplash.com/photo-1604846887565-640d2f52d564?w=400', 'rewarded', 'games', NULL, '2024-12-14T00:00:00Z', 'KR', 1800000),
  ('8', '이케아', NULL, 'image', 'https://images.unsplash.com/photo-1637747020120-74c5d5cbb4c4?w=800', 'https://images.unsplash.com/photo-1637747020120-74c5d5cbb4c4?w=400', 'banner', 'lifestyle', NULL, '2024-12-13T00:00:00Z', 'KR', 540000),
  ('9', '나이키', NULL, 'video', 'https://images.unsplash.com/photo-1656944227480-98180d2a5155?w=800', 'https://images.unsplash.com/photo-1656944227480-98180d2a5155?w=400', 'interstitial', 'fashion', NULL, '2024-12-12T00:00:00Z', 'KR', 1100000),
  ('10', '구찌', NULL, 'image', 'https://images.unsplash.com/photo-1613909671501-f9678ffc1d33?w=800', 'https://images.unsplash.com/photo-1613909671501-f9678ffc1d33?w=400', 'banner', 'fashion', NULL, '2024-12-11T00:00:00Z', 'KR', 980000),
  ('11', '애플', NULL, 'image', 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?w=800', 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?w=400', 'banner', 'tech', NULL, '2024-12-10T00:00:00Z', 'KR', 2100000),
  ('12', 'LG전자', NULL, 'video', 'https://images.unsplash.com/photo-1557817683-5cfe3620b05c?w=800', 'https://images.unsplash.com/photo-1557817683-5cfe3620b05c?w=400', 'interstitial', 'tech', NULL, '2024-12-09T00:00:00Z', 'KR', 1700000),
  ('13', '블루보틀', NULL, 'image', 'https://images.unsplash.com/photo-1614639938587-ec36a68ac904?w=800', 'https://images.unsplash.com/photo-1614639938587-ec36a68ac904?w=400', 'banner', 'food', NULL, '2024-12-08T00:00:00Z', 'KR', 750000),
  ('14', '아웃백', NULL, 'image', 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800', 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400', 'native', 'food', NULL, '2024-12-07T00:00:00Z', 'KR', 620000),
  ('15', '라네즈', NULL, 'video', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400', 'interstitial', 'beauty', NULL, '2024-12-06T00:00:00Z', 'KR', 1300000),
  ('16', '맥', NULL, 'image', 'https://images.unsplash.com/photo-1718972771654-47be8f36e0fd?w=800', 'https://images.unsplash.com/photo-1718972771654-47be8f36e0fd?w=400', 'banner', 'beauty', NULL, '2024-12-05T00:00:00Z', 'KR', 1100000)
ON CONFLICT (id) DO NOTHING;
