import { Pressable, Text, View } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { COLORS, ROLES } from '@/lib/config';
import type { Role } from '@/types';

interface RolePickerProps {
  value: Role | null;
  onChange: (role: Role) => void;
}

export const RolePicker = ({ value, onChange }: RolePickerProps) => (
  <View className="gap-2.5">
    {ROLES.map((r) => {
      const active = r.key === value;
      return (
        <Pressable
          key={r.key}
          onPress={() => onChange(r.key)}
          accessibilityRole="radio"
          accessibilityState={{ selected: active }}
          className={`flex-row items-center rounded-2xl p-4 border ${
            active ? 'border-signal bg-signal-50 dark:bg-signal-700/20' : 'border-gray-200 dark:border-ink-600 bg-white dark:bg-ink-800'
          }`}
        >
          <View className="flex-1 pr-3">
            <Text className="text-base font-bold text-gray-900 dark:text-white">{r.label}</Text>
            <Text className="text-sm leading-5 text-gray-600 dark:text-gray-300 mt-0.5">{r.description}</Text>
          </View>
          {active ? <CheckCircle2 size={22} color={COLORS.signal} /> : <Circle size={22} color={COLORS.muted} />}
        </Pressable>
      );
    })}
  </View>
);
