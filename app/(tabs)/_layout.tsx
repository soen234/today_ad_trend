import { Platform } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { Bookmark, Compass, Settings, Sunrise } from 'lucide-react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { COLORS } from '@/lib/config';
import { usePrefs } from '@/stores/prefsStore';

export default function TabLayout() {
  const onboarded = usePrefs((s) => s.onboarded);
  const dark = useColorScheme() === 'dark';

  if (!onboarded) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: dark ? '#FFFFFF' : COLORS.ink,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: dark ? '#0B1B2B' : '#FFFFFF',
          borderTopColor: dark ? '#1A344D' : '#EAECF0',
          // 웹에는 하단 safe area가 없어 라벨 아래가 잘리므로 높이를 조금 준다
          ...(Platform.OS === 'web' ? { height: 60, paddingBottom: 8 } : null),
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: ({ color, size }) => <Sunrise color={color} size={size} /> }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: ({ color, size }) => <Compass color={color} size={size} /> }} />
      <Tabs.Screen name="saved" options={{ title: 'Saved', tabBarIcon: ({ color, size }) => <Bookmark color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} />
    </Tabs>
  );
}
