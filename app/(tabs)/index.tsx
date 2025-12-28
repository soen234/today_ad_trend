import { useState, useMemo } from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrendSection } from '@/components/home';
import { AdCard } from '@/components/ads';
import { Badge } from '@/components/ui/Badge';
import { MOCK_ADS } from '@/lib/mock';
import { Ad } from '@/types';

const FILTER_CATEGORIES = ['전체', '패션', '테크', '뷰티', '음식', '게임', '금융'];

const CATEGORY_MAP: Record<string, string> = {
  '패션': 'fashion',
  '테크': 'tech',
  '뷰티': 'beauty',
  '음식': 'food',
  '게임': 'games',
  '금융': 'finance',
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  // 필터링된 광고
  const filteredAds = useMemo(() => {
    let ads = [...MOCK_ADS];

    // 카테고리 필터
    if (selectedCategory !== '전체') {
      const categoryId = CATEGORY_MAP[selectedCategory];
      if (categoryId) {
        ads = ads.filter((ad) => ad.category_id === categoryId);
      }
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      ads = ads.filter(
        (ad) =>
          ad.advertiser_name.toLowerCase().includes(query) ||
          ad.category_id.toLowerCase().includes(query)
      );
    }

    return ads;
  }, [selectedCategory, searchQuery]);

  const handleAdPress = (ad: Ad) => {
    router.push(`/ad/${ad.id}`);
  };

  const getCategoryCount = (category: string) => {
    if (category === '전체') return MOCK_ADS.length;
    const categoryId = CATEGORY_MAP[category];
    return MOCK_ADS.filter((ad) => ad.category_id === categoryId).length;
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 pb-4">
        {/* Logo & Title */}
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-10 bg-blue-500 rounded-xl items-center justify-center">
            <Sparkles size={24} color="white" />
          </View>
          <View>
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              애드 트렌드
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              광고 트렌드를 한눈에 확인하세요
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="브랜드 또는 광고명으로 검색..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-base text-gray-900 dark:text-white"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Trend Section */}
        <View className="mt-6">
          <TrendSection onAdPress={handleAdPress} />
        </View>

        {/* Category Filter */}
        <View className="px-4 mt-4">
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            카테고리
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {FILTER_CATEGORIES.map((category) => (
              <Pressable key={category} onPress={() => setSelectedCategory(category)}>
                <Badge
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className={selectedCategory === category ? '' : 'bg-white dark:bg-gray-800'}
                >
                  <Text
                    className={`text-sm ${
                      selectedCategory === category
                        ? 'text-white dark:text-gray-900'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {category}
                    <Text className="opacity-70"> {getCategoryCount(category)}</Text>
                  </Text>
                </Badge>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Results count */}
        <View className="px-4 mt-4 mb-2">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            총 <Text className="font-semibold text-gray-900 dark:text-white">{filteredAds.length}개</Text>의 광고
          </Text>
        </View>

        {/* Ad Grid */}
        <View className="px-2">
          <View className="flex-row flex-wrap">
            {filteredAds.map((ad) => (
              <View key={ad.id} className="w-1/2 p-2">
                <AdCard ad={ad} onPress={() => handleAdPress(ad)} />
              </View>
            ))}
          </View>
        </View>

        {/* Empty State */}
        {filteredAds.length === 0 && (
          <View className="items-center justify-center py-16">
            <View className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-4">
              <Search size={32} color="#9CA3AF" />
            </View>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              검색 결과가 없습니다
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              다른 검색어나 필터를 시도해보세요
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
