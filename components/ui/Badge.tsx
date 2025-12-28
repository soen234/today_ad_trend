import { View, Text, Pressable, ViewStyle, TextStyle } from 'react-native';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  className?: string;
  onPress?: () => void;
}

export function Badge({ children, variant = 'default', className = '', onPress }: BadgeProps) {
  const baseStyle = 'px-2 py-0.5 rounded-md flex-row items-center';

  const variantStyles: Record<string, string> = {
    default: 'bg-gray-900 dark:bg-white',
    secondary: 'bg-gray-100 dark:bg-gray-800',
    outline: 'border border-gray-300 dark:border-gray-600 bg-transparent',
    destructive: 'bg-red-500',
  };

  const textStyles: Record<string, string> = {
    default: 'text-white dark:text-gray-900',
    secondary: 'text-gray-900 dark:text-white',
    outline: 'text-gray-900 dark:text-white',
    destructive: 'text-white',
  };

  const Component = onPress ? Pressable : View;

  return (
    <Component
      onPress={onPress}
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
    >
      {typeof children === 'string' ? (
        <Text className={`text-xs font-medium ${textStyles[variant]}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Component>
  );
}
