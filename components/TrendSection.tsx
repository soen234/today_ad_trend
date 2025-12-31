import { View, Text, ScrollView } from 'react-native';
import { Zap, Eye } from 'lucide-react-native';
import { CategoryTrendCard } from './CategoryTrendCard';
import { Card, CardContent } from './ui/Card';
import { trendData, getAdsByCategory, type MockAd } from '@/lib/mockData';

interface TrendSectionProps {
  onAdPress?: (ad: MockAd) => void;
}

const gradientColorsMap: Record<string, [string, string]> = {
  'Fashion': ['#8B5CF6', '#7C3AED'],
  'Tech': ['#3B82F6', '#2563EB'],
  'Beauty': ['#EC4899', '#DB2777'],
  'Food': ['#22C55E', '#16A34A'],
};

export function TrendSection({ onAdPress }: TrendSectionProps) {
  return (
    <View className="gap-4">
      {/* Header */}
      <View>
        <View className="flex-row items-center gap-2 mb-1">
          <Zap size={20} color="#EAB308" fill="#EAB308" />
          <Text className="text-xl font-semibold text-gray-900 dark:text-white">
            This Week's Trends
          </Text>
        </View>
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          Check out the most popular ad categories
        </Text>
      </View>

      {/* Category Trend Cards - Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 16 }}
      >
        {trendData.map((trend) => {
          const ads = getAdsByCategory(trend.category).slice(0, 3);
          return (
            <View key={trend.category} style={{ width: 200 }}>
              <CategoryTrendCard
                category={trend.category}
                ads={ads}
                gradientColors={gradientColorsMap[trend.category] || ['#6B7280', '#4B5563']}
                onAdPress={onAdPress}
              />
            </View>
          );
        })}
      </ScrollView>

      {/* Weekly Highlight Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="flex-row gap-4">
          <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center">
            <Eye size={24} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Weekly Highlight
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              The most viewed ad this week is a new smartphone ad from the{' '}
              <Text className="font-semibold">Tech category</Text>.
            </Text>
            <View className="flex-row gap-4">
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Total Views: <Text className="font-medium text-gray-900 dark:text-white">2.4M</Text>
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Avg. Engagement: <Text className="font-medium text-gray-900 dark:text-white">8.5%</Text>
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
