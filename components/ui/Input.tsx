import { TextInput, View, TextInputProps } from 'react-native';
import { ReactNode } from 'react';

interface InputProps extends TextInputProps {
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({
  className = '',
  leftIcon,
  rightIcon,
  ...props
}: InputProps) {
  return (
    <View className="relative">
      {leftIcon && (
        <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
          {leftIcon}
        </View>
      )}
      <TextInput
        className={`h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 text-base text-gray-900 dark:text-white ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {rightIcon && (
        <View className="absolute right-3 top-0 bottom-0 justify-center z-10">
          {rightIcon}
        </View>
      )}
    </View>
  );
}
