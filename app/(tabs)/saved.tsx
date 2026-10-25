import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bookmark, Eye, Plus, X } from 'lucide-react-native';
import { FeedRow } from '@/components/items/FeedRow';
import { SegmentedControl } from '@/components/SegmentedControl';
import { MessageState, SkeletonList } from '@/components/StateViews';
import { useAllFeedItems } from '@/hooks/useBriefData';
import { COLORS } from '@/lib/config';
import { matchedKeywords } from '@/lib/watchlist';
import { usePrefs } from '@/stores/prefsStore';

type Tab = 'saved' | 'watchlist';

const SUGGESTIONS = ['Meta', 'TikTok', 'Performance Max', 'AdAttributionKit', 'Temu', 'CTV'];

const SavedList = () => {
  const insets = useSafeAreaInsets();
  const role = usePrefs((s) => s.role);
  const saved = usePrefs((s) => s.saved);

  return (
    <FlatList
      data={saved}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <FeedRow item={item} role={role} showSection />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 24 }}
      ListEmptyComponent={
        <MessageState
          icon={<Bookmark size={40} color={COLORS.muted} />}
          title="Your swipe file is empty"
          body="Tap the bookmark on any story or update to keep it here."
        />
      }
    />
  );
};

const WatchlistView = () => {
  const insets = useSafeAreaInsets();
  const role = usePrefs((s) => s.role);
  const watchlist = usePrefs((s) => s.watchlist);
  const addWatch = usePrefs((s) => s.addWatch);
  const removeWatch = usePrefs((s) => s.removeWatch);
  const [draft, setDraft] = useState('');
  const { items, isLoading } = useAllFeedItems();

  const matches = useMemo(
    () =>
      items
        .map((item) => ({ item, keys: matchedKeywords(item, watchlist) }))
        .filter((m) => m.keys.length > 0),
    [items, watchlist]
  );

  const submit = (value: string) => {
    if (addWatch(value)) setDraft('');
  };

  const header = (
    <View className="mb-3">
      <Text className="text-sm leading-5 text-gray-600 dark:text-gray-300 mb-3">
        Follow brands, platforms or topics. Matching stories from the last two weeks show up here and get a badge in Explore.
      </Text>
      <View className="flex-row items-center bg-white dark:bg-ink-800 rounded-xl border border-gray-200 dark:border-ink-600 pl-3">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => submit(draft)}
          placeholder="Add a brand, platform or topic"
          placeholderTextColor={COLORS.muted}
          returnKeyType="done"
          autoCapitalize="none"
          maxLength={40}
          className="flex-1 h-11 text-base text-gray-900 dark:text-white"
        />
        <Pressable onPress={() => submit(draft)} accessibilityLabel="Add keyword" className="h-11 w-11 items-center justify-center">
          <Plus size={20} color={COLORS.signal} />
        </Pressable>
      </View>
      <View className="flex-row flex-wrap mt-3" style={{ gap: 8 }}>
        {watchlist.map((k) => (
          <Pressable
            key={k}
            onPress={() => removeWatch(k)}
            accessibilityLabel={`Remove ${k}`}
            className="flex-row items-center bg-signal-50 dark:bg-signal-700/30 rounded-full pl-3 pr-2 py-1.5"
          >
            <Text className="text-sm font-medium text-signal-700 dark:text-signal-100 mr-1">{k}</Text>
            <X size={14} color={COLORS.signal} />
          </Pressable>
        ))}
        {watchlist.length === 0
          ? SUGGESTIONS.map((k) => (
              <Pressable
                key={k}
                onPress={() => submit(k)}
                className="flex-row items-center rounded-full px-3 py-1.5 border border-dashed border-gray-300 dark:border-ink-600"
              >
                <Plus size={12} color={COLORS.muted} />
                <Text className="text-sm text-gray-600 dark:text-gray-300 ml-1">{k}</Text>
              </Pressable>
            ))
          : null}
      </View>
      {watchlist.length > 0 ? (
        <Text className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mt-5">
          {matches.length} matching {matches.length === 1 ? 'story' : 'stories'}
        </Text>
      ) : null}
    </View>
  );

  return (
    <FlatList
      data={watchlist.length > 0 ? matches : []}
      keyExtractor={(m) => m.item.id}
      renderItem={({ item: m }) => <FeedRow item={m.item} role={role} watchMatches={m.keys} showSection />}
      ListHeaderComponent={header}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 24 }}
      ListEmptyComponent={
        watchlist.length === 0 ? null : isLoading ? (
          <SkeletonList count={2} />
        ) : (
          <MessageState
            icon={<Eye size={40} color={COLORS.muted} />}
            title="No matches yet"
            body="We'll surface new stories here as soon as they mention what you follow."
          />
        )
      }
    />
  );
};

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('saved');

  return (
    <View className="flex-1 bg-[#F5F7FA] dark:bg-ink-950" style={{ paddingTop: insets.top }}>
      <View className="px-4 pt-3 pb-3 border-b border-gray-200 dark:border-ink-800">
        <Text className="text-[26px] font-extrabold text-gray-900 dark:text-white mb-3">Saved</Text>
        <SegmentedControl
          options={[
            { key: 'saved', label: 'Swipe file' },
            { key: 'watchlist', label: 'Watchlist' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>
      {tab === 'saved' ? <SavedList /> : <WatchlistView />}
    </View>
  );
}
