import { Ad, AdFormat, Category } from '@/types';

// reference_styles/App.tsx의 mockAds를 Ad 타입으로 변환
export const MOCK_ADS: Ad[] = [
  {
    id: '1',
    advertiser_name: '루이비통',
    advertiser_logo_url: null,
    creative_type: 'image',
    creative_url: 'https://images.unsplash.com/photo-1760787545864-b468b6fe2c92?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1760787545864-b468b6fe2c92?w=400',
    format: 'banner',
    category_id: 'fashion',
    landing_url: null,
    collected_at: '2024-12-20T00:00:00Z',
    country_code: 'KR',
    view_count: 1200000,
    created_at: '2024-12-20T00:00:00Z',
  },
  {
    id: '2',
    advertiser_name: '삼성전자',
    advertiser_logo_url: null,
    creative_type: 'video',
    creative_url: 'https://images.unsplash.com/photo-1628130235364-9e412ffaae5a?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1628130235364-9e412ffaae5a?w=400',
    format: 'interstitial',
    category_id: 'tech',
    landing_url: null,
    collected_at: '2024-12-19T00:00:00Z',
    country_code: 'KR',
    view_count: 2400000,
    created_at: '2024-12-19T00:00:00Z',
  },
  {
    id: '3',
    advertiser_name: '스타벅스',
    advertiser_logo_url: null,
    creative_type: 'image',
    creative_url: 'https://images.unsplash.com/photo-1581006855389-c17d881f3baf?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1581006855389-c17d881f3baf?w=400',
    format: 'native',
    category_id: 'food',
    landing_url: null,
    collected_at: '2024-12-18T00:00:00Z',
    country_code: 'KR',
    view_count: 890000,
    created_at: '2024-12-18T00:00:00Z',
  },
  {
    id: '4',
    advertiser_name: '설화수',
    advertiser_logo_url: null,
    creative_type: 'image',
    creative_url: 'https://images.unsplash.com/photo-1590156221187-1710315f710b?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1590156221187-1710315f710b?w=400',
    format: 'banner',
    category_id: 'beauty',
    landing_url: null,
    collected_at: '2024-12-17T00:00:00Z',
    country_code: 'KR',
    view_count: 1500000,
    created_at: '2024-12-17T00:00:00Z',
  },
  {
    id: '5',
    advertiser_name: '여행박사',
    advertiser_logo_url: null,
    creative_type: 'video',
    creative_url: 'https://images.unsplash.com/photo-1614088459293-5669fadc3448?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1614088459293-5669fadc3448?w=400',
    format: 'interstitial',
    category_id: 'travel',
    landing_url: null,
    collected_at: '2024-12-16T00:00:00Z',
    country_code: 'KR',
    view_count: 720000,
    created_at: '2024-12-16T00:00:00Z',
  },
  {
    id: '6',
    advertiser_name: 'KB국민카드',
    advertiser_logo_url: null,
    creative_type: 'image',
    creative_url: 'https://images.unsplash.com/photo-1643391448659-8e58f99958b6?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1643391448659-8e58f99958b6?w=400',
    format: 'native',
    category_id: 'finance',
    landing_url: null,
    collected_at: '2024-12-15T00:00:00Z',
    country_code: 'KR',
    view_count: 650000,
    created_at: '2024-12-15T00:00:00Z',
  },
  {
    id: '7',
    advertiser_name: '넥슨',
    advertiser_logo_url: null,
    creative_type: 'video',
    creative_url: 'https://images.unsplash.com/photo-1604846887565-640d2f52d564?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1604846887565-640d2f52d564?w=400',
    format: 'rewarded',
    category_id: 'games',
    landing_url: null,
    collected_at: '2024-12-14T00:00:00Z',
    country_code: 'KR',
    view_count: 1800000,
    created_at: '2024-12-14T00:00:00Z',
  },
  {
    id: '8',
    advertiser_name: '이케아',
    advertiser_logo_url: null,
    creative_type: 'image',
    creative_url: 'https://images.unsplash.com/photo-1637747020120-74c5d5cbb4c4?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1637747020120-74c5d5cbb4c4?w=400',
    format: 'banner',
    category_id: 'lifestyle',
    landing_url: null,
    collected_at: '2024-12-13T00:00:00Z',
    country_code: 'KR',
    view_count: 540000,
    created_at: '2024-12-13T00:00:00Z',
  },
  {
    id: '9',
    advertiser_name: '나이키',
    advertiser_logo_url: null,
    creative_type: 'video',
    creative_url: 'https://images.unsplash.com/photo-1656944227480-98180d2a5155?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1656944227480-98180d2a5155?w=400',
    format: 'interstitial',
    category_id: 'fashion',
    landing_url: null,
    collected_at: '2024-12-12T00:00:00Z',
    country_code: 'KR',
    view_count: 1100000,
    created_at: '2024-12-12T00:00:00Z',
  },
  {
    id: '10',
    advertiser_name: '구찌',
    advertiser_logo_url: null,
    creative_type: 'image',
    creative_url: 'https://images.unsplash.com/photo-1613909671501-f9678ffc1d33?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1613909671501-f9678ffc1d33?w=400',
    format: 'banner',
    category_id: 'fashion',
    landing_url: null,
    collected_at: '2024-12-11T00:00:00Z',
    country_code: 'KR',
    view_count: 980000,
    created_at: '2024-12-11T00:00:00Z',
  },
  {
    id: '11',
    advertiser_name: '애플',
    advertiser_logo_url: null,
    creative_type: 'image',
    creative_url: 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?w=400',
    format: 'banner',
    category_id: 'tech',
    landing_url: null,
    collected_at: '2024-12-10T00:00:00Z',
    country_code: 'KR',
    view_count: 2100000,
    created_at: '2024-12-10T00:00:00Z',
  },
  {
    id: '12',
    advertiser_name: 'LG전자',
    advertiser_logo_url: null,
    creative_type: 'video',
    creative_url: 'https://images.unsplash.com/photo-1557817683-5cfe3620b05c?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1557817683-5cfe3620b05c?w=400',
    format: 'interstitial',
    category_id: 'tech',
    landing_url: null,
    collected_at: '2024-12-09T00:00:00Z',
    country_code: 'KR',
    view_count: 1700000,
    created_at: '2024-12-09T00:00:00Z',
  },
  {
    id: '13',
    advertiser_name: '블루보틀',
    advertiser_logo_url: null,
    creative_type: 'image',
    creative_url: 'https://images.unsplash.com/photo-1614639938587-ec36a68ac904?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1614639938587-ec36a68ac904?w=400',
    format: 'banner',
    category_id: 'food',
    landing_url: null,
    collected_at: '2024-12-08T00:00:00Z',
    country_code: 'KR',
    view_count: 750000,
    created_at: '2024-12-08T00:00:00Z',
  },
  {
    id: '14',
    advertiser_name: '아웃백',
    advertiser_logo_url: null,
    creative_type: 'image',
    creative_url: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400',
    format: 'native',
    category_id: 'food',
    landing_url: null,
    collected_at: '2024-12-07T00:00:00Z',
    country_code: 'KR',
    view_count: 620000,
    created_at: '2024-12-07T00:00:00Z',
  },
  {
    id: '15',
    advertiser_name: '라네즈',
    advertiser_logo_url: null,
    creative_type: 'video',
    creative_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400',
    format: 'interstitial',
    category_id: 'beauty',
    landing_url: null,
    collected_at: '2024-12-06T00:00:00Z',
    country_code: 'KR',
    view_count: 1300000,
    created_at: '2024-12-06T00:00:00Z',
  },
  {
    id: '16',
    advertiser_name: '맥',
    advertiser_logo_url: null,
    creative_type: 'image',
    creative_url: 'https://images.unsplash.com/photo-1718972771654-47be8f36e0fd?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1718972771654-47be8f36e0fd?w=400',
    format: 'banner',
    category_id: 'beauty',
    landing_url: null,
    collected_at: '2024-12-05T00:00:00Z',
    country_code: 'KR',
    view_count: 1100000,
    created_at: '2024-12-05T00:00:00Z',
  },
];

