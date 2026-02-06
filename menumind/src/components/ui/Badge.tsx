import { View, Text } from 'react-native';
import type { DishClassification, ConfidenceLevel } from '../../types';

interface ClassificationBadgeProps {
  classification: DishClassification;
  size?: 'sm' | 'md' | 'lg';
}

const classificationConfig = {
  safe: { bg: 'bg-safe-light', text: 'text-safe-dark', label: 'Safe', icon: '✓' },
  caution: { bg: 'bg-caution-light', text: 'text-caution-dark', label: 'Caution', icon: '!' },
  avoid: { bg: 'bg-avoid-light', text: 'text-avoid-dark', label: 'Avoid', icon: '✕' },
};

export function ClassificationBadge({ classification, size = 'md' }: ClassificationBadgeProps) {
  const config = classificationConfig[classification];
  const sizeStyles = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
    lg: 'px-4 py-2',
  };
  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <View className={`${config.bg} ${sizeStyles[size]} rounded-full flex-row items-center gap-1`}>
      <Text className={`${config.text} ${textSize[size]} font-bold`}>{config.icon}</Text>
      <Text className={`${config.text} ${textSize[size]} font-semibold`}>{config.label}</Text>
    </View>
  );
}

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
}

const confidenceConfig = {
  high: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'High confidence' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Medium confidence' },
  low: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Low — ask server' },
};

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const config = confidenceConfig[confidence];
  return (
    <View className={`${config.bg} px-2 py-0.5 rounded-full`}>
      <Text className={`${config.text} text-xs font-medium`}>{config.label}</Text>
    </View>
  );
}
