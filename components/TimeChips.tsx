import { Pressable, Text, View } from 'react-native';
import { formatTime } from '@/lib/date';
import type { BriefTime } from '@/stores/prefsStore';

export const TIME_OPTIONS: BriefTime[] = [
  { hour: 6, minute: 30 },
  { hour: 7, minute: 0 },
  { hour: 7, minute: 30 },
  { hour: 8, minute: 0 },
  { hour: 8, minute: 30 },
  { hour: 9, minute: 0 },
  { hour: 12, minute: 0 },
  { hour: 18, minute: 0 },
];

interface TimeChipsProps {
  value: BriefTime;
  onChange: (time: BriefTime) => void;
}

export const TimeChips = ({ value, onChange }: TimeChipsProps) => (
  <View className="flex-row flex-wrap gap-2">
    {TIME_OPTIONS.map((t) => {
      const active = t.hour === value.hour && t.minute === value.minute;
      return (
        <Pressable
          key={`${t.hour}:${t.minute}`}
          onPress={() => onChange(t)}
          accessibilityRole="radio"
          accessibilityState={{ selected: active }}
          className={`px-4 py-2.5 rounded-xl border ${
            active ? 'bg-signal border-signal' : 'bg-white dark:bg-ink-800 border-gray-200 dark:border-ink-600'
          }`}
        >
          <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
            {formatTime(t.hour, t.minute)}
          </Text>
        </Pressable>
      );
    })}
  </View>
);
