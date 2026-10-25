import { ReactNode, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, Globe, Mail, Rss, Shield } from 'lucide-react-native';
import { RolePicker } from '@/components/RolePicker';
import { TimeChips } from '@/components/TimeChips';
import { useLatest } from '@/hooks/useBriefData';
import { COLORS, CONTACT_EMAIL, PRIVACY_URL, sectionMeta, WEBSITE_URL } from '@/lib/config';
import { cancelDailyBrief, ensurePermission, scheduleDailyBrief } from '@/lib/notifications';
import { openUrl } from '@/lib/open';
import { usePrefs, type BriefTime } from '@/stores/prefsStore';
import type { Role } from '@/types';

interface GroupProps {
  title: string;
  children: ReactNode;
}

const Group = ({ title, children }: GroupProps) => (
  <View className="mb-6">
    <Text className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 px-1">{title}</Text>
    {children}
  </View>
);

interface LinkRowProps {
  icon: ReactNode;
  label: string;
  detail?: string;
  onPress: () => void;
}

const LinkRow = ({ icon, label, detail, onPress }: LinkRowProps) => (
  <Pressable onPress={onPress} accessibilityRole="button" className="flex-row items-center px-4 py-3.5 border-b border-gray-100 dark:border-ink-700">
    {icon}
    <View className="flex-1 ml-3">
      <Text className="text-base text-gray-900 dark:text-white">{label}</Text>
      {detail ? <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{detail}</Text> : null}
    </View>
    <ChevronRight size={18} color={COLORS.muted} />
  </Pressable>
);

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { role, briefTime, remindersEnabled, setRole, setBriefTime, setRemindersEnabled } = usePrefs();
  const latest = useLatest();
  const [showSources, setShowSources] = useState(false);

  const reschedule = async (nextTime: BriefTime, nextRole: Role) => {
    if (remindersEnabled) await scheduleDailyBrief(nextTime.hour, nextTime.minute, nextRole).catch(() => undefined);
  };

  const onRole = (next: Role) => {
    setRole(next);
    reschedule(briefTime, next);
  };

  const onTime = (next: BriefTime) => {
    setBriefTime(next);
    reschedule(next, role);
  };

  const onToggleReminders = async (value: boolean) => {
    if (!value) {
      setRemindersEnabled(false);
      await cancelDailyBrief();
      return;
    }
    const granted = await ensurePermission().catch(() => false);
    if (!granted) {
      Alert.alert('Notifications are off', 'Allow notifications for Today Ad Trend in Settings to get your daily reminder.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    setRemindersEnabled(true);
    await scheduleDailyBrief(briefTime.hour, briefTime.minute, role).catch(() => undefined);
  };

  const sources = latest.data?.sources ?? [];

  return (
    <View className="flex-1 bg-[#F5F7FA] dark:bg-ink-950" style={{ paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 32 }}>
        <Text className="text-[26px] font-extrabold text-gray-900 dark:text-white mb-5">Settings</Text>

        <Group title="Your brief">
          <RolePicker value={role} onChange={onRole} />
        </Group>

        <Group title="Daily reminder">
          <View className="bg-white dark:bg-ink-800 rounded-2xl border border-gray-100 dark:border-ink-700 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-base font-semibold text-gray-900 dark:text-white">Remind me every day</Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">One notification, in your time zone.</Text>
              </View>
              <Switch
                value={remindersEnabled}
                onValueChange={onToggleReminders}
                trackColor={{ true: COLORS.signal, false: '#D0D5DD' }}
                accessibilityLabel="Daily reminder"
              />
            </View>
            {remindersEnabled ? (
              <View className="mt-4">
                <TimeChips value={briefTime} onChange={onTime} />
              </View>
            ) : null}
          </View>
        </Group>

        <Group title="About">
          <View className="bg-white dark:bg-ink-800 rounded-2xl border border-gray-100 dark:border-ink-700 overflow-hidden">
            <LinkRow
              icon={<Rss size={20} color={COLORS.sky} />}
              label="Sources"
              detail={sources.length ? `${sources.length} publishers and official blogs` : undefined}
              onPress={() => setShowSources((v) => !v)}
            />
            {showSources
              ? sources.map((s) => (
                  <Pressable
                    key={s.url}
                    onPress={() => openUrl(s.url).catch(() => undefined)}
                    accessibilityRole="link"
                    className="flex-row items-center px-4 py-2.5 border-b border-gray-100 dark:border-ink-700"
                  >
                    <View className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: sectionMeta(s.section).color }} />
                    <Text className="text-sm text-gray-700 dark:text-gray-200 flex-1">{s.name}</Text>
                    <Text className="text-xs text-gray-400">{sectionMeta(s.section).label}</Text>
                  </Pressable>
                ))
              : null}
            <LinkRow icon={<Globe size={20} color={COLORS.signal} />} label="Website" detail="todayadtrend.com" onPress={() => openUrl(WEBSITE_URL).catch(() => undefined)} />
            <LinkRow icon={<Shield size={20} color={COLORS.violet} />} label="Privacy policy" onPress={() => openUrl(PRIVACY_URL).catch(() => undefined)} />
            <LinkRow
              icon={<Mail size={20} color={COLORS.amber} />}
              label="Send feedback"
              detail={CONTACT_EMAIL}
              onPress={() =>
                Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('[Today Ad Trend] Feedback')}`).catch(() =>
                  Alert.alert('Send feedback', `Email us at ${CONTACT_EMAIL}`)
                )
              }
            />
          </View>
        </Group>

        <Text className="text-xs text-center text-gray-400 dark:text-gray-500 leading-[18px] px-4">
          Today Ad Trend {Constants.expoConfig?.version ?? ''}{'\n'}Summaries are AI-generated from public sources and link to the original.
          Your settings, saved items and watchlist stay on this device.
        </Text>
      </ScrollView>
    </View>
  );
}
