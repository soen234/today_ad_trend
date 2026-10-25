import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart3, Bell, Lightbulb, Newspaper } from 'lucide-react-native';
import { BrandMark } from '@/components/BrandMark';
import { RolePicker } from '@/components/RolePicker';
import { TimeChips } from '@/components/TimeChips';
import { COLORS } from '@/lib/config';
import { ensurePermission, scheduleDailyBrief } from '@/lib/notifications';
import { usePrefs, type BriefTime } from '@/stores/prefsStore';
import type { Role } from '@/types';

const VALUE_POINTS = [
  { icon: Newspaper, color: COLORS.sky, title: 'A 3-minute brief every morning', body: '5–7 things that changed in ads, picked for your role. Then you are done.' },
  { icon: Lightbulb, color: COLORS.amber, title: '"So what" for every item', body: 'One line on what it means for your campaigns, not just what happened.' },
  { icon: BarChart3, color: COLORS.rose, title: 'Creative Pulse', body: 'Weekly patterns from real ads in the Google Ads Transparency Center.' },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRoleDraft] = useState<Role | null>(null);
  const [time, setTime] = useState<BriefTime>({ hour: 8, minute: 0 });
  const [busy, setBusy] = useState(false);
  const { setRole, setBriefTime, setRemindersEnabled, completeOnboarding } = usePrefs();

  const finish = async (withReminder: boolean) => {
    if (!role || busy) return;
    setBusy(true);
    setRole(role);
    setBriefTime(time);
    let enabled = false;
    if (withReminder) {
      enabled = await ensurePermission().catch(() => false);
      if (enabled) await scheduleDailyBrief(time.hour, time.minute, role).catch(() => undefined);
    }
    setRemindersEnabled(enabled);
    completeOnboarding();
    router.replace('/');
  };

  const primary =
    step === 0
      ? { label: 'Get started', onPress: () => setStep(1), disabled: false }
      : step === 1
        ? { label: 'Continue', onPress: () => setStep(2), disabled: role === null }
        : { label: 'Remind me every day', onPress: () => finish(true), disabled: busy };

  return (
    <View className="flex-1 bg-[#F5F7FA] dark:bg-ink-950" style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 12 }}>
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }}>
        <View className="flex-row mb-6 gap-1.5">
          {[0, 1, 2].map((i) => (
            <View key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-signal' : 'bg-gray-200 dark:bg-ink-700'}`} />
          ))}
        </View>

        {step === 0 ? (
          <View>
            <BrandMark size={56} />
            <Text className="text-[32px] leading-[38px] font-extrabold text-gray-900 dark:text-white mt-6">
              What changed in advertising today.
            </Text>
            <Text className="text-lg leading-7 text-gray-600 dark:text-gray-300 mt-2">And what it means for you.</Text>
            <View className="mt-8 gap-[18px]">
              {VALUE_POINTS.map(({ icon: Icon, color, title, body }) => (
                <View key={title} className="flex-row">
                  <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${color}1F` }}>
                    <Icon size={20} color={color} />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-bold text-gray-900 dark:text-white">{title}</Text>
                    <Text className="text-sm leading-5 text-gray-600 dark:text-gray-300 mt-0.5">{body}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {step === 1 ? (
          <View>
            <Text className="text-[28px] leading-[34px] font-extrabold text-gray-900 dark:text-white">What do you do?</Text>
            <Text className="text-base leading-6 text-gray-600 dark:text-gray-300 mt-2 mb-6">
              We pick stories and write the "so what" for your job. You can change this any time.
            </Text>
            <RolePicker value={role} onChange={setRoleDraft} />
          </View>
        ) : null}

        {step === 2 ? (
          <View>
            <View className="w-12 h-12 rounded-2xl items-center justify-center bg-signal-50 dark:bg-signal-700/20 mb-5">
              <Bell size={24} color={COLORS.signal} />
            </View>
            <Text className="text-[28px] leading-[34px] font-extrabold text-gray-900 dark:text-white">When should we nudge you?</Text>
            <Text className="text-base leading-6 text-gray-600 dark:text-gray-300 mt-2 mb-6">
              One quiet reminder a day, in your time zone. No other notifications.
            </Text>
            <TimeChips value={time} onChange={setTime} />
          </View>
        ) : null}
      </ScrollView>

      <View className="px-6">
        <Pressable
          onPress={primary.onPress}
          disabled={primary.disabled}
          accessibilityRole="button"
          className={`h-14 rounded-2xl items-center justify-center ${primary.disabled ? 'bg-gray-300 dark:bg-ink-700' : 'bg-ink dark:bg-signal'}`}
        >
          <Text className="text-base font-bold text-white">{primary.label}</Text>
        </Pressable>
        {step === 2 ? (
          <Pressable onPress={() => finish(false)} disabled={busy} accessibilityRole="button" className="h-12 items-center justify-center mt-1">
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">Not now</Text>
          </Pressable>
        ) : step > 0 ? (
          <Pressable onPress={() => setStep(step - 1)} accessibilityRole="button" className="h-12 items-center justify-center mt-1">
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">Back</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
