import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'text';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  icon,
}: ButtonProps) {
  const baseStyle = 'py-4 px-6 rounded-2xl flex-row items-center justify-center';
  const variantStyles = {
    primary: 'bg-brand',
    secondary: 'bg-gray-100',
    outline: 'border-2 border-brand bg-transparent',
    danger: 'bg-avoid',
    text: 'bg-transparent',
  };
  const textStyles = {
    primary: 'text-white font-semibold text-base',
    secondary: 'text-gray-900 font-semibold text-base',
    outline: 'text-brand-dark font-semibold text-base',
    danger: 'text-white font-semibold text-base',
    text: 'text-brand font-semibold text-base',
  };

  return (
    <TouchableOpacity
      className={`${baseStyle} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : '#10B981'} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className={textStyles[variant]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
