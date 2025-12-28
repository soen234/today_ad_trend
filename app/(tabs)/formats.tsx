import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SlidersHorizontal, ChevronDown } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdCard } from '@/components/ads';
import { MOCK_ADS } from '@/lib/mock';
import { Ad, AdFormat } from '@/types';

type SortOption = 'latest' | 'popular';
type PeriodOption = '7d' | '30d' | 'all';

const AD_TYPES: { key: AdFormat | 'all'; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'banner', label: '배너' },
  { key: 'interstitial', label: '전면' },
  { key: 'rewarded', label: '리워드' },
  { key: 'native', label: '네이티브' },
  { key: 'playable', label: '플레이어블' },
  { key: 'app_open', label: '앱오픈' },
];

export default function FormatsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedFormat, setSelectedFormat] = useState<AdFormat | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [period, setPeriod] = useState<PeriodOption>('all');

  const filteredAds = useMemo(() => {
    let ads = [...MOCK_ADS];

    // 포맷 필터
    if (selectedFormat !== 'all') {
      ads = ads.filter((ad) => ad.format === selectedFormat);
    }

    // 정렬
    if (sortBy === 'popular') {
      ads = ads.sort((a, b) => b.view_count - a.view_count);
    } else {
      ads = ads.sort((a, b) =>
        new Date(b.collected_at).getTime() - new Date(a.collected_at).getTime()
      );
    }

    return ads;
  }, [selectedFormat, sortBy, period]);

  const handleAdPress = (ad: Ad) => {
    router.push(`/ad/${ad.id}`);
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          광고 포맷
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          포맷별로 광고를 탐색하세요
        </Text>
      </View>

      {/* Ad Type Tabs */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
        >
          {AD_TYPES.map((type) => (
            <Pressable
              key={type.key}
              onPress={() => setSelectedFormat(type.key)}
              className={`px-4 py-2 rounded-full ${
                selectedFormat === type.key
                  ? 'bg-blue-500'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedFormat === type.key
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {type.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Filter/Sort Bar */}
      <View className="bg-white dark:bg-gray-800 px-4 py-3 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700">
        {/* Period Filter */}
        <View className="flex-row gap-2">
          {(['7d', '30d', 'all'] as PeriodOption[]).map((p) => (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg ${
                period === p
                  ? 'bg-gray-900 dark:bg-white'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  period === p
                    ? 'text-white dark:text-gray-900'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {p === '7d' ? '7일' : p === '30d' ? '30일' : '전체'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Sort Dropdown */}
        <Pressable
          onPress={() => setSortBy(sortBy === 'latest' ? 'popular' : 'latest')}
          className="flex-row items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg"
        >
          <Text className="text-xs text-gray-600 dark:text-gray-300">
            {sortBy === 'latest' ? '최신순' : '인기순'}
          </Text>
          <ChevronDown size={14} color="#6B7280" />
        </Pressable>
      </View>

      {/* Results Count */}
      <View className="px-4 py-3">
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          총 <Text className="font-medium text-gray-900 dark:text-white">{filteredAds.length}개</Text>의 광고
        </Text>
      </View>

      {/* Ad Grid */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row flex-wrap">
          {filteredAds.map((ad) => (
            <View key={ad.id} className="w-1/2 p-2">
              <AdCard ad={ad} onPress={() => handleAdPress(ad)} />
            </View>
          ))}
        </View>

        {/* Empty State */}
        {filteredAds.length === 0 && (
          <View className="items-center py-16">
            <View className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-4">
              <SlidersHorizontal size={32} color="#9CA3AF" />
            </View>
            <Text className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              해당 조건의 광고가 없습니다
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              다른 필터를 시도해보세요
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
