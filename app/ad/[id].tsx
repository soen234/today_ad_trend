import { View, Text, ScrollView, Pressable, Share } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Heart,
  Share2,
  ExternalLink,
  Eye,
  TrendingUp,
  Calendar,
  Tag,
  Monitor,
} from 'lucide-react-native';
import { MOCK_ADS, getCategoryById, formatViewCount } from '@/lib/mock';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { AdCard } from '@/components/ads';
import { Ad } from '@/types';

const FORMAT_LABELS: Record<string, string> = {
  banner: '배너',
  interstitial: '전면',
  rewarded: '리워드',
  native: '네이티브',
  playable: '플레이어블',
  app_open: '앱오픈',
};

export default function AdDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const ad = MOCK_ADS.find((a) => a.id === id);
  const category = ad ? getCategoryById(ad.category_id) : undefined;
  const isTrending = ad ? ad.view_count > 1000000 : false;

  // 관련 광고 (같은 카테고리)
  const relatedAds = MOCK_ADS.filter(
    (a) => a.category_id === ad?.category_id && a.id !== ad?.id
  ).slice(0, 4);

  const handleShare = async () => {
    if (!ad) return;
    try {
      await Share.share({
        message: `${ad.advertiser_name}의 광고를 확인해보세요!`,
        title: ad.advertiser_name,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleRelatedAdPress = (relatedAd: Ad) => {
    router.push(`/ad/${relatedAd.id}`);
  };

  if (!ad) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-gray-500 dark:text-gray-400">
          광고를 찾을 수 없습니다
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Custom Header */}
        <View
          className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-4"
          style={{ paddingTop: insets.top + 8 }}
        >
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
          >
            <ArrowLeft size={24} color="white" />
          </Pressable>
          <View className="flex-row gap-2">
            <Pressable className="w-10 h-10 bg-black/50 rounded-full items-center justify-center">
              <Heart size={20} color="white" />
            </Pressable>
            <Pressable
              onPress={handleShare}
              className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
            >
              <Share2 size={20} color="white" />
            </Pressable>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          {/* Hero Image */}
          <View style={{ aspectRatio: 16 / 9 }}>
            <Image
              source={{ uri: ad.creative_url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
            {isTrending && (
              <View className="absolute bottom-4 left-4 bg-red-500 px-3 py-1.5 rounded-full flex-row items-center gap-1.5">
                <TrendingUp size={14} color="white" />
                <Text className="text-white text-sm font-medium">트렌딩</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View className="px-4 py-6">
            {/* Title */}
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {ad.advertiser_name}
                </Text>
                <Text className="text-base text-gray-600 dark:text-gray-400">
                  {category?.name_ko || ad.category_id}
                </Text>
              </View>
              <Badge variant="secondary">
                {FORMAT_LABELS[ad.format] || ad.format}
              </Badge>
            </View>

            {/* Info Grid */}
            <View className="flex-row flex-wrap -mx-1.5 mb-6">
              <View className="w-1/2 p-1.5">
                <Card>
                  <CardContent className="p-3">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Tag size={16} color="#6B7280" />
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        카테고리
                      </Text>
                    </View>
                    <Text className="text-sm font-medium text-gray-900 dark:text-white">
                      {category?.name_ko || ad.category_id}
                    </Text>
                  </CardContent>
                </Card>
              </View>
              <View className="w-1/2 p-1.5">
                <Card>
                  <CardContent className="p-3">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Monitor size={16} color="#6B7280" />
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        광고 유형
                      </Text>
                    </View>
                    <Text className="text-sm font-medium text-gray-900 dark:text-white">
                      {FORMAT_LABELS[ad.format] || ad.format}
                    </Text>
                  </CardContent>
                </Card>
              </View>
              <View className="w-1/2 p-1.5">
                <Card>
                  <CardContent className="p-3">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Calendar size={16} color="#6B7280" />
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        수집일
                      </Text>
                    </View>
                    <Text className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(ad.collected_at).toLocaleDateString('ko-KR')}
                    </Text>
                  </CardContent>
                </Card>
              </View>
              <View className="w-1/2 p-1.5">
                <Card>
                  <CardContent className="p-3">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Eye size={16} color="#6B7280" />
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        조회수
                      </Text>
                    </View>
                    <Text className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatViewCount(ad.view_count)}
                    </Text>
                  </CardContent>
                </Card>
              </View>
            </View>

            {/* Stats Cards */}
            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <Eye size={20} color="#3B82F6" />
                  <Text className="text-sm text-blue-600 dark:text-blue-400">조회수</Text>
                </View>
                <Text className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatViewCount(ad.view_count)}
                </Text>
              </View>
              <View className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <TrendingUp size={20} color="#22C55E" />
                  <Text className="text-sm text-green-600 dark:text-green-400">참여율</Text>
                </View>
                <Text className="text-xl font-bold text-green-600 dark:text-green-400">
                  {((ad.view_count / 10000000) * 100).toFixed(1)}%
                </Text>
              </View>
            </View>

            {/* Description */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {ad.advertiser_name}의 {FORMAT_LABELS[ad.format] || ad.format} 광고입니다.
                  {category?.name_ko} 카테고리에 속하며, 현재까지 {formatViewCount(ad.view_count)}회
                  이상의 조회수를 기록하고 있습니다.
                </Text>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mb-8">
              <Pressable className="flex-1 bg-gray-100 dark:bg-gray-800 py-3 rounded-xl flex-row items-center justify-center gap-2 active:opacity-70">
                <Heart size={20} color="#6B7280" />
                <Text className="text-gray-700 dark:text-gray-300 font-medium">저장</Text>
              </Pressable>
              <Pressable
                onPress={handleShare}
                className="flex-1 bg-gray-100 dark:bg-gray-800 py-3 rounded-xl flex-row items-center justify-center gap-2 active:opacity-70"
              >
                <Share2 size={20} color="#6B7280" />
                <Text className="text-gray-700 dark:text-gray-300 font-medium">공유</Text>
              </Pressable>
              <Pressable className="flex-1 bg-blue-500 py-3 rounded-xl flex-row items-center justify-center gap-2 active:opacity-70">
                <ExternalLink size={20} color="white" />
                <Text className="text-white font-medium">링크</Text>
              </Pressable>
            </View>

            {/* Related Ads */}
            {relatedAds.length > 0 && (
              <View>
                <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  관련 광고
                </Text>
                <View className="flex-row flex-wrap -mx-1.5">
                  {relatedAds.map((relatedAd) => (
                    <View key={relatedAd.id} className="w-1/2 p-1.5">
                      <AdCard
                        ad={relatedAd}
                        onPress={() => handleRelatedAdPress(relatedAd)}
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}
