import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Eye, TrendingUp } from 'lucide-react-native';
import { Ad } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatViewCount, getCategoryById } from '@/lib/mock';

interface AdCardProps {
  ad: Ad;
  onPress?: () => void;
  showTrending?: boolean;
}

const FORMAT_LABELS: Record<string, string> = {
  banner: '배너',
  interstitial: '전면',
  rewarded: '리워드',
  native: '네이티브',
  playable: '플레이어블',
  app_open: '앱오픈',
};

export function AdCard({ ad, onPress, showTrending }: AdCardProps) {
  const category = getCategoryById(ad.category_id);
  const isTrending = showTrending ?? ad.view_count > 1000000;

  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden active:scale-[0.98] transition-transform"
    >
      {/* Image Container */}
      <View className="relative" style={{ aspectRatio: 4 / 3 }}>
        <Image
          source={{ uri: ad.creative_url }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
        />

        {/* Trending Badge */}
        {isTrending && (
          <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded-full flex-row items-center gap-1">
            <TrendingUp size={12} color="white" />
            <Text className="text-white text-xs font-medium">트렌딩</Text>
          </View>
        )}

        {/* Format Badge */}
        <View className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-white/90 dark:bg-gray-800/90">
            {FORMAT_LABELS[ad.format] || ad.format}
          </Badge>
        </View>
      </View>

      {/* Content */}
      <View className="p-3">
        {/* Title & Advertiser */}
        <View className="mb-2">
          <Text
            className="text-base font-semibold text-gray-900 dark:text-white mb-0.5"
            numberOfLines={1}
          >
            {ad.advertiser_name}
          </Text>
          <Text
            className="text-sm text-gray-600 dark:text-gray-400"
            numberOfLines={1}
          >
            {category?.name_ko || ad.category_id}
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <Badge variant="outline">
            {category?.name_ko || ad.category_id}
          </Badge>

          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Eye size={14} color="#9CA3AF" />
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {formatViewCount(ad.view_count)}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <TrendingUp size={14} color="#9CA3AF" />
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {((ad.view_count / 10000000) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
