import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CloudOff, Inbox } from 'lucide-react-native';
import { COLORS } from '@/lib/config';

export const SkeletonCard = () => (
  <View className="bg-white dark:bg-ink-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-ink-700">
    <View className="h-3 w-24 rounded bg-gray-200 dark:bg-ink-700 mb-3" />
    <View className="h-4 w-full rounded bg-gray-200 dark:bg-ink-700 mb-2" />
    <View className="h-4 w-3/4 rounded bg-gray-200 dark:bg-ink-700 mb-4" />
    <View className="h-12 w-full rounded-xl bg-gray-100 dark:bg-ink-700" />
  </View>
);

interface SkeletonListProps {
  count?: number;
}

export const SkeletonList = ({ count = 3 }: SkeletonListProps) => (
  <View>
    {Array.from({ length: count }, (_, i) => (
      <SkeletonCard key={i} />
    ))}
  </View>
);

interface MessageStateProps {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export const MessageState = ({ title, body, actionLabel, onAction, icon }: MessageStateProps) => (
  <View className="items-center justify-center py-14 px-6">
    {icon ?? <Inbox size={40} color={COLORS.muted} />}
    <Text className="text-base font-semibold text-gray-900 dark:text-white mt-4 text-center">{title}</Text>
    {body ? <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center leading-5">{body}</Text> : null}
    {actionLabel && onAction ? (
      <Pressable onPress={onAction} accessibilityRole="button" className="mt-5 px-5 py-2.5 rounded-full bg-ink dark:bg-white">
        <Text className="text-sm font-semibold text-white dark:text-ink">{actionLabel}</Text>
      </Pressable>
    ) : null}
  </View>
);

interface OfflineStateProps {
  onRetry: () => void;
}

export const OfflineState = ({ onRetry }: OfflineStateProps) => (
  <MessageState
    icon={<CloudOff size={40} color={COLORS.muted} />}
    title="Can't reach the brief right now"
    body="Check your connection and try again."
    actionLabel="Try again"
    onAction={onRetry}
  />
);
