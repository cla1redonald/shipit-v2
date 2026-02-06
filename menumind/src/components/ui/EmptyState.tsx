import { View, Text } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-xl font-semibold text-gray-900 text-center mb-2">{title}</Text>
      <Text className="text-base text-gray-500 text-center mb-6">{description}</Text>
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} fullWidth={false} />
      )}
    </View>
  );
}
