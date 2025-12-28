import type { Category, AdFormat } from '@/types';

export const AD_FORMATS: { id: AdFormat; label: string; icon: string }[] = [
  { id: 'banner', label: 'Banner', icon: 'RectangleHorizontal' },
  { id: 'interstitial', label: 'Interstitial', icon: 'Maximize2' },
  { id: 'rewarded', label: 'Rewarded', icon: 'Gift' },
  { id: 'native', label: 'Native', icon: 'LayoutGrid' },
  { id: 'playable', label: 'Playable', icon: 'Gamepad2' },
  { id: 'app_open', label: 'App Open', icon: 'Smartphone' },
];

export const CATEGORIES: Omit<Category, 'id'>[] = [
  { name_ko: '게임', name_en: 'Games', tier: 1, parent_id: null, icon_name: 'Gamepad2', display_order: 1 },
  { name_ko: '쇼핑', name_en: 'Shopping', tier: 1, parent_id: null, icon_name: 'ShoppingBag', display_order: 2 },
  { name_ko: '금융', name_en: 'Finance', tier: 1, parent_id: null, icon_name: 'Wallet', display_order: 3 },
  { name_ko: '소셜', name_en: 'Social', tier: 1, parent_id: null, icon_name: 'Users', display_order: 4 },
  { name_ko: '교육', name_en: 'Education', tier: 1, parent_id: null, icon_name: 'GraduationCap', display_order: 5 },
  { name_ko: '뉴스', name_en: 'News', tier: 1, parent_id: null, icon_name: 'Newspaper', display_order: 6 },
  { name_ko: '음악', name_en: 'Music', tier: 1, parent_id: null, icon_name: 'Music', display_order: 7 },
  { name_ko: '여행', name_en: 'Travel', tier: 1, parent_id: null, icon_name: 'Plane', display_order: 8 },
  { name_ko: '건강', name_en: 'Health', tier: 1, parent_id: null, icon_name: 'Heart', display_order: 9 },
  { name_ko: '음식', name_en: 'Food', tier: 1, parent_id: null, icon_name: 'UtensilsCrossed', display_order: 10 },
  { name_ko: '엔터테인먼트', name_en: 'Entertainment', tier: 1, parent_id: null, icon_name: 'Clapperboard', display_order: 11 },
  { name_ko: '유틸리티', name_en: 'Utilities', tier: 1, parent_id: null, icon_name: 'Wrench', display_order: 12 },
];
