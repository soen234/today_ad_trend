import { View, Text, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState, useRef } from 'react';
import { FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { MockAd } from '@/lib/mockData';

interface CategoryTrendCardProps {
  category: string;
  ads: MockAd[];
  gradientColors: [string, string];
  onAdPress?: (ad: MockAd) => void;
}

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2;

export function CategoryTrendCard({
  category,
  ads,
  gradientColors,
  onAdPress,
}: CategoryTrendCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const goToNext = () => {
    if (currentIndex < ads.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  const currentAd = ads[currentIndex];

  if (!currentAd) return null;

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header with gradient */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-4"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-lg font-semibold">{category}</Text>
            <Text className="text-white/80 text-xs">{ads.length}개의 인기 광고</Text>
          </View>
          <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
            <TrendingUp size={20} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      {/* Image Carousel */}
      <View className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700">
        <Pressable onPress={() => onAdPress?.(currentAd)}>
          <Image
            source={{ uri: currentAd.imageUrl }}
            className="w-full h-full"
            contentFit="cover"
            transition={200}
          />
        </Pressable>

        {/* Navigation Buttons */}
        {ads.length > 1 && (
          <>
            <Pressable
              onPress={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full items-center justify-center"
              style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={20} color="#fff" />
            </Pressable>
            <Pressable
              onPress={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full items-center justify-center"
              style={{ opacity: currentIndex === ads.length - 1 ? 0.3 : 1 }}
              disabled={currentIndex === ads.length - 1}
            >
              <ChevronRight size={20} color="#fff" />
            </Pressable>
          </>
        )}

        {/* Indicators */}
        <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
          {ads.map((_, index) => (
            <View
              key={index}
              className={`h-1.5 rounded-full ${
                index === currentIndex
                  ? 'w-6 bg-white'
                  : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </View>
      </View>

      {/* Card Footer */}
      <View className="p-3">
        <Text className="text-base font-semibold text-gray-900 dark:text-white mb-1" numberOfLines={1}>
          {currentAd.title}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {currentAd.brand}
          </Text>
          <View className="flex-row items-center gap-1">
            <TrendingUp size={14} color="#22C55E" />
            <Text className="text-sm text-green-500">{currentAd.engagement}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
