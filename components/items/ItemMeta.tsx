import { Text, View } from 'react-native';
import { relativeTime } from '@/lib/date';
import { sectionMeta } from '@/lib/config';
import type { Item } from '@/types';

interface ItemMetaProps {
  item: Item;
  showSection?: boolean;
}

export const ItemMeta = ({ item, showSection = true }: ItemMetaProps) => {
  const section = sectionMeta(item.section);
  return (
    <View className="flex-row items-center flex-wrap">
      {showSection ? (
        <View className="flex-row items-center mr-2">
          <View className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: section.color }} />
          <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: section.color }}>
            {section.label}
          </Text>
        </View>
      ) : null}
      <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
        {item.source} · {relativeTime(item.publishedAt)}
      </Text>
    </View>
  );
};