// 카테고리 목록 (constants.ts의 CATEGORIES에 id 추가)
export const MOCK_CATEGORIES: Category[] = [
  { id: 'games', name_ko: '게임', name_en: 'Games', tier: 1, parent_id: null, icon_name: 'Gamepad2', display_order: 1 },
  { id: 'shopping', name_ko: '쇼핑', name_en: 'Shopping', tier: 1, parent_id: null, icon_name: 'ShoppingCart', display_order: 2 },
  { id: 'finance', name_ko: '금융', name_en: 'Finance', tier: 1, parent_id: null, icon_name: 'Wallet', display_order: 3 },
  { id: 'health', name_ko: '건강', name_en: 'Health & Fitness', tier: 1, parent_id: null, icon_name: 'Heart', display_order: 4 },
  { id: 'food', name_ko: '음식', name_en: 'Food & Drink', tier: 1, parent_id: null, icon_name: 'Utensils', display_order: 5 },
  { id: 'travel', name_ko: '여행', name_en: 'Travel', tier: 1, parent_id: null, icon_name: 'Plane', display_order: 6 },
  { id: 'entertainment', name_ko: '엔터테인먼트', name_en: 'Entertainment', tier: 1, parent_id: null, icon_name: 'Film', display_order: 7 },
  { id: 'education', name_ko: '교육', name_en: 'Education', tier: 1, parent_id: null, icon_name: 'GraduationCap', display_order: 8 },
  { id: 'lifestyle', name_ko: '라이프스타일', name_en: 'Lifestyle', tier: 1, parent_id: null, icon_name: 'Home', display_order: 9 },
  { id: 'beauty', name_ko: '뷰티', name_en: 'Beauty & Fashion', tier: 1, parent_id: null, icon_name: 'Sparkles', display_order: 10 },
  { id: 'tech', name_ko: '테크', name_en: 'Technology', tier: 1, parent_id: null, icon_name: 'Smartphone', display_order: 11 },
  { id: 'fashion', name_ko: '패션', name_en: 'Fashion', tier: 1, parent_id: null, icon_name: 'Shirt', display_order: 12 },
];

