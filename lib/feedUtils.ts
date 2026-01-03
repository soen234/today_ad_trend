import { AdNews, FeedItem, NewsFeedItem, AdFeedItem } from '@/types';

interface MixFeedOptions {
  news: AdNews[];
  adInterval?: number;
  minNewsBeforeFirstAd?: number;
  maxAds?: number;
}

export function createMixedFeed({
  news,
  adInterval = 4,
  minNewsBeforeFirstAd = 3,
  maxAds = 5,
}: MixFeedOptions): FeedItem[] {
  if (news.length === 0) {
    return [];
  }

  const feedItems: FeedItem[] = [];
  let adCount = 0;
  let newsCountSinceLastAd = 0;

  news.forEach((newsItem, index) => {
    feedItems.push({
      type: 'news',
      data: newsItem,
    } as NewsFeedItem);

    newsCountSinceLastAd++;

    const hasReachedMinNews = index >= minNewsBeforeFirstAd - 1;
    const isAtInterval = newsCountSinceLastAd >= adInterval;
    const hasMoreNewsAfter = index < news.length - 1;
    const canAddMoreAds = adCount < maxAds;

    if (hasReachedMinNews && isAtInterval && hasMoreNewsAfter && canAddMoreAds) {
      feedItems.push({
        type: 'ad',
        id: `ad-${adCount}`,
      } as AdFeedItem);

      adCount++;
      newsCountSinceLastAd = 0;
    }
  });

  return feedItems;
}

export function getFeedItemKey(item: FeedItem): string {
  if (item.type === 'news') {
    return `news-${item.data.id}`;
  }
  return item.id;
}
