import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react-native';
import { Ad } from '@/types';
import { formatViewCount } from '@/lib/mock';

interface CategoryTrendCarouselProps {
  category: string;
  ads: Ad[];
  color: string;
  onAdPress: (ad: Ad) => void;
}

export function CategoryTrendCarousel({
  category,
  ads,
  color,
  onAdPress,
}: CategoryTrendCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (ads.length === 0) return null;

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const currentAd = ads[currentIndex];

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with color background */}
      <View className={`${color} p-3`}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white font-semibold text-base">{category}</Text>
            <Text className="text-white/80 text-xs">{ads.length}개의 인기 광고</Text>
          </View>
          <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
            <TrendingUp size={16} color="white" />
          </View>
        </View>
      </View>

      {/* Carousel Content */}
      <Pressable
        onPress={() => onAdPress(currentAd)}
        style={{ aspectRatio: 4 / 3 }}
        className="relative bg-gray-100 dark:bg-gray-900"
      >
        <Image
          source={{ uri: currentAd.creative_url }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={300}
        />

        {/* Navigation Buttons */}
        {ads.length > 1 && (
          <>
            <Pressable
              onPress={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full items-center justify-center active:bg-black/70"
            >
              <ChevronLeft size={20} color="white" />
            </Pressable>
            <Pressable
              onPress={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full items-center justify-center active:bg-black/70"
            >
              <ChevronRight size={20} color="white" />
            </Pressable>
          </>
        )}

        {/* Indicators */}
        <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
          {ads.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full ${
                index === currentIndex
                  ? 'w-6 bg-white'
                  : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </View>
      </Pressable>

      {/* Card Footer */}
      <View className="p-3">
        <Text
          className="text-base font-medium text-gray-900 dark:text-white mb-1"
          numberOfLines={1}
        >
          {currentAd.advertiser_name}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            조회수 {formatViewCount(currentAd.view_count)}
          </Text>
          <View className="flex-row items-center gap-1">
            <TrendingUp size={14} color="#22C55E" />
            <Text className="text-sm text-green-600">
              {((currentAd.view_count / 10000000) * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
