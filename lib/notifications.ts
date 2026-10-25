import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { roleMeta } from '@/lib/config';
import type { Role } from '@/types';

const BRIEF_ID = 'daily-brief';
const CHANNEL_ID = 'daily-brief';
const supported = Platform.OS === 'ios' || Platform.OS === 'android';

export const configureNotifications = async (): Promise<void> => {
  if (!supported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Daily brief',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
};

export const ensurePermission = async (): Promise<boolean> => {
  if (!supported) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

// 서버 푸시 없이 기기에서 매일 같은 시각에 알림을 예약한다 (설계 문서 §3 Push)
export const scheduleDailyBrief = async (hour: number, minute: number, role: Role): Promise<void> => {
  if (!supported) return;
  await cancelDailyBrief();
  await Notifications.scheduleNotificationAsync({
    identifier: BRIEF_ID,
    content: {
      title: 'Your 3-minute brief is ready',
      body: `Today's ${roleMeta(role).short.toLowerCase()} brief: what changed in ads and what to do about it.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: CHANNEL_ID,
    },
  });
};

export const onBriefNotificationOpened = (handler: () => void): (() => void) => {
  if (!supported) return () => undefined;
  const sub = Notifications.addNotificationResponseReceivedListener(handler);
  return () => sub.remove();
};

export const cancelDailyBrief = async (): Promise<void> => {
  if (!supported) return;
  await Notifications.cancelScheduledNotificationAsync(BRIEF_ID).catch(() => undefined);
};
