import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LayoutGrid } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BannerAdSize } from 'react-native-google-mobile-ads';
import { AdMobCard } from '@/components/ads';

type BannerType = 'all' | 'banner' | 'large' | 'rectangle' | 'adaptive';

const BANNER_FILTERS: { key: BannerType; label: string; size?: BannerAdSize }[] = [
  { key: 'all', label: 'All' },
  { key: 'banner', label: 'Banner', size: BannerAdSize.BANNER },
  { key: 'large', label: 'Large', size: BannerAdSize.LARGE_BANNER },
  { key: 'rectangle', label: 'Rectangle', size: BannerAdSize.MEDIUM_RECTANGLE },
  { key: 'adaptive', label: 'Adaptive', size: BannerAdSize.ANCHORED_ADAPTIVE_BANNER },
];

export default function BannerScreen() {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<BannerType>('all');

  const getAdsToShow = () => {
    if (selectedFilter === 'all') {
      return [
        { size: BannerAdSize.BANNER, label: 'Banner (320x50)' },
        { size: BannerAdSize.LARGE_BANNER, label: 'Large Banner (320x100)' },
        { size: BannerAdSize.MEDIUM_RECTANGLE, label: 'Medium Rectangle (300x250)' },
        { size: BannerAdSize.ANCHORED_ADAPTIVE_BANNER, label: 'Adaptive Banner' },
      ];
    }
    const filter = BANNER_FILTERS.find((f) => f.key === selectedFilter);
    if (filter?.size) {
      return [{ size: filter.size, label: filter.label }];
    }
    return [];
  };

  const adsToShow = getAdsToShow();

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-blue-500 rounded-xl items-center justify-center">
            <LayoutGrid size={24} color="white" />
          </View>
          <View>
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Banner Ads
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Various banner ad sizes
            </Text>
          </View>
        </View>
      </View>

      {/* Filter */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {BANNER_FILTERS.map((filter) => (
            <Pressable
              key={filter.key}
              onPress={() => setSelectedFilter(filter.key)}
              className={`px-4 py-2 rounded-full ${
                selectedFilter === filter.key
                  ? 'bg-blue-500'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedFilter === filter.key
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20, gap: 16 }}
      >
        {adsToShow.map((ad, index) => (
          <View key={`${ad.label}-${index}`}>
            <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {ad.label}
            </Text>
            <AdMobCard size={ad.size} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
