import { View, Text, ScrollView, Pressable, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  FileText,
  Shield,
  HelpCircle,
  ChevronRight,
  LogOut,
  Mail,
  Trash2,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';

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
  const router = useRouter();
  const { user, signOut, deleteAccount, isLoading } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Second confirmation for safety
            Alert.alert(
              'Confirm Deletion',
              'This will permanently delete your account. Are you absolutely sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete My Account',
                  style: 'destructive',
                  onPress: async () => {
                    const { error } = await deleteAccount();
                    if (error) {
                      Alert.alert('Error', error.message || 'Failed to delete account. Please try again.');
                    } else {
                      Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Settings</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Section */}
        <SettingSection title="Account">
          {user ? (
            // Logged in state
            <View>
              <View className="flex-row items-center p-4">
                <View className="w-14 h-14 rounded-full bg-blue-500 items-center justify-center mr-4">
                  <User size={28} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-medium text-gray-900 dark:text-white">
                    {user.email?.split('@')[0] || 'User'}
                  </Text>
                  <View className="flex-row items-center mt-0.5">
                    <Mail size={14} color="#9CA3AF" />
                    <Text className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      {user.email}
                    </Text>
                  </View>
                </View>
              </View>
              <Divider />
              <Pressable
                onPress={handleLogout}
                disabled={isLoading}
                className="flex-row items-center py-4 px-4"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <View className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 items-center justify-center mr-3">
                  <LogOut size={20} color="#EF4444" />
                </View>
                <Text className="text-base text-red-500">Logout</Text>
              </Pressable>
              <Divider />
              <Pressable
                onPress={handleDeleteAccount}
                disabled={isLoading}
                className="flex-row items-center py-4 px-4"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <View className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 items-center justify-center mr-3">
                  <Trash2 size={20} color="#EF4444" />
                </View>
                <Text className="text-base text-red-500">Delete Account</Text>
              </Pressable>
            </View>
          ) : (
            // Logged out state
            <Pressable
              onPress={() => router.push('/(auth)/login')}
              className="flex-row items-center p-4"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View className="w-14 h-14 rounded-full bg-blue-500 items-center justify-center mr-4">
                <User size={28} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-medium text-gray-900 dark:text-white">
                  Login
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Sign in to use more features
                </Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </Pressable>
          )}
        </SettingSection>

        {/* Information */}
        <SettingSection title="Information">
          <SettingItem
            icon={<FileText size={20} color="#6B7280" />}
            title="Terms of Service"
            onPress={() => Linking.openURL('https://brave-lifter-325.notion.site/Terms-of-Service-for-TAT-Today-Ad-Trend-2d8662e222b880b098b6f8e5e4278f6d')}
          />
          <Divider />
          <SettingItem
            icon={<Shield size={20} color="#6B7280" />}
            title="Privacy Policy"
            onPress={() => Linking.openURL('https://brave-lifter-325.notion.site/Privacy-Policy-for-TAT-Today-Ad-Trend-2d8662e222b880f4be19c5d43d33de85')}
          />
          <Divider />
          <SettingItem
            icon={<HelpCircle size={20} color="#6B7280" />}
            title="Contact Us"
            subtitle="soen234@gmail.com"
            onPress={async () => {
              const email = 'mailto:soen234@gmail.com?subject=[TAT] Inquiry';
              const canOpen = await Linking.canOpenURL(email);
              if (canOpen) {
                await Linking.openURL(email);
              } else {
                Alert.alert('Contact Us', 'soen234@gmail.com', [
                  { text: 'OK' },
                ]);
              }
            }}
          />
        </SettingSection>

        {/* App Info */}
        <View className="px-4 mb-6">
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
              TAT v1.0.0
            </Text>
            <Text className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
              Ad data updated daily
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
