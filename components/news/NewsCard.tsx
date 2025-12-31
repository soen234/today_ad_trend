import { View, Text, Pressable, Linking } from 'react-native';
import { Image } from 'expo-image';
import { Calendar, ExternalLink } from 'lucide-react-native';
import { AdNews } from '@/types';

interface NewsCardProps {
  news: AdNews;
}

const CATEGORY_COLORS: Record<string, string> = {
  adtech: '#3B82F6',
  martech: '#8B5CF6',
  general: '#6B7280',
};

export function NewsCard({ news }: NewsCardProps) {
  const categoryColor = CATEGORY_COLORS[news.category.toLowerCase()] || '#6B7280';

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePress = () => {
    if (news.source_url) {
      Linking.openURL(news.source_url);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-3"
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
    >
      {news.image_url && (
        <Image
          source={{ uri: news.image_url }}
          style={{ width: '100%', height: 160 }}
          contentFit="cover"
        />
      )}

      <View className="p-4">
        {/* Category Badge */}
        <View className="flex-row items-center mb-2">
          <View
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: `${categoryColor}20` }}
          >
            <Text style={{ color: categoryColor }} className="text-xs font-medium uppercase">
              {news.category}
            </Text>
          </View>
          {news.source && (
            <Text className="text-xs text-gray-400 dark:text-gray-500 ml-2">
              {news.source}
            </Text>
          )}
        </View>

        {/* Title */}
        <Text className="text-base font-semibold text-gray-900 dark:text-white mb-2" numberOfLines={2}>
          {news.title}
        </Text>

        {/* Summary */}
        {news.summary && (
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3" numberOfLines={3}>
            {news.summary}
          </Text>
        )}

        {/* Footer */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Calendar size={14} color="#9CA3AF" />
            <Text className="text-xs text-gray-400 dark:text-gray-500 ml-1">
              {formatDate(news.published_at)}
            </Text>
          </View>

          {news.source_url && (
            <View className="flex-row items-center">
              <ExternalLink size={14} color="#3B82F6" />
              <Text className="text-xs text-blue-500 ml-1">Read more</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
