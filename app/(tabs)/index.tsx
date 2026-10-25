import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Flame } from 'lucide-react-native';
import { BrandMark } from '@/components/BrandMark';
import { BriefCard } from '@/components/brief/BriefCard';
import { DoneCard } from '@/components/brief/DoneCard';
import { MessageState, OfflineState, SkeletonList } from '@/components/StateViews';
import { useEdition } from '@/hooks/useBriefData';
import { COLORS, roleMeta } from '@/lib/config';
import { formatEditionDate, formatTime, localDateKey, relativeTime } from '@/lib/date';
import { openUrl } from '@/lib/open';
import { currentStreak } from '@/lib/streak';
import { usePrefs } from '@/stores/prefsStore';
import type { Item } from '@/types';

const EMPTY: string[] = [];

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const role = usePrefs((s) => s.role);
  const streak = usePrefs((s) => s.streak);
  const briefTime = usePrefs((s) => s.briefTime);
  const remindersEnabled = usePrefs((s) => s.remindersEnabled);
  const markRead = usePrefs((s) => s.markRead);
  const { latest, edition, hasEdition } = useEdition(role);
  const [refreshing, setRefreshing] = useState(false);

  const data = edition.data;
  const readIds = usePrefs((s) => (data ? s.readByEdition[data.date] ?? EMPTY : EMPTY));
  const readCount = useMemo(() => (data ? data.items.filter((i) => readIds.includes(i.id)).length : 0), [data, readIds]);
  const total = data?.items.length ?? 0;
  const done = total > 0 && readCount === total;
  const streakCount = currentStreak(streak);

  const onOpen = useCallback(
    (item: Item) => {
      if (data) markRead(data.date, item.id);
      openUrl(item.url).catch(() => undefined);
    },
    [data, markRead]
  );

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.selectionAsync().catch(() => undefined);
    await latest.refetch();
    await edition.refetch();
    setRefreshing(false);
  };

  const loading = latest.isLoading || (hasEdition && edition.isLoading);
  const failed = !data && (latest.isError || edition.isError);

  return (
    <View className="flex-1 bg-[#F5F7FA] dark:bg-ink-950" style={{ paddingTop: insets.top }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.signal} />}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <BrandMark size={28} />
            <View className="ml-2.5">
              <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400">Today Ad Trend</Text>
              <Text className="text-lg font-extrabold text-gray-900 dark:text-white">{formatEditionDate(localDateKey())}</Text>
            </View>
          </View>
          <View
            className="flex-row items-center rounded-full px-3 py-1.5 bg-white dark:bg-ink-800 border border-gray-200 dark:border-ink-700"
            accessibilityLabel={`${streakCount} day streak`}
          >
            <Flame size={16} color={streakCount > 0 ? COLORS.amber : COLORS.muted} />
            <Text className="text-sm font-bold text-gray-900 dark:text-white ml-1">{streakCount}</Text>
          </View>
        </View>

        {loading && !data ? <SkeletonList count={3} /> : null}

        {failed ? <OfflineState onRetry={onRefresh} /> : null}

        {!loading && !failed && !hasEdition ? (
          <MessageState
            title="Your first brief is on its way"
            body="We publish a new brief every day. Meanwhile, the latest stories are in Explore."
            actionLabel="Open Explore"
            onAction={() => router.navigate('/explore')}
          />
        ) : null}

        {data ? (
          <>
            <View className="rounded-2xl p-4 mb-4 bg-white dark:bg-ink-800 border border-gray-100 dark:border-ink-700">
              <Pressable onPress={() => router.navigate('/settings')} accessibilityHint="Change your role in Settings">
                <Text className="text-xs font-bold uppercase tracking-wide text-signal-600 dark:text-signal">
                  {roleMeta(role).short} brief · {total} items · ~3 min
                </Text>
              </Pressable>
              <Text className="text-[22px] leading-7 font-extrabold text-gray-900 dark:text-white mt-1.5">{data.headline}</Text>
              <View className="h-1.5 rounded-full bg-gray-100 dark:bg-ink-700 mt-4 overflow-hidden">
                <View
                  className="h-1.5 rounded-full bg-signal"
                  style={{ width: total ? `${(readCount / total) * 100}%` : '0%' }}
                />
              </View>
              <View className="flex-row justify-between mt-2">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {readCount} of {total} read
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">Updated {relativeTime(data.generatedAt)}</Text>
              </View>
            </View>

            {done ? (
              <DoneCard
                streak={streakCount}
                nextBriefLabel={remindersEnabled ? formatTime(briefTime.hour, briefTime.minute) : null}
                onExplore={() => router.navigate('/explore')}
              />
            ) : null}

            {data.items.map((item, index) => (
              <BriefCard key={item.id} item={item} index={index} role={role} read={readIds.includes(item.id)} onOpen={onOpen} />
            ))}

            <Text className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2 px-6 leading-[18px]">
              Summaries and "so what" notes are AI-generated from the linked sources. Tap any item to read the original.
            </Text>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
