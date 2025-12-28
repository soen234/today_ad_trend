import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bookmark, FolderPlus, Plus, Trash2 } from 'lucide-react-native';
import { useSavedStore } from '@/stores/savedStore';
import { MOCK_ADS } from '@/lib/mock';
import { AdCard } from '@/components/ads';
import { Ad } from '@/types';

type TabType = 'all' | 'collections';

export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const { savedAdIds, clearAll } = useSavedStore();

  const savedAds = useMemo(() => {
    return MOCK_ADS.filter((ad) => savedAdIds.includes(ad.id));
  }, [savedAdIds]);

  const handleAdPress = (ad: Ad) => {
    router.push(`/ad/${ad.id}`);
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 py-3 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <View>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            저장된 광고
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {savedAds.length}개의 광고
          </Text>
        </View>
        {savedAds.length > 0 && (
          <Pressable
            onPress={clearAll}
            className="flex-row items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg active:opacity-70"
          >
            <Trash2 size={16} color="#EF4444" />
            <Text className="text-sm text-red-500 font-medium">전체 삭제</Text>
          </Pressable>
        )}
      </View>

      {/* Tab Header */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <View className="flex-row bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
          <Pressable
            onPress={() => setActiveTab('all')}
            className={`flex-1 py-2 rounded-lg items-center ${
              activeTab === 'all' ? 'bg-white dark:bg-gray-600' : ''
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === 'all'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              모든 저장
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('collections')}
            className={`flex-1 py-2 rounded-lg items-center ${
              activeTab === 'collections' ? 'bg-white dark:bg-gray-600' : ''
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === 'collections'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              내 컬렉션
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'all' ? (
          // All Saved Ads
          savedAds.length > 0 ? (
            <View className="p-2">
              <View className="flex-row flex-wrap">
                {savedAds.map((ad) => (
                  <View key={ad.id} className="w-1/2 p-2">
                    <AdCard ad={ad} onPress={() => handleAdPress(ad)} />
                  </View>
                ))}
              </View>
            </View>
          ) : (
            // Empty State
            <View className="items-center py-20 px-8">
              <View className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-4">
                <Bookmark size={40} color="#9CA3AF" />
              </View>
              <Text className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                저장된 광고가 없습니다
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                관심 있는 광고를 저장하고{'\n'}나중에 다시 확인하세요
              </Text>
              <Pressable
                onPress={() => router.push('/(tabs)')}
                className="bg-blue-500 px-6 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-white font-semibold">광고 둘러보기</Text>
              </Pressable>
            </View>
          )
        ) : (
          // Collections Tab
          <View className="px-4 pt-4">
            {/* Create Collection Button */}
            <Pressable className="bg-white dark:bg-gray-800 rounded-xl p-4 flex-row items-center border border-dashed border-gray-300 dark:border-gray-600 mb-4 active:opacity-80">
              <View className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-4">
                <Plus size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900 dark:text-white">
                  새 컬렉션 만들기
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  광고를 주제별로 정리하세요
                </Text>
              </View>
            </Pressable>

            {/* Empty Collections State */}
            <View className="items-center py-12">
              <View className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-4">
                <FolderPlus size={32} color="#9CA3AF" />
              </View>
              <Text className="text-base font-medium text-gray-900 dark:text-white mb-2">
                컬렉션이 없습니다
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
                첫 번째 컬렉션을 만들어보세요
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
