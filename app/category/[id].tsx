import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Filter } from 'lucide-react-native';
import { MOCK_ADS, getCategoryById } from '@/lib/mock';
import { AdCard } from '@/components/ads';
import { Ad } from '@/types';

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const category = getCategoryById(id || '');
  const ads = useMemo(() => {
    return MOCK_ADS.filter((ad) => ad.category_id === id);
  }, [id]);

  const handleAdPress = (ad: Ad) => {
    router.push(`/ad/${ad.id}`);
  };

  if (!category) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-gray-500 dark:text-gray-400">
          카테고리를 찾을 수 없습니다
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-gray-50 dark:bg-gray-900" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="bg-white dark:bg-gray-800 px-4 py-3 flex-row items-center border-b border-gray-200 dark:border-gray-700">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2"
          >
            <ArrowLeft size={24} color="#6B7280" />
          </Pressable>
          <View className="flex-1 ml-2">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              {category.name_ko}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {ads.length}개의 광고
            </Text>
          </View>
          <Pressable className="w-10 h-10 items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full">
            <Filter size={20} color="#6B7280" />
          </Pressable>
        </View>

        {/* Ad Grid */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 8, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row flex-wrap">
            {ads.map((ad) => (
              <View key={ad.id} className="w-1/2 p-2">
                <AdCard ad={ad} onPress={() => handleAdPress(ad)} />
              </View>
            ))}
          </View>

          {/* Empty State */}
          {ads.length === 0 && (
            <View className="items-center justify-center py-20">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                광고가 없습니다
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                이 카테고리에는 아직 광고가 없습니다
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}
