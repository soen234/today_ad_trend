import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import '../global.css';

import { useColorScheme } from '@/components/useColorScheme';
import { initAds } from '@/lib/admob';
import { configureNotifications } from '@/lib/notifications';
import { QueryProvider } from '@/providers/QueryProvider';
import { usePrefs } from '@/stores/prefsStore';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync().catch(() => undefined);

// AsyncStorage에서 설정을 다 읽어온 뒤에야 온보딩 여부를 판단할 수 있다
const useHydrated = () => {
  const [hydrated, setHydrated] = useState(usePrefs.persist.hasHydrated());
  useEffect(() => {
    const unsub = usePrefs.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(usePrefs.persist.hasHydrated());
    return unsub;
  }, []);
  return hydrated;
};

export default function RootLayout() {
  const hydrated = useHydrated();
  const colorScheme = useColorScheme();

  useEffect(() => {
    configureNotifications().catch(() => undefined);
    initAds().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync().catch(() => undefined);
  }, [hydrated]);

  if (!hydrated) return null;

  const dark = colorScheme === 'dark';
  const theme = dark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: '#06111C', card: '#0B1B2B' } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#F5F7FA' } };

  return (
    <QueryProvider>
      <ThemeProvider value={theme}>
        <StatusBar style={dark ? 'light' : 'dark'} />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }} />
        </Stack>
      </ThemeProvider>
    </QueryProvider>
  );
}
