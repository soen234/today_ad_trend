import { View, Text, ScrollView } from 'react-native';
import { Zap, Eye } from 'lucide-react-native';
import { Ad } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { CategoryTrendCarousel } from './CategoryTrendCarousel';
import { TREND_DATA, getAdsByCategory } from '@/lib/mock';

interface TrendSectionProps {
  onAdPress: (ad: Ad) => void;
}

export function TrendSection({ onAdPress }: TrendSectionProps) {
  // 카테고리별 트렌드 광고 준비
  const trendAds: Record<string, Ad[]> = {};
  TREND_DATA.forEach((trend) => {
    trendAds[trend.category] = getAdsByCategory(trend.categoryId).slice(0, 3);
  });

  return (
    <View className="mb-6">
      {/* Header */}
      <View className="px-4 mb-4">
        <View className="flex-row items-center gap-2 mb-1">
          <Zap size={20} color="#EAB308" fill="#EAB308" />
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            이번 주 트렌드
          </Text>
        </View>
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          가장 많은 주목을 받고 있는 광고 카테고리를 확인하세요
        </Text>
      </View>

      {/* Category Trend Carousels - 가로 스크롤 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        decelerationRate="fast"
        snapToInterval={280}
      >
        {TREND_DATA.map((trend) => (
          <View key={trend.category} style={{ width: 260 }}>
            <CategoryTrendCarousel
              category={trend.category}
              ads={trendAds[trend.category] || []}
              color={trend.color}
              onAdPress={onAdPress}
            />
          </View>
        ))}
      </ScrollView>

      {/* Weekly Highlight Card */}
      <View className="px-4 mt-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <View className="flex-row gap-3">
              <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center">
                <Eye size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  주간 하이라이트
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  이번 주 가장 높은 조회수를 기록한 광고는{' '}
                  <Text className="font-semibold">테크 카테고리</Text>의 새로운 스마트폰 광고입니다.
                </Text>
                <View className="flex-row gap-4">
                  <View>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">총 조회수</Text>
                    <Text className="text-sm font-semibold text-gray-900 dark:text-white">2.4M</Text>
                  </View>
                  <View>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">평균 참여율</Text>
                    <Text className="text-sm font-semibold text-gray-900 dark:text-white">8.5%</Text>
                  </View>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>
    </View>
  );
}
