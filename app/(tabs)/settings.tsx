import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  Moon,
  Bell,
  Globe,
  FileText,
  Shield,
  HelpCircle,
  ChevronRight,
  LogOut,
} from 'lucide-react-native';
import { useUIStore } from '@/stores/uiStore';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showArrow?: boolean;
}

function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  showArrow = true,
}: SettingItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-4 px-4 bg-white dark:bg-gray-800"
      style={({ pressed }) => ({
        opacity: pressed && onPress ? 0.7 : 1,
      })}
    >
      <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mr-3">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-base text-gray-900 dark:text-white">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement}
      {showArrow && onPress && (
        <ChevronRight size={20} color="#9CA3AF" />
      )}
    </Pressable>
  );
}

function SettingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-6">
      <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 px-4 mb-2 uppercase">
        {title}
      </Text>
      <View className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mx-4">
        {children}
      </View>
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-gray-100 dark:bg-gray-700 ml-16" />;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode, toggleDarkMode, language, setLanguage } = useUIStore();

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">설정</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Section */}
        <SettingSection title="계정">
          <Pressable
            className="flex-row items-center p-4"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <View className="w-14 h-14 rounded-full bg-blue-500 items-center justify-center mr-4">
              <User size={28} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-medium text-gray-900 dark:text-white">
                로그인
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                로그인하고 더 많은 기능을 사용하세요
              </Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </Pressable>
        </SettingSection>

        {/* App Settings */}
        <SettingSection title="앱 설정">
          <SettingItem
            icon={<Moon size={20} color="#6B7280" />}
            title="다크 모드"
            showArrow={false}
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#fff"
              />
            }
          />
          <Divider />
          <SettingItem
            icon={<Bell size={20} color="#6B7280" />}
            title="알림 설정"
            subtitle="푸시 알림 받기"
            onPress={() => {}}
          />
          <Divider />
          <SettingItem
            icon={<Globe size={20} color="#6B7280" />}
            title="언어"
            subtitle={language === 'ko' ? '한국어' : 'English'}
            onPress={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
          />
        </SettingSection>

        {/* Information */}
        <SettingSection title="정보">
          <SettingItem
            icon={<FileText size={20} color="#6B7280" />}
            title="이용약관"
            onPress={() => {}}
          />
          <Divider />
          <SettingItem
            icon={<Shield size={20} color="#6B7280" />}
            title="개인정보처리방침"
            onPress={() => {}}
          />
          <Divider />
          <SettingItem
            icon={<HelpCircle size={20} color="#6B7280" />}
            title="문의하기"
            onPress={() => {}}
          />
        </SettingSection>

        {/* App Info */}
        <View className="px-4 mb-6">
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
              애드 트렌드 v1.0.0
            </Text>
            <Text className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
              광고 데이터는 매일 업데이트됩니다
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
