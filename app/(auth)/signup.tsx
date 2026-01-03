import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { signUp, isLoading } = useAuthStore();

  const validate = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};

    if (!email) {
      newErrors.email = 'Please enter your email';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Please enter your password';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    const { error } = await signUp(email, password);
    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else {
      Alert.alert('Sign Up Complete', 'Your account has been created.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            className="absolute top-4 left-0 p-2 z-10"
          >
            <ArrowLeft size={24} color="#6B7280" />
          </Pressable>

          {/* Logo */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-blue-500 rounded-2xl items-center justify-center mb-4">
              <Sparkles size={32} color="white" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              TAT
            </Text>
          </View>

          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Sign Up
            </Text>
            <Text className="text-base text-gray-500 dark:text-gray-400">
              Create an account to save and manage ads
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4 mb-6">
            {/* Email */}
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </Text>
              <Input
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                placeholder="example@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                leftIcon={<Mail size={20} color="#9CA3AF" />}
              />
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
              )}
            </View>

            {/* Password */}
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </Text>
              <Input
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                placeholder="At least 6 characters"
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                leftIcon={<Lock size={20} color="#9CA3AF" />}
                rightIcon={
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff size={20} color="#9CA3AF" />
                    ) : (
                      <Eye size={20} color="#9CA3AF" />
                    )}
                  </Pressable>
                }
              />
              {errors.password && (
                <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </Text>
              <Input
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword)
                    setErrors({ ...errors, confirmPassword: undefined });
                }}
                placeholder="Re-enter password"
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
                leftIcon={<Lock size={20} color="#9CA3AF" />}
                rightIcon={
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#9CA3AF" />
                    ) : (
                      <Eye size={20} color="#9CA3AF" />
                    )}
                  </Pressable>
                }
              />
              {errors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword}</Text>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <Button onPress={handleSignup} loading={isLoading} className="mb-6">
            Sign Up
          </Button>

          {/* Links */}
          <View className="flex-row justify-center items-center">
            <Text className="text-gray-500 dark:text-gray-400">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="text-blue-500 font-medium">Login</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
