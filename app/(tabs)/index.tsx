import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Newspaper, ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { useNews, useNewsDates, useDigestByDate } from '@/hooks/useNews';
import { NewsCard, DigestCard } from '@/components/news';
import { InFeedAd } from '@/components/ads/InFeedAd';
import { NewsCategory, FeedItem } from '@/types';
import { createMixedFeed, getFeedItemKey } from '@/lib/feedUtils';

const CATEGORIES: { key: NewsCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'adtech', label: 'AdTech' },
  { key: 'martech', label: 'MarTech' },
  { key: 'general', label: 'General' },
];

export default function NewsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch available dates
  const { dates, loading: datesLoading } = useNewsDates();

  // Set initial date when dates are loaded
  useEffect(() => {
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
    }
  }, [dates, selectedDate]);

  // Fetch news with filters
  const { news, loading, refreshing, refresh } = useNews({
    category: selectedCategory,
    date: selectedDate || undefined,
  });

  // Fetch digest for selected date
  const { digest, loading: digestLoading } = useDigestByDate(selectedDate);

  // Calculate news counts from actual news data
  const newsCounts = useMemo(() => {
    if (!news || news.length === 0) return undefined;

    return {
      adtech: news.filter((n) => n.category === 'adtech').length,
      martech: news.filter((n) => n.category === 'martech').length,
      general: news.filter((n) => n.category === 'general').length,
      total: news.length,
    };
  }, [news]);

  // Create mixed feed with ads
  const mixedFeed = useMemo(() => {
    return createMixedFeed({
      news,
      adInterval: 4,
      minNewsBeforeFirstAd: 3,
      maxAds: 5,
    });
  }, [news]);

  // Render function for mixed feed items
  const renderFeedItem = useCallback(({ item }: { item: FeedItem }) => {
    if (item.type === 'ad') {
      return <InFeedAd />;
    }
    return <NewsCard news={item.data} />;
  }, []);

  // Navigate between dates
  const currentDateIndex = useMemo(() => {
    if (!selectedDate || dates.length === 0) return -1;
    return dates.findIndex((d) => d === selectedDate);
  }, [dates, selectedDate]);

  const canGoPrevious = currentDateIndex >= 0 && currentDateIndex < dates.length - 1;
  const canGoNext = currentDateIndex > 0;

  const goToPreviousDate = useCallback(() => {
    if (!selectedDate || dates.length === 0) return;
    const index = dates.findIndex((d) => d === selectedDate);
    if (index >= 0 && index < dates.length - 1) {
      setSelectedDate(dates[index + 1]);
    }
  }, [dates, selectedDate]);

  const goToNextDate = useCallback(() => {
    if (!selectedDate || dates.length === 0) return;
    const index = dates.findIndex((d) => d === selectedDate);
    if (index > 0) {
      setSelectedDate(dates[index - 1]);
    }
  }, [dates, selectedDate]);

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-emerald-500 rounded-xl items-center justify-center">
            <Newspaper size={24} color="white" />
          </View>
          <View>
            <Text className="text-xl font-bold text-gray-900 dark:text-white">Ad News</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Daily advertising industry updates
            </Text>
          </View>
        </View>
      </View>

      {/* Date Navigator */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={goToPreviousDate}
            disabled={!canGoPrevious}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="p-2"
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : !canGoPrevious ? 0.3 : 1,
            })}
          >
            <ChevronLeft size={24} color={canGoPrevious ? '#10B981' : '#9CA3AF'} />
          </Pressable>

          <View className="flex-row items-center">
            <Calendar size={18} color="#10B981" />
            <Text className="text-base font-semibold text-gray-900 dark:text-white ml-2">
              {selectedDate ? formatDateShort(selectedDate) : 'Loading...'}
            </Text>
          </View>

          <Pressable
            onPress={goToNextDate}
            disabled={!canGoNext}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="p-2"
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : !canGoNext ? 0.3 : 1,
            })}
          >
            <ChevronRight size={24} color={canGoNext ? '#10B981' : '#9CA3AF'} />
          </Pressable>
        </View>
      </View>

      {/* Category Filter */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.key}
              onPress={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === cat.key
                  ? 'bg-emerald-500'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedCategory === cat.key
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-gray-500 dark:text-gray-400 mt-2">Loading news...</Text>
        </View>
      ) : (
        <FlatList
          data={mixedFeed}
          keyExtractor={getFeedItemKey}
          renderItem={renderFeedItem}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 20,
          }}
          ListHeaderComponent={
            // Only show AI Summary in "All" category
            selectedCategory === 'all' && digest && !digestLoading ? (
              <DigestCard digest={digest} newsCounts={newsCounts} />
            ) : null
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Newspaper size={48} color="#9CA3AF" />
              <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center">
                No news found for this date
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#10B981" />
          }
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
        />
      )}
    </View>
  );
}
