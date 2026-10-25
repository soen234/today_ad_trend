import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsRestoring } from '@tanstack/react-query';
import { InFeedAd } from '@/components/ads/InFeedAd';
import { FeedRow } from '@/components/items/FeedRow';
import { PulseView } from '@/components/pulse/PulseView';
import { SegmentedControl } from '@/components/SegmentedControl';
import { MessageState, OfflineState, SkeletonList } from '@/components/StateViews';
import { useFeed, usePulse } from '@/hooks/useBriefData';
import { COLORS, SECTIONS } from '@/lib/config';
import { compileWatchlist, matchCompiled } from '@/lib/watchlist';
import { usePrefs } from '@/stores/prefsStore';
import type { Item, Section } from '@/types';

type TextSection = Exclude<Section, 'creative'>;
type Row = { kind: 'item'; item: Item } | { kind: 'ad'; key: string };

const AD_EVERY = 8;

const withAds = (items: Item[]): Row[] => {
  const rows: Row[] = [];
  items.forEach((item, i) => {
    rows.push({ kind: 'item', item });
    if ((i + 1) % AD_EVERY === 0 && i + 1 < items.length) rows.push({ kind: 'ad', key: `ad-${i}` });
  });
  return rows;
};

interface FeedListProps {
  section: TextSection;
}

const FeedList = ({ section }: FeedListProps) => {
  const insets = useSafeAreaInsets();
  const restoring = useIsRestoring();
  const role = usePrefs((s) => s.role);
  const watchlist = usePrefs((s) => s.watchlist);
  const compiled = useMemo(() => compileWatchlist(watchlist), [watchlist]);
  const { latest, feed, hasFeed } = useFeed(section);
  const [refreshing, setRefreshing] = useState(false);
  const rows = useMemo(() => withAds(feed.data?.items ?? []), [feed.data]);

  const onRefresh = async () => {
    setRefreshing(true);
    const next = await latest.refetch();
    if (next.data?.feeds[section]) await feed.refetch();
    setRefreshing(false);
  };

  const renderItem = useCallback(
    ({ item: row }: { item: Row }) =>
      row.kind === 'ad' ? <InFeedAd /> : <FeedRow item={row.item} role={role} watchMatches={matchCompiled(row.item, compiled)} />,
    [role, compiled]
  );

  if ((restoring || latest.isPending || (hasFeed && feed.isPending)) && !feed.data) {
    return (
      <View className="px-4 pt-3">
        <SkeletonList count={4} />
      </View>
    );
  }
  if (!feed.data && (latest.isError || (hasFeed && feed.isError))) return <OfflineState onRetry={onRefresh} />;

  return (
    <FlatList
      data={rows}
      keyExtractor={(row) => (row.kind === 'ad' ? row.key : row.item.id)}
      renderItem={renderItem}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 24 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.signal} />}
      ListEmptyComponent={<MessageState title="Nothing new here yet" body="Pull to refresh, or check back later today." />}
      initialNumToRender={8}
      windowSize={7}
    />
  );
};

const PulseTab = () => {
  const insets = useSafeAreaInsets();
  const restoring = useIsRestoring();
  const { latest, pulse, hasPulse } = usePulse();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    const next = await latest.refetch();
    if (next.data?.pulse) await pulse.refetch();
    setRefreshing(false);
  };

  const pending = restoring || latest.isPending || (hasPulse && pulse.isPending);
  const failed = !pulse.data && (latest.isError || (hasPulse && pulse.isError));

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 24 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.signal} />}
    >
      {pending && !pulse.data ? <SkeletonList count={2} /> : null}
      {!pending && failed ? <OfflineState onRetry={onRefresh} /> : null}
      {!pending && !failed && !hasPulse ? (
        <MessageState title="This week's Creative Pulse is being prepared" body="It updates every Monday." />
      ) : null}
      {pulse.data ? <PulseView pulse={pulse.data} /> : null}
    </ScrollView>
  );
};

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [section, setSection] = useState<Section>('news');

  return (
    <View className="flex-1 bg-[#F5F7FA] dark:bg-ink-950" style={{ paddingTop: insets.top }}>
      <View className="px-4 pt-3 pb-3 bg-[#F5F7FA] dark:bg-ink-950 border-b border-gray-200 dark:border-ink-800">
        <Text className="text-[26px] font-extrabold text-gray-900 dark:text-white mb-3" accessibilityRole="header">
          Explore
        </Text>
        <SegmentedControl options={SECTIONS.map((s) => ({ key: s.key, label: s.label }))} value={section} onChange={setSection} />
      </View>
      {section === 'creative' ? <PulseTab /> : <FeedList key={section} section={section} />}
    </View>
  );
}
