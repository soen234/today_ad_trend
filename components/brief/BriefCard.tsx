import { Pressable, Text, View } from 'react-native';
import { CheckCircle2, Lightbulb } from 'lucide-react-native';
import { ItemActions, useItemA11yActions } from '@/components/items/ItemActions';
import { ItemMeta } from '@/components/items/ItemMeta';
import { COLORS } from '@/lib/config';
import type { Item, Role } from '@/types';

interface BriefCardProps {
  item: Item;
  index: number;
  role: Role;
  read: boolean;
  onOpen: (item: Item) => void;
}

export const BriefCard = ({ item, index, role, read, onOpen }: BriefCardProps) => {
  const soWhat = item.roles[role]?.soWhat;
  const a11y = useItemA11yActions(item);

  return (
    <Pressable
      onPress={() => onOpen(item)}
      accessibilityRole="link"
      accessibilityHint="Opens the original article"
      accessibilityActions={a11y.accessibilityActions}
      onAccessibilityAction={a11y.onAccessibilityAction}
      className={`bg-white dark:bg-ink-800 rounded-2xl p-4 mb-3 border ${
        read ? 'border-gray-100 dark:border-ink-700' : 'border-gray-200 dark:border-ink-600'
      }`}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center flex-1 pr-2">
          {read ? (
            <CheckCircle2 size={18} color={COLORS.signal} />
          ) : (
            <View className="w-[18px] h-[18px] rounded-full bg-ink dark:bg-white items-center justify-center">
              <Text className="text-[10px] font-bold text-white dark:text-ink">{index + 1}</Text>
            </View>
          )}
          <View className="ml-2 flex-1">
            <ItemMeta item={item} />
          </View>
        </View>
        <ItemActions item={item} />
      </View>

      <Text
        className={`text-[17px] leading-6 font-bold ${read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}
      >
        {item.title}
      </Text>
      <Text className="text-sm leading-5 text-gray-600 dark:text-gray-300 mt-1.5">{item.summary}</Text>

      {soWhat ? (
        <View className="flex-row mt-3 rounded-xl px-3 py-2.5 bg-amber-50 dark:bg-amber-500/10">
          <Lightbulb size={16} color={COLORS.amber} style={{ marginTop: 2 }} />
          <View className="flex-1 ml-2">
            <Text className="text-[11px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              So what for you
            </Text>
            <Text className="text-sm leading-5 text-gray-800 dark:text-amber-50 mt-0.5">{soWhat}</Text>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
};
