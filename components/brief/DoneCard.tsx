import { Pressable, Text, View } from 'react-native';
import { Flame, PartyPopper } from 'lucide-react-native';
import { COLORS } from '@/lib/config';

interface DoneCardProps {
  streak: number;
  nextBriefLabel: string | null;
  onExplore: () => void;
}

export const DoneCard = ({ streak, nextBriefLabel, onExplore }: DoneCardProps) => (
  <View className="rounded-2xl p-5 mb-3 bg-ink dark:bg-ink-800 border border-ink-700">
    <View className="flex-row items-center">
      <PartyPopper size={22} color={COLORS.amber} />
      <Text className="text-lg font-bold text-white ml-2">You're done for today</Text>
    </View>
    <Text className="text-sm leading-5 text-gray-300 mt-2">
      That's everything worth your attention today.
      {nextBriefLabel ? ` Your next brief arrives at ${nextBriefLabel}.` : ' Come back tomorrow for the next brief.'}
    </Text>
    <View className="flex-row items-center justify-between mt-4">
      <View className="flex-row items-center bg-ink-700 rounded-full px-3 py-1.5">
        <Flame size={16} color={COLORS.amber} />
        <Text className="text-sm font-semibold text-white ml-1.5">
          {streak} day{streak === 1 ? '' : 's'} streak
        </Text>
      </View>
      <Pressable onPress={onExplore} accessibilityRole="button" className="px-4 py-2 rounded-full bg-signal">
        <Text className="text-sm font-semibold text-white">Explore more</Text>
      </Pressable>
    </View>
  </View>
);
