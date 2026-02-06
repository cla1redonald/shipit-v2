import { View, TouchableOpacity } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

export function Card({ children, onPress, className = '' }: CardProps) {
  const style = `bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${className}`;

  if (onPress) {
    return (
      <TouchableOpacity className={style} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={style}>
      {children}
    </View>
  );
}
