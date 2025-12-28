import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Eye, TrendingUp } from 'lucide-react-native';
import { Badge } from './ui/Badge';
import type { MockAd } from '@/lib/mockData';

interface AdCardProps {
  ad: MockAd;
  onPress?: () => void;
}

export function AdCard({ ad, onPress }: AdCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {/* Image */}
      <View className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700">
        <Image
          source={{ uri: ad.imageUrl }}
          className="w-full h-full"
          contentFit="cover"
          transition={200}
        />

        {/* Trending Badge */}
        {ad.trending && (
          <View className="absolute top-3 right-3 bg-red-500 px-2.5 py-1 rounded-full flex-row items-center">
            <TrendingUp size={12} color="#fff" />
            <Text className="text-white text-xs font-medium ml-1">트렌딩</Text>
          </View>
        )}

        {/* Ad Type Badge */}
        <View className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 dark:bg-gray-900/90">
            <Text className="text-gray-800 dark:text-white text-xs">{ad.adType}</Text>
          </Badge>
        </View>
      </View>

      {/* Content */}
      <View className="p-3">
        <Text
          className="text-base font-semibold text-gray-900 dark:text-white mb-1"
          numberOfLines={1}
        >
          {ad.title}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {ad.brand}
        </Text>

        {/* Footer */}
        <View className="flex-row items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <Badge variant="outline">
            <Text className="text-xs text-gray-600 dark:text-gray-300">{ad.category}</Text>
          </Badge>

          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Eye size={14} color="#6B7280" />
              <Text className="text-xs text-gray-500">{ad.views}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <TrendingUp size={14} color="#6B7280" />
              <Text className="text-xs text-gray-500">{ad.engagement}</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
