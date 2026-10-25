import { Pressable, ScrollView, Text } from 'react-native';

interface SegmentedControlProps<T extends string> {
  options: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
}

export const SegmentedControl = <T extends string>({ options, value, onChange }: SegmentedControlProps<T>) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
    {options.map((opt) => {
      const active = opt.key === value;
      return (
        <Pressable
          key={opt.key}
          onPress={() => onChange(opt.key)}
          accessibilityRole="tab"
          accessibilityState={{ selected: active }}
          className={`px-4 py-2 rounded-full ${active ? 'bg-ink dark:bg-white' : 'bg-gray-100 dark:bg-ink-800'}`}
        >
          <Text
            className={`text-sm font-semibold ${active ? 'text-white dark:text-ink' : 'text-gray-600 dark:text-gray-300'}`}
          >
            {opt.label}
          </Text>
        </Pressable>
      );
    })}
  </ScrollView>
);
