import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Bookmark, BookmarkCheck, Share2 } from 'lucide-react-native';
import { COLORS } from '@/lib/config';
import { shareItem } from '@/lib/open';
import { useIsSaved, usePrefs } from '@/stores/prefsStore';
import type { Item } from '@/types';

interface ItemActionsProps {
  item: Item;
}

export const ItemActions = ({ item }: ItemActionsProps) => {
  const saved = useIsSaved(item.id);
  const toggleSaved = usePrefs((s) => s.toggleSaved);

  const onSave = () => {
    Haptics.selectionAsync().catch(() => undefined);
    toggleSaved(item);
  };

  return (
    <View className="flex-row items-center">
      <Pressable
        onPress={() => shareItem(item).catch(() => undefined)}
        hitSlop={8}
        accessibilityLabel="Share"
        className="p-1.5 mr-1"
      >
        <Share2 size={18} color={COLORS.muted} />
      </Pressable>
      <Pressable
        onPress={onSave}
        hitSlop={8}
        accessibilityLabel={saved ? 'Remove from saved' : 'Save'}
        accessibilityState={{ selected: saved }}
        className="p-1.5"
      >
        {saved ? <BookmarkCheck size={20} color={COLORS.signal} /> : <Bookmark size={20} color={COLORS.muted} />}
      </Pressable>
    </View>
  );
};
