import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View className="flex-1 items-center justify-center p-6 bg-[#F5F7FA] dark:bg-ink-950">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">This screen doesn't exist.</Text>
        <Link href="/" className="mt-4 py-3">
          <Text className="text-sm font-semibold text-signal-600">Go to today's brief</Text>
        </Link>
      </View>
    </>
  );
}
