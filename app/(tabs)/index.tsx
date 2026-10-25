import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsRestoring } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { CloudOff, Clock, Flame } from 'lucide-react-native';
import { BrandMark } from '@/components/BrandMark';
import { BriefCard } from '@/components/brief/BriefCard';
import { DoneCard } from '@/components/brief/DoneCard';
import { MessageState, OfflineState, SkeletonList } from '@/components/StateViews';
import { useEdition } from '@/hooks/useBriefData';
import { useTodayKey } from '@/hooks/useTodayKey';
import { COLORS, roleMeta } from '@/lib/config';
import { formatEditionDate, formatTime, relativeTime } from '@/lib/date';
import { openUrl } from '@/lib/open';
import { currentStreak } from '@/lib/streak';
import { usePrefs } from '@/stores/prefsStore';
import type { Item } from '@/types';

const EMPTY: string[] = [];

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const today = useTodayKey();
  const restoring = useIsRestoring();
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
  // 에디션 날짜가 오늘(기기 시간대)보다 이전이면 아직 오늘 브리핑이 나오지 않은 것
  const stale = data ? data.date < today : false;
  const done = !stale && total > 0 && readCount === total;
  const streakCount = currentStreak(streak, today);

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
    const next = await latest.refetch();
    // 새 latest에 이 역할의 에디션이 있을 때만 에디션을 다시 받는다 (경로가 바뀌면 쿼리 키가 바뀌어 자동으로 받음)
    if (next.data?.editions[role]) await edition.refetch();
    setRefreshing(false);
  };

  const pending = restoring || latest.isPending || (hasEdition && edition.isPending);
  const failed = !data && (latest.isError || (hasEdition && edition.isError));
  const offlineWithCache = !!data && latest.isError;

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
              <Text className="text-lg font-extrabold text-gray-900 dark:text-white">{formatEditionDate(today)}</Text>
            </View>
          </View>
          <View
            accessible
            accessibilityLabel={`${streakCount} day streak`}
            className="flex-row items-center rounded-full px-3 py-1.5 bg-white dark:bg-ink-800 border border-gray-200 dark:border-ink-700"
          >
            <Flame size={16} color={streakCount > 0 ? COLORS.amber : COLORS.muted} />
            <Text className="text-sm font-bold text-gray-900 dark:text-white ml-1">{streakCount}</Text>
          </View>
        </View>

        {pending && !data ? <SkeletonList count={3} /> : null}

        {!pending && failed ? <OfflineState onRetry={onRefresh} /> : null}

        {!pending && !failed && !hasEdition ? (
          <MessageState
            title="Your first brief is on its way"
            body="We publish a new brief every day. Meanwhile, the latest stories are in Explore."
            actionLabel="Open Explore"
            onAction={() => router.navigate('/explore')}
          />
        ) : null}

        {data ? (
          <>
            {offlineWithCache ? (
              <View className="flex-row items-center rounded-xl px-3 py-2.5 mb-3 bg-gray-100 dark:bg-ink-800">
                <CloudOff size={16} color={COLORS.muted} />
                <Text className="text-xs text-gray-600 dark:text-gray-300 ml-2 flex-1">
                  You're offline. Showing the last brief we saved.
                </Text>
              </View>
            ) : null}

            {stale ? (
              <View className="flex-row items-center rounded-xl px-3 py-2.5 mb-3 bg-amber-50 dark:bg-amber-500/10">
                <Clock size={16} color={COLORS.amber} />
                <Text className="text-xs text-gray-700 dark:text-amber-50 ml-2 flex-1">
                  Today's brief isn't out yet. Here's the latest one, from {formatEditionDate(data.date)}.
                </Text>
              </View>
            ) : null}

            <View className="rounded-2xl p-4 mb-4 bg-white dark:bg-ink-800 border border-gray-100 dark:border-ink-700">
              <Pressable
                onPress={() => router.navigate('/settings')}
                accessibilityRole="button"
                accessibilityHint="Change your role in Settings"
              >
                <Text className="text-xs font-bold uppercase tracking-wide text-signal-600 dark:text-signal">
                  {roleMeta(role).short} brief · {total} items · ~3 min
                </Text>
              </Pressable>
              <Text className="text-[22px] leading-7 font-extrabold text-gray-900 dark:text-white mt-1.5">{data.headline}</Text>
              <View className="h-1.5 rounded-full bg-gray-100 dark:bg-ink-700 mt-4 overflow-hidden">
                <View className="h-1.5 rounded-full bg-signal" style={{ width: total ? `${(readCount / total) * 100}%` : '0%' }} />
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
