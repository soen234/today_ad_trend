import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Eye } from 'lucide-react-native';
import { ItemActions } from '@/components/items/ItemActions';
import { ItemMeta } from '@/components/items/ItemMeta';
import { COLORS } from '@/lib/config';
import { openUrl } from '@/lib/open';
import type { Item, Role } from '@/types';

interface FeedRowProps {
  item: Item;
  role: Role;
  watchMatches?: string[];
  showSection?: boolean;
}

const FeedRowBase = ({ item, role, watchMatches = [], showSection = false }: FeedRowProps) => {
  const take = item.roles[role];
  const showTake = take && take.relevance >= 2 && take.soWhat;

  return (
    <Pressable
      onPress={() => openUrl(item.url).catch(() => undefined)}
      accessibilityRole="link"
      className="bg-white dark:bg-ink-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-ink-700"
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <ItemMeta item={item} showSection={showSection} />
        </View>
        <ItemActions item={item} />
      </View>
      <Text className="text-base leading-[22px] font-semibold text-gray-900 dark:text-white mt-1.5">{item.title}</Text>
      <Text className="text-sm leading-5 text-gray-600 dark:text-gray-300 mt-1" numberOfLines={3}>
        {item.summary}
      </Text>
      {showTake ? (
        <Text className="text-[13px] leading-5 text-amber-700 dark:text-amber-400 mt-2">
          <Text className="font-bold">So what: </Text>
          {take.soWhat}
        </Text>
      ) : null}
      {watchMatches.length > 0 ? (
        <View className="flex-row flex-wrap mt-2.5">
          {watchMatches.map((k) => (
            <View key={k} className="flex-row items-center bg-signal-50 dark:bg-signal-700/30 rounded-full px-2 py-0.5 mr-1.5">
              <Eye size={12} color={COLORS.signal} />
              <Text className="text-xs font-medium text-signal-700 dark:text-signal-100 ml-1">{k}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
};

export const FeedRow = memo(FeedRowBase);
