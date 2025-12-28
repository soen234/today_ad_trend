import type { Ad, AdFormat, Category } from '@/types';

export interface MockAd {
  id: string;
  title: string;
  brand: string;
  category: string;
  adType: string;
  imageUrl: string;
  views: string;
  engagement: string;
  trending?: boolean;
}

export const mockAds: MockAd[] = [
  {
    id: '1',
    title: '2024 S/S 신상 컬렉션',
    brand: '루이비통',
    category: '패션',
    adType: '배너',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    views: '1.2M',
    engagement: '8.4%',
    trending: true,
  },
  {
    id: '2',
    title: '갤럭시 S24 Ultra',
    brand: '삼성전자',
    category: '테크',
    adType: '동영상',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    views: '2.4M',
    engagement: '12.1%',
    trending: true,
  },
  {
    id: '3',
    title: '프리미엄 커피 원두',
    brand: '스타벅스',
    category: '식품',
    adType: '네이티브',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    views: '890K',
    engagement: '6.8%',
  },
  {
    id: '4',
    title: '리프팅 세럼 런칭',
    brand: '설화수',
    category: '뷰티',
    adType: '배너',
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
    views: '1.5M',
    engagement: '9.2%',
    trending: true,
  },
  {
    id: '5',
    title: '제주도 여행 패키지',
    brand: '여행박사',
    category: '여행',
    adType: '동영상',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400',
    views: '720K',
    engagement: '7.3%',
  },
  {
    id: '6',
    title: '카드 혜택 프로모션',
    brand: 'KB국민카드',
    category: '금융',
    adType: '네이티브',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
    views: '650K',
    engagement: '5.9%',
  },
  {
    id: '7',
    title: '신작 게임 출시',
    brand: '넥슨',
    category: '게임',
    adType: '동영상',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400',
    views: '1.8M',
    engagement: '11.5%',
    trending: true,
  },
  {
    id: '8',
    title: '홈 인테리어 세일',
    brand: '이케아',
    category: '라이프스타일',
    adType: '배너',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    views: '540K',
    engagement: '6.2%',
  },
  {
    id: '9',
    title: '프리미엄 스니커즈',
    brand: '나이키',
    category: '패션',
    adType: '동영상',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    views: '1.1M',
    engagement: '9.8%',
    trending: true,
  },
  {
    id: '10',
    title: '럭셔리 핸드백',
    brand: '구찌',
    category: '패션',
    adType: '배너',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400',
    views: '980K',
    engagement: '7.5%',
  },
  {
    id: '11',
    title: '최신 노트북 출시',
    brand: '애플',
    category: '테크',
    adType: '배너',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    views: '2.1M',
    engagement: '10.3%',
  },
  {
    id: '12',
    title: '스킨케어 신제품',
    brand: '라네즈',
    category: '뷰티',
    adType: '동영상',
    imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400',
    views: '1.3M',
    engagement: '8.7%',
  },
];

export const categories = ['전체', '패션', '테크', '식품', '뷰티', '여행', '금융', '게임', '라이프스타일'];
export const adTypes = ['전체', '배너', '동영상', '네이티브', '인터스티셜'];

export const trendData = [
  { category: '패션', growth: '+32%', count: 156, color: 'from-purple-500 to-purple-600' },
  { category: '테크', growth: '+28%', count: 142, color: 'from-blue-500 to-blue-600' },
  { category: '뷰티', growth: '+25%', count: 128, color: 'from-pink-500 to-pink-600' },
  { category: '식품', growth: '+18%', count: 98, color: 'from-green-500 to-green-600' },
];

export function getAdsByCategory(category: string): MockAd[] {
  if (category === '전체') return mockAds;
  return mockAds.filter(ad => ad.category === category);
}

export function getTrendingAds(): MockAd[] {
  return mockAds.filter(ad => ad.trending);
}

export function getCategoryCount(category: string): number {
  if (category === '전체') return mockAds.length;
  return mockAds.filter(ad => ad.category === category).length;
}
