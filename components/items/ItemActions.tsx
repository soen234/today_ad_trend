import { useCallback } from 'react';
import { AccessibilityActionEvent, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Bookmark, BookmarkCheck, Share2 } from 'lucide-react-native';
import { COLORS } from '@/lib/config';
import { shareItem } from '@/lib/open';
import { useIsSaved, usePrefs } from '@/stores/prefsStore';
import type { Item } from '@/types';

// 카드 전체가 하나의 접근성 요소라 VoiceOver가 안쪽 버튼에 닿지 못한다.
// 그래서 카드에 저장/공유를 접근성 액션으로도 붙인다.
export const useItemA11yActions = (item: Item) => {
  const saved = useIsSaved(item.id);
  const toggleSaved = usePrefs((s) => s.toggleSaved);
  const onAccessibilityAction = useCallback(
    (e: AccessibilityActionEvent) => {
      if (e.nativeEvent.actionName === 'save') toggleSaved(item);
      if (e.nativeEvent.actionName === 'share') shareItem(item).catch(() => undefined);
    },
    [item, toggleSaved]
  );
  return {
    accessibilityActions: [
      { name: 'save', label: saved ? 'Remove from saved' : 'Save' },
      { name: 'share', label: 'Share' },
    ],
    onAccessibilityAction,
  };
};

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
        accessibilityRole="button"
        accessibilityLabel="Share"
        className="p-1.5 mr-1"
      >
        <Share2 size={18} color={COLORS.muted} />
      </Pressable>
      <Pressable
        onPress={onSave}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={saved ? 'Remove from saved' : 'Save'}
        accessibilityState={{ selected: saved }}
        className="p-1.5"
      >
        {saved ? <BookmarkCheck size={20} color={COLORS.signal} /> : <Bookmark size={20} color={COLORS.muted} />}
      </Pressable>
    </View>
  );
};
