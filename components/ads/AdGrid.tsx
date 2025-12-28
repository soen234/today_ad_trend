import { FlatList, View, Text, ActivityIndicator } from 'react-native';
import { Ad } from '@/types';
import { AdCard } from './AdCard';

interface AdGridProps {
  ads: Ad[];
  onAdPress?: (ad: Ad) => void;
  onEndReached?: () => void;
  isLoading?: boolean;
  isFetchingMore?: boolean;
  ListHeaderComponent?: React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
}

export function AdGrid({
  ads,
  onAdPress,
  onEndReached,
  isLoading,
  isFetchingMore,
  ListHeaderComponent,
  ListEmptyComponent,
}: AdGridProps) {
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-500 dark:text-gray-400">
          광고를 불러오는 중...
        </Text>
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: Ad; index: number }) => (
    <View
      className="flex-1 p-1.5"
      style={{ maxWidth: '50%' }}
    >
      <AdCard ad={item} onPress={() => onAdPress?.(item)} />
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  };

  return (
    <FlatList
      data={ads}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={{ padding: 8 }}
      columnWrapperStyle={{ gap: 0 }}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        ListEmptyComponent || (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 dark:text-gray-400">
              광고가 없습니다
            </Text>
          </View>
        )
      }
      ListFooterComponent={renderFooter}
    />
  );
}