// 트렌드 데이터 (reference_styles/TrendSection.tsx 참조)
export interface TrendData {
  category: string;
  categoryId: string;
  growth: string;
  count: number;
  color: string;
}

export const TREND_DATA: TrendData[] = [
  { category: '패션', categoryId: 'fashion', growth: '+32%', count: 156, color: 'bg-purple-500' },
  { category: '테크', categoryId: 'tech', growth: '+28%', count: 142, color: 'bg-blue-500' },
  { category: '뷰티', categoryId: 'beauty', growth: '+25%', count: 128, color: 'bg-pink-500' },
  { category: '음식', categoryId: 'food', growth: '+18%', count: 98, color: 'bg-green-500' },
];

// 유틸리티 함수
export function getAdsByCategory(categoryId: string): Ad[] {
  return MOCK_ADS.filter(ad => ad.category_id === categoryId);
}

export function getAdsByFormat(format: AdFormat): Ad[] {
  return MOCK_ADS.filter(ad => ad.format === format);
}

export function getHotAds(limit = 10): Ad[] {
  return [...MOCK_ADS].sort((a, b) => b.view_count - a.view_count).slice(0, limit);
}

export function getTrendingAds(): Ad[] {
  return MOCK_ADS.filter(ad => ad.view_count > 1000000);
}

export function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`;
  }
  return count.toString();
}

export function getCategoryById(categoryId: string): Category | undefined {
  return MOCK_CATEGORIES.find(cat => cat.id === categoryId);
}
