import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: ReactNode;
}

export function Button({
  children,
  variant = 'default',
  size = 'default',
  onPress,
  disabled = false,
  loading = false,
  className = '',
  icon,
}: ButtonProps) {
  const baseStyle = 'flex-row items-center justify-center rounded-lg';

  const variantStyles: Record<string, string> = {
    default: 'bg-gray-900 dark:bg-white',
    secondary: 'bg-gray-100 dark:bg-gray-800',
    outline: 'border border-gray-300 dark:border-gray-600 bg-transparent',
    ghost: 'bg-transparent',
    destructive: 'bg-red-500',
  };

  const textStyles: Record<string, string> = {
    default: 'text-white dark:text-gray-900',
    secondary: 'text-gray-900 dark:text-white',
    outline: 'text-gray-900 dark:text-white',
    ghost: 'text-gray-900 dark:text-white',
    destructive: 'text-white',
  };

  const sizeStyles: Record<string, string> = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3',
    lg: 'h-12 px-6',
    icon: 'h-10 w-10',
  };

  const textSizeStyles: Record<string, string> = {
    default: 'text-sm',
    sm: 'text-xs',
    lg: 'text-base',
    icon: 'text-sm',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? 'opacity-50' : ''} ${className}`}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : disabled ? 0.5 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'default' ? '#fff' : '#000'}
        />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          {typeof children === 'string' ? (
            <Text className={`font-medium ${textStyles[variant]} ${textSizeStyles[size]}`}>
              {children}
            </Text>
          ) : (
            children
          )}
        </>
      )}
    </Pressable>
  );
}
