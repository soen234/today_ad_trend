import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Gamepad2,
  ShoppingCart,
  Wallet,
  Heart,
  Utensils,
  Plane,
  Film,
  GraduationCap,
  Home,
  Sparkles,
  Smartphone,
  Shirt,
} from 'lucide-react-native';
import { MOCK_ADS, MOCK_CATEGORIES } from '@/lib/mock';
import { Card } from '@/components/ui/Card';

const iconMap: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  Gamepad2,
  ShoppingCart,
  Wallet,
  Heart,
  Utensils,
  Plane,
  Film,
  GraduationCap,
  Home,
  Sparkles,
  Smartphone,
  Shirt,
};

const colorMap: Record<string, { bg: string; icon: string }> = {
  games: { bg: 'bg-red-100 dark:bg-red-900/30', icon: '#EF4444' },
  shopping: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: '#F97316' },
  finance: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: '#EAB308' },
  health: { bg: 'bg-rose-100 dark:bg-rose-900/30', icon: '#F43F5E' },
  food: { bg: 'bg-green-100 dark:bg-green-900/30', icon: '#22C55E' },
  travel: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', icon: '#06B6D4' },
  entertainment: { bg: 'bg-violet-100 dark:bg-violet-900/30', icon: '#8B5CF6' },
  education: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: '#3B82F6' },
  lifestyle: { bg: 'bg-amber-100 dark:bg-amber-900/30', icon: '#D97706' },
  beauty: { bg: 'bg-pink-100 dark:bg-pink-900/30', icon: '#EC4899' },
  tech: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', icon: '#6366F1' },
  fashion: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: '#A855F7' },
};

export default function CategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const getCategoryCount = (categoryId: string) => {
    return MOCK_ADS.filter((ad) => ad.category_id === categoryId).length;
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/category/${categoryId}`);
  };

  // 인기 카테고리 (광고 수 기준)
  const popularCategories = MOCK_CATEGORIES
    .map((cat) => ({
      ...cat,
      count: getCategoryCount(cat.id),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            카테고리
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            관심 있는 광고 카테고리를 선택하세요
          </Text>
        </View>

        {/* Category Grid */}
        <View className="flex-row flex-wrap -mx-1.5">
          {MOCK_CATEGORIES.map((category) => {
            const Icon = iconMap[category.icon_name] || Sparkles;
            const colors = colorMap[category.id] || {
              bg: 'bg-gray-100 dark:bg-gray-800',
              icon: '#6B7280',
            };
            const count = getCategoryCount(category.id);

            return (
              <Pressable
                key={category.id}
                onPress={() => handleCategoryPress(category.id)}
                className="w-1/3 p-1.5"
              >
                <Card className={`${colors.bg} border-0 p-4 items-center active:scale-95 transition-transform`}>
                  <View className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 items-center justify-center mb-3">
                    <Icon size={24} color={colors.icon} />
                  </View>
                  <Text
                    className="text-sm font-medium text-gray-900 dark:text-white text-center mb-1"
                    numberOfLines={1}
                  >
                    {category.name_ko}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {count}개
                  </Text>
                </Card>
              </Pressable>
            );
          })}
        </View>

        {/* Popular Categories Section */}
        <View className="mt-8">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            인기 카테고리
          </Text>
          <View className="gap-3">
            {popularCategories.map((category) => {
              const Icon = iconMap[category.icon_name] || Sparkles;
              const colors = colorMap[category.id] || {
                bg: 'bg-gray-100',
                icon: '#6B7280',
              };

              return (
                <Pressable
                  key={category.id}
                  onPress={() => handleCategoryPress(category.id)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 flex-row items-center border border-gray-200 dark:border-gray-700 active:opacity-80"
                >
                  <View
                    className={`w-12 h-12 rounded-xl ${colors.bg} items-center justify-center mr-4`}
                  >
                    <Icon size={24} color={colors.icon} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900 dark:text-white">
                      {category.name_ko}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {category.count}개의 광고
                    </Text>
                  </View>
                  <Text className="text-sm text-blue-500 font-medium">보기</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
