import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'text';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const variantContainerStyles: Record<string, ViewStyle> = {
  primary: { backgroundColor: '#10B981' },
  secondary: { backgroundColor: '#F3F4F6' },
  outline: { borderWidth: 2, borderColor: '#10B981', backgroundColor: 'transparent' },
  danger: { backgroundColor: '#EF4444' },
  text: { backgroundColor: 'transparent' },
};

const variantTextStyles: Record<string, TextStyle> = {
  primary: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  secondary: { color: '#111827', fontWeight: '600', fontSize: 16 },
  outline: { color: '#065F46', fontWeight: '600', fontSize: 16 },
  danger: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  text: { color: '#10B981', fontWeight: '600', fontSize: 16 },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  icon,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantContainerStyles[variant],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : '#10B981'} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={variantTextStyles[variant]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
