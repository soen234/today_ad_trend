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
    title: '2024 S/S New Collection',
    brand: 'Louis Vuitton',
    category: 'Fashion',
    adType: 'Banner',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    views: '1.2M',
    engagement: '8.4%',
    trending: true,
  },
  {
    id: '2',
    title: 'Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'Tech',
    adType: 'Video',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    views: '2.4M',
    engagement: '12.1%',
    trending: true,
  },
  {
    id: '3',
    title: 'Premium Coffee Beans',
    brand: 'Starbucks',
    category: 'Food',
    adType: 'Native',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    views: '890K',
    engagement: '6.8%',
  },
  {
    id: '4',
    title: 'Lifting Serum Launch',
    brand: 'Sulwhasoo',
    category: 'Beauty',
    adType: 'Banner',
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
    views: '1.5M',
    engagement: '9.2%',
    trending: true,
  },
  {
    id: '5',
    title: 'Hawaii Travel Package',
    brand: 'Expedia',
    category: 'Travel',
    adType: 'Video',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400',
    views: '720K',
    engagement: '7.3%',
  },
  {
    id: '6',
    title: 'Card Benefits Promo',
    brand: 'Chase',
    category: 'Finance',
    adType: 'Native',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
    views: '650K',
    engagement: '5.9%',
  },
  {
    id: '7',
    title: 'New Game Release',
    brand: 'EA Games',
    category: 'Games',
    adType: 'Video',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400',
    views: '1.8M',
    engagement: '11.5%',
    trending: true,
  },
  {
    id: '8',
    title: 'Home Interior Sale',
    brand: 'IKEA',
    category: 'Lifestyle',
    adType: 'Banner',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    views: '540K',
    engagement: '6.2%',
  },
  {
    id: '9',
    title: 'Premium Sneakers',
    brand: 'Nike',
    category: 'Fashion',
    adType: 'Video',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    views: '1.1M',
    engagement: '9.8%',
    trending: true,
  },
  {
    id: '10',
    title: 'Luxury Handbag',
    brand: 'Gucci',
    category: 'Fashion',
    adType: 'Banner',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400',
    views: '980K',
    engagement: '7.5%',
  },
  {
    id: '11',
    title: 'Latest Laptop Release',
    brand: 'Apple',
    category: 'Tech',
    adType: 'Banner',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    views: '2.1M',
    engagement: '10.3%',
  },
  {
    id: '12',
    title: 'Skincare New Product',
    brand: 'Laneige',
    category: 'Beauty',
    adType: 'Video',
    imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400',
    views: '1.3M',
    engagement: '8.7%',
  },
];

export const categories = ['All', 'Fashion', 'Tech', 'Food', 'Beauty', 'Travel', 'Finance', 'Games', 'Lifestyle'];
export const adTypes = ['All', 'Banner', 'Video', 'Native', 'Interstitial'];

export const trendData = [
  { category: 'Fashion', growth: '+32%', count: 156, color: 'from-purple-500 to-purple-600' },
  { category: 'Tech', growth: '+28%', count: 142, color: 'from-blue-500 to-blue-600' },
  { category: 'Beauty', growth: '+25%', count: 128, color: 'from-pink-500 to-pink-600' },
  { category: 'Food', growth: '+18%', count: 98, color: 'from-green-500 to-green-600' },
];

export function getAdsByCategory(category: string): MockAd[] {
  if (category === 'All') return mockAds;
  return mockAds.filter(ad => ad.category === category);
}

export function getTrendingAds(): MockAd[] {
  return mockAds.filter(ad => ad.trending);
}

export function getCategoryCount(category: string): number {
  if (category === 'All') return mockAds.length;
  return mockAds.filter(ad => ad.category === category).length;
}
